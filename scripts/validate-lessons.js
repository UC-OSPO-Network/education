import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isHttpUrl, isSlugToken } from './lib/dependency-normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LESSON_DIR = path.resolve(__dirname, '..', 'src', 'content', 'lessons');
const PATHWAYS_FILE = path.resolve(__dirname, '..', 'src', 'types', 'lesson.ts');

const REQUIRED_FIELDS = ['name', 'slug', 'description', 'url'];
const ALLOWED_EDUCATIONAL_LEVELS = new Set(['Beginner', 'Intermediate', 'Advanced']);
const FALLBACK_LEARNER_CATEGORIES = new Set([
  'Getting Started with Open Source',
  'Contributing to a Project',
  'Maintaining & Sustaining Software',
  'Building Community',
  'Understanding Licensing & Compliance',
  'Strategic Practices & Career Development',
]);

const DEFAULT_URL_TIMEOUT_MS = 9000;
const DEFAULT_URL_RETRIES = 2;
const DEFAULT_URL_CONCURRENCY = 4;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const [keyPart, valuePart] = token.split('=');
    const key = keyPart.slice(2);

    if (valuePart !== undefined) {
      args[key] = valuePart;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function parseIntegerOption(name, value, defaultValue) {
  if (value === undefined) return defaultValue;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid --${name} value: "${value}"`);
  }
  return parsed;
}

function normalizePath(input) {
  return String(input || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '');
}

function normalizePathList(paths) {
  return Array.from(new Set(paths.map(normalizePath).filter(Boolean))).sort();
}

function parseChangedFilesPayload(raw) {
  const text = String(raw || '').trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return normalizePathList(parsed.filter((item) => typeof item === 'string'));
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.files)) {
      return normalizePathList(parsed.files.filter((item) => typeof item === 'string'));
    }
  } catch {
    // Fallback to line-based parsing below.
  }

  return normalizePathList(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

async function resolveChangedFiles(rawOption) {
  if (!rawOption) return null;

  const maybePath = path.resolve(process.cwd(), rawOption);
  if (existsSync(maybePath)) {
    const fileContent = await readFile(maybePath, 'utf8');
    return parseChangedFilesPayload(fileContent);
  }

  return parseChangedFilesPayload(rawOption);
}

function safeExecGit(args) {
  try {
    const output = execFileSync('git', args, {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output;
  } catch {
    return '';
  }
}

function detectLocalChangedFiles() {
  const unstaged = safeExecGit(['diff', '--name-only', '--diff-filter=ACMRTUXB', 'HEAD']);
  const staged = safeExecGit(['diff', '--cached', '--name-only', '--diff-filter=ACMRTUXB']);
  const untracked = safeExecGit(['ls-files', '--others', '--exclude-standard']);
  const combined = [unstaged, staged, untracked].filter(Boolean).join('\n');

  if (!combined.trim()) {
    return { available: true, files: [] };
  }

  const files = normalizePathList(combined.split(/\r?\n/));
  return { available: true, files };
}

function isNumericDependencyToken(value) {
  return /^\d+(?:\s*[–—-]\s*.+)?$/.test(value.trim());
}

function getSlugFromFilename(file) {
  return file.replace(/\.json$/i, '').trim();
}

function lessonPath(file) {
  return normalizePath(`src/content/lessons/${file}`);
}

function buildIssue(rule, file, slug, message, extra = {}) {
  return {
    rule,
    file,
    slug,
    message,
    ...extra,
  };
}

function statusFamily(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500 && statusCode < 600) return '5xx';
  return 'other';
}

function isSuccessStatus(statusCode) {
  return statusCode >= 200 && statusCode < 400;
}

async function fetchWithTimeout(url, method, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'uc-ospo-lesson-validator/1.0',
      },
    });
    return { ok: true, status: response.status, method, finalUrl: response.url };
  } catch (error) {
    return {
      ok: false,
      method,
      error: error?.name === 'AbortError' ? 'timeout' : error?.message || 'network error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkUrlAccessibility(url, timeoutMs, retries) {
  const attempts = [];
  const maxAttempts = retries + 1;

  for (let attemptIndex = 0; attemptIndex < maxAttempts; attemptIndex += 1) {
    const attemptNumber = attemptIndex + 1;
    const headResult = await fetchWithTimeout(url, 'HEAD', timeoutMs);
    attempts.push({ attempt: attemptNumber, ...headResult });

    if (headResult.ok && isSuccessStatus(headResult.status)) {
      return {
        outcome: 'success',
        statusCode: headResult.status,
        attempts,
        finalUrl: headResult.finalUrl || url,
      };
    }

    const getResult = await fetchWithTimeout(url, 'GET', timeoutMs);
    attempts.push({ attempt: attemptNumber, ...getResult });

    if (getResult.ok && isSuccessStatus(getResult.status)) {
      return {
        outcome: 'success',
        statusCode: getResult.status,
        attempts,
        finalUrl: getResult.finalUrl || url,
      };
    }

    if (getResult.ok) {
      return {
        outcome: 'confirmed-http-failure',
        statusCode: getResult.status,
        attempts,
        finalUrl: getResult.finalUrl || url,
      };
    }
  }

  const lastAttempt = attempts[attempts.length - 1];
  return {
    outcome: 'transient-failure',
    statusCode: null,
    attempts,
    finalUrl: url,
    error: lastAttempt?.error || 'network failure',
  };
}

async function runWithConcurrency(items, concurrency, mapper) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function loadLessonFiles() {
  const files = (await readdir(LESSON_DIR))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const lessons = [];

  for (const file of files) {
    const filePath = path.join(LESSON_DIR, file);
    const raw = await readFile(filePath, 'utf8');
    try {
      const data = JSON.parse(raw);
      lessons.push({
        file,
        path: lessonPath(file),
        fileSlug: getSlugFromFilename(file),
        data,
      });
    } catch (error) {
      throw new Error(`Invalid JSON in ${file}: ${error.message}`);
    }
  }

  return lessons;
}

async function loadValidLearnerCategories() {
  try {
    const source = await readFile(PATHWAYS_FILE, 'utf8');
    const categories = new Set();
    const blockRegex = /learnerCategories\s*:\s*\[([^\]]*)\]/gms;
    let blockMatch = blockRegex.exec(source);

    while (blockMatch) {
      const block = blockMatch[1];
      const valueRegex = /['"]([^'"]+)['"]/g;
      let valueMatch = valueRegex.exec(block);
      while (valueMatch) {
        categories.add(valueMatch[1].trim());
        valueMatch = valueRegex.exec(block);
      }
      blockMatch = blockRegex.exec(source);
    }

    if (categories.size > 0) {
      return categories;
    }
  } catch {
    // Fall back to static categories.
  }

  return new Set(FALLBACK_LEARNER_CATEGORIES);
}

async function validate() {
  const args = parseArgs(process.argv.slice(2));
  const reportJsonPath = args['report-json'] ? path.resolve(process.cwd(), String(args['report-json'])) : null;
  const softFailExternal = !!args['soft-fail-external'];
  const changedFiles = await resolveChangedFiles(args['changed-files']);
  const urlTimeoutMs = parseIntegerOption('url-timeout-ms', args['url-timeout-ms'], DEFAULT_URL_TIMEOUT_MS);
  const urlRetries = parseIntegerOption('url-retries', args['url-retries'], DEFAULT_URL_RETRIES);
  const urlConcurrency = parseIntegerOption(
    'url-concurrency',
    args['url-concurrency'],
    DEFAULT_URL_CONCURRENCY
  );

  const lessons = await loadLessonFiles();
  const validLearnerCategories = await loadValidLearnerCategories();

  let mode = 'full';
  let changedFilesSource = 'none';
  let candidateChangedFiles = [];

  if (Array.isArray(changedFiles)) {
    mode = 'delta';
    changedFilesSource = 'cli';
    candidateChangedFiles = changedFiles;
  } else if (!process.env.CI) {
    const detected = detectLocalChangedFiles();
    if (detected.available) {
      mode = 'delta';
      changedFilesSource = 'git-local';
      candidateChangedFiles = detected.files;
    }
  }

  const changedSet = new Set(candidateChangedFiles);
  const scopedLessonPaths = new Set(
    lessons
      .map((lesson) => lesson.path)
      .filter((lessonRelPath) => mode === 'full' || changedSet.has(lessonRelPath))
  );
  const changedLessonFiles = lessons
    .map((lesson) => lesson.path)
    .filter((lessonRelPath) => changedSet.has(lessonRelPath));
  const hasScopedLessons = scopedLessonPaths.size > 0;

  const blockingErrors = [];
  const warnings = [];
  const urlChecks = [];

  function isInScope(pathsForScope) {
    if (mode === 'full') return true;
    return pathsForScope.some((filePath) => scopedLessonPaths.has(filePath));
  }

  function addRuleViolation(rule, lesson, message, options = {}) {
    const scopePaths = options.scopePaths || [lesson.path];
    const issue = buildIssue(rule, lesson.path, lesson.fileSlug, message, options.extra);
    if (options.warningOnly) {
      warnings.push({ ...issue, scope: 'n/a' });
      return;
    }

    if (isInScope(scopePaths)) {
      blockingErrors.push(issue);
    } else {
      warnings.push({ ...issue, scope: 'out-of-scope', downgradedFrom: 'error' });
    }
  }

  const slugToLesson = new Map();
  let dependencyRefCount = 0;

  for (const lesson of lessons) {
    const dataSlug = String(lesson.data.slug || '').trim();
    if (!dataSlug) {
      addRuleViolation(
        'required-slug',
        lesson,
        `missing slug field (must match filename slug "${lesson.fileSlug}")`
      );
    } else if (dataSlug !== lesson.fileSlug) {
      addRuleViolation(
        'slug-mismatch',
        lesson,
        `slug field "${dataSlug}" does not match filename slug "${lesson.fileSlug}"`
      );
    }

    const effectiveSlug = dataSlug || lesson.fileSlug;
    if (!effectiveSlug) {
      addRuleViolation('missing-slug', lesson, 'missing effective lesson slug');
      continue;
    }

    if (slugToLesson.has(effectiveSlug)) {
      const original = slugToLesson.get(effectiveSlug);
      addRuleViolation(
        'duplicate-slug',
        lesson,
        `duplicate slug "${effectiveSlug}" (already in ${original.path})`,
        {
          scopePaths: [lesson.path, original.path],
        }
      );
    } else {
      slugToLesson.set(effectiveSlug, lesson);
    }
  }

  const knownSlugs = new Set(slugToLesson.keys());
  for (const lesson of lessons) {
    const { data } = lesson;

    for (const field of REQUIRED_FIELDS) {
      if (typeof data[field] !== 'string' || data[field].trim() === '') {
        addRuleViolation('required-field', lesson, `required field "${field}" must be a non-empty string`);
      }
    }

    if (typeof data.url === 'string' && data.url.trim() !== '' && !isHttpUrl(data.url.trim())) {
      addRuleViolation('invalid-url-format', lesson, `invalid URL format "${data.url}"`);
    }

    const level = String(data.educationalLevel || '').trim();
    if (!ALLOWED_EDUCATIONAL_LEVELS.has(level)) {
      addRuleViolation(
        'invalid-educational-level',
        lesson,
        `educationalLevel must be one of Beginner, Intermediate, Advanced (received "${level || 'empty'}")`
      );
    }

    const learnerCategory = String(data.learnerCategory || '').trim();
    if (learnerCategory !== '' && !validLearnerCategories.has(learnerCategory)) {
      addRuleViolation(
        'invalid-learner-category',
        lesson,
        `learnerCategory "${learnerCategory}" is not in the allowed pathway list`
      );
    }

    if (Array.isArray(data.keywords) && data.keywords.length === 0) {
      addRuleViolation(
        'empty-keywords',
        lesson,
        'keywords array is empty; add at least one keyword when available',
        { warningOnly: true }
      );
    }

    if (!Array.isArray(data.dependsOn)) {
      addRuleViolation('invalid-dependsOn-type', lesson, 'dependsOn must be an array');
      continue;
    }

    for (const token of data.dependsOn) {
      dependencyRefCount += 1;

      if (typeof token !== 'string' || token.trim() === '') {
        addRuleViolation('invalid-dependency-token', lesson, 'dependency token must be a non-empty string');
        continue;
      }

      const value = token.trim();
      if (isNumericDependencyToken(value)) {
        addRuleViolation(
          'numeric-dependency-token',
          lesson,
          `numeric dependency token is not allowed ("${value}")`
        );
        continue;
      }

      if (isHttpUrl(value)) {
        continue;
      }

      if (!isSlugToken(value)) {
        addRuleViolation('invalid-dependency-format', lesson, `invalid dependency token format ("${value}")`);
        continue;
      }

      if (!knownSlugs.has(value)) {
        addRuleViolation('unresolved-dependency-slug', lesson, `unresolved lesson slug dependency ("${value}")`);
      }
    }
  }

  const lessonsForUrlCheck = lessons.filter((lesson) => scopedLessonPaths.has(lesson.path));
  const urlCandidates = lessonsForUrlCheck
    .map((lesson) => ({
      lesson,
      url: typeof lesson.data.url === 'string' ? lesson.data.url.trim() : '',
    }))
    .filter((entry) => entry.url && isHttpUrl(entry.url));

  const urlResults = await runWithConcurrency(urlCandidates, urlConcurrency, async (entry) => {
    const result = await checkUrlAccessibility(entry.url, urlTimeoutMs, urlRetries);
    const check = {
      file: entry.lesson.path,
      slug: entry.lesson.fileSlug,
      url: entry.url,
      outcome: result.outcome,
      statusCode: result.statusCode,
      statusFamily: result.statusCode ? statusFamily(result.statusCode) : null,
      attempts: result.attempts.length,
      error: result.error || null,
    };
    urlChecks.push(check);

    if (result.outcome === 'confirmed-http-failure') {
      addRuleViolation(
        'broken-url',
        entry.lesson,
        `URL check failed with HTTP ${result.statusCode} (${entry.url})`,
        { warningOnly: softFailExternal }
      );
    } else if (result.outcome === 'transient-failure') {
      addRuleViolation(
        'url-transient-failure',
        entry.lesson,
        `URL could not be confirmed after retries (${entry.url}): ${result.error || 'network error'}`,
        { warningOnly: true }
      );
    }
  });

  const status = blockingErrors.length > 0 ? 'fail' : 'pass';
  const summary = {
    lessonsChecked: lessons.length,
    changedFilesProvided: candidateChangedFiles.length,
    changedLessonFiles: changedLessonFiles.length,
    scopedLessons: scopedLessonPaths.size,
    dependencyRefsChecked: dependencyRefCount,
    urlChecksRun: urlResults.length,
    blockingErrors: blockingErrors.length,
    warnings: warnings.length,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    status,
    mode: hasScopedLessons ? mode : 'delta-none',
    changedFilesSource,
    changedFiles: candidateChangedFiles,
    changedLessonFiles,
    summary,
    blockingErrors,
    warnings,
    urlChecks: {
      timeoutMs: urlTimeoutMs,
      retries: urlRetries,
      concurrency: urlConcurrency,
      results: urlChecks.sort((a, b) => a.file.localeCompare(b.file)),
    },
  };

  if (reportJsonPath) {
    await mkdir(path.dirname(reportJsonPath), { recursive: true });
    await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  const modeLabel = report.mode === 'delta-none' ? 'delta (no changed lesson files)' : report.mode;
  console.log(`🔎 Lesson validation mode: ${modeLabel}`);
  console.log(`📚 Lessons checked: ${summary.lessonsChecked}`);
  console.log(`🧪 Scoped lessons: ${summary.scopedLessons}`);
  console.log(`🔗 URL checks run: ${summary.urlChecksRun}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);

  if (warnings.length > 0) {
    const maxWarningsToPrint = 50;
    const warningsToPrint = warnings.slice(0, maxWarningsToPrint);
    console.warn('\n⚠️  Validation warnings:');
    warningsToPrint.forEach((warning) => {
      console.warn(`- [${warning.rule}] ${warning.file}: ${warning.message}`);
    });
    if (warnings.length > warningsToPrint.length) {
      console.warn(`- ... ${warnings.length - warningsToPrint.length} additional warning(s) not shown`);
    }
  }

  if (blockingErrors.length > 0) {
    console.error('\n❌ Lesson validation failed with blocking errors:');
    blockingErrors.forEach((error) => {
      console.error(`- [${error.rule}] ${error.file}: ${error.message}`);
    });
    console.error(`SUMMARY:${JSON.stringify(summary)}`);
    process.exit(1);
  }

  console.log('\n✅ Lesson validation passed');
  console.log(`SUMMARY:${JSON.stringify(summary)}`);
}

validate().catch((error) => {
  console.error('❌ Lesson validation crashed');
  console.error(error);
  process.exit(1);
});
