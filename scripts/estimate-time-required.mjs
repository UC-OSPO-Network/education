/**
 * Set `timeRequired` (ISO 8601 duration) for each lesson from authoritative
 * source data only. We do NOT guess.
 *
 * Policy:
 *   - Guides / references / articles are self-study reading. "Time to teach"
 *     is not meaningful for them, so we leave them alone (the site also hides
 *     the badge for these types — see teachingTime() in src/lib/lessons.ts).
 *   - Taught lessons (workshop / course / tutorial):
 *       * If the repo is a Carpentries Workbench lesson (config-driven
 *         episodes/) or a legacy "styles" lesson (_episodes/), sum the
 *         `teaching:` + `exercises:` minutes declared in each episode's
 *         frontmatter. This is the time the lesson authors published.
 *       * Otherwise there is no trustworthy source for a teaching time, so we
 *         BLANK the field rather than publish a guess. These are listed for
 *         manual follow-up.
 *
 * Source of truth is src/content/lessons/*.json. Dry-run by default; pass
 * --write to update the JSON files in place.
 *
 * Usage:
 *   GITHUB_TOKEN=... node scripts/estimate-time-required.mjs            (report only)
 *   GITHUB_TOKEN=... node scripts/estimate-time-required.mjs --write    (apply)
 *   node scripts/estimate-time-required.mjs --only=introduction-to-git  (one slug)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

/** Raised when GitHub rate-limits us, so we abort instead of writing false blanks. */
class RateLimitError extends Error {}

/** Resolve a GitHub token from the env or the gh CLI, so authed runs are the default. */
function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const t = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (t) return t;
  } catch {
    // gh not installed or not logged in — fall through to unauthenticated.
  }
  return null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessonsDir = join(__dirname, '../src/content/lessons');

const WRITE = process.argv.includes('--write');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) ?? '').split('=')[1] || null;

const SELF_STUDY_TYPES = new Set(['guide', 'reference', 'article']);

// -- duration formatting -----------------------------------------------------

function formatISO8601(minutes) {
  const m = Math.round(minutes);
  if (m < 60) return `PT${m}M`;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return mins === 0 ? `PT${hours}H` : `PT${hours}H${mins}M`;
}

// -- repo parsing (mirrors fetch-github-health.mjs) --------------------------

function parseGithubRepo(url) {
  if (!url || url === 'null') return null;
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (u.hostname === 'github.com') {
      if (parts.length < 2) return null;
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    }
    const pagesMatch = u.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
    if (pagesMatch && parts.length >= 1) {
      return { owner: pagesMatch[1], repo: parts[0] };
    }
  } catch {
    return null;
  }
  return null;
}

function getLessonSlug(file, lesson) {
  const fromLesson = typeof lesson.slug === 'string' ? lesson.slug.trim() : '';
  return fromLesson || file.replace(/\.json$/, '');
}

function getLessonRepo(lesson) {
  return parseGithubRepo(lesson.repoUrl?.trim()) ?? parseGithubRepo(lesson.url?.trim());
}

// -- GitHub helpers ----------------------------------------------------------

function assertNotRateLimited(res, where) {
  // 403/429 with no remaining quota means rate-limited — abort so we never
  // mistake "couldn't check" for "no Workbench timing" and blank a good value.
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
    const mins = reset ? Math.ceil((reset - Date.now()) / 60000) : '?';
    throw new RateLimitError(`GitHub rate limit hit at ${where}. Resets in ~${mins} min. Use a GITHUB_TOKEN or gh login.`);
  }
}

async function listDir(owner, repo, path, headers) {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encoded}`, {
    headers,
  });
  if (!res.ok) {
    assertNotRateLimited(res, `${owner}/${repo}/${path}`);
    return null; // genuine 404/other — not an episode-based lesson
  }
  const data = await res.json();
  return Array.isArray(data) ? data : null;
}

/** Parse the YAML frontmatter block of a markdown file. */
function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    const fm = yaml.load(match[1]);
    return fm && typeof fm === 'object' ? fm : null;
  } catch {
    return null;
  }
}

function minutesField(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Sum teaching + exercises minutes across a Workbench/styles lesson's episodes.
 * Returns { minutes, episodes } or null if this isn't an episode-based lesson.
 */
async function workbenchMinutes(owner, repo, headers) {
  // Workbench lessons keep episodes in episodes/; legacy styles use _episodes/.
  let entries = await listDir(owner, repo, 'episodes', headers);
  if (!entries) entries = await listDir(owner, repo, '_episodes', headers);
  if (!entries) return null;

  const episodeFiles = entries
    .filter((e) => e.type === 'file' && /\.(md|Rmd)$/i.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (episodeFiles.length === 0) return null;

  let total = 0;
  let counted = 0;
  for (const ep of episodeFiles) {
    if (!ep.download_url) continue;
    const res = await fetch(ep.download_url, { headers });
    if (!res.ok) continue;
    const fm = parseFrontmatter(await res.text());
    if (!fm) continue;
    const t = minutesField(fm.teaching);
    const x = minutesField(fm.exercises);
    if (t || x) {
      total += t + x;
      counted++;
    }
    await new Promise((r) => setTimeout(r, 80));
  }

  if (counted === 0 || total === 0) return null;
  return { minutes: total, episodes: counted };
}

// -- main --------------------------------------------------------------------

async function main() {
  const token = resolveToken();
  if (token) console.log('Using authenticated GitHub access.\n');
  else console.warn('Warning: no GITHUB_TOKEN and no gh login — unauthenticated GitHub (60 req/hr); run will abort if rate-limited.\n');
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const files = readdirSync(lessonsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const rows = [];

  for (const file of files) {
    const path = join(lessonsDir, file);
    const lesson = JSON.parse(readFileSync(path, 'utf8'));
    const slug = getLessonSlug(file, lesson);

    if (ONLY && slug !== ONLY) continue;
    if (lesson.keepStatus === 'drop') continue; // don't spend requests on dropped lessons

    const old = lesson.timeRequired || '';
    const type = (lesson.learningResourceType || '').toLowerCase().trim();

    // Self-study: leave untouched; the site already hides the teach-time badge.
    if (SELF_STUDY_TYPES.has(type)) {
      console.log(`· ${slug.padEnd(52)} ${(old || '(none)').padEnd(10)}    self-study (${type}) — left as-is`);
      rows.push({ slug, kind: 'self-study' });
      continue;
    }

    // Taught lesson: use authoritative Workbench timing, or blank it.
    const repo = getLessonRepo(lesson);
    let next = '';
    let detail = '';

    if (repo) {
      const wb = await workbenchMinutes(repo.owner, repo.repo, headers);
      if (wb) {
        next = formatISO8601(wb.minutes);
        detail = `workbench (${wb.episodes} episodes)`;
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    const blanked = !next;
    if (blanked) detail = old ? 'no Workbench timing — BLANKED (needs manual value)' : 'no Workbench timing — none';

    const changed = next !== old;
    rows.push({ slug, old, next, detail, changed, blanked: blanked && !!old });

    if (WRITE && changed) {
      lesson.timeRequired = next;
      writeFileSync(path, JSON.stringify(lesson, null, 4) + '\n');
    }

    const mark = next ? '✓' : blanked && old ? '✗' : '·';
    console.log(`${mark} ${slug.padEnd(52)} ${(old || '(none)').padEnd(10)} → ${(next || '(blank)').padEnd(10)}  ${detail}`);
  }

  const taught = rows.filter((r) => r.kind !== 'self-study');
  const authoritative = taught.filter((r) => r.next);
  const blanked = taught.filter((r) => r.blanked);
  const changes = taught.filter((r) => r.changed);

  console.log('\n' + '='.repeat(70));
  console.log(`Lessons processed:        ${rows.length}`);
  console.log(`Self-study (left as-is):  ${rows.filter((r) => r.kind === 'self-study').length}`);
  console.log(`Workbench authoritative:  ${authoritative.length}`);
  console.log(`Blanked (need manual):    ${blanked.length}`);
  console.log(`Total field changes:      ${changes.length}`);
  if (blanked.length) {
    console.log('\nBlanked — need a manually-sourced teaching time:');
    blanked.forEach((r) => console.log(`  - ${r.slug} (was ${r.old})`));
  }
  console.log(WRITE ? '\nWrote updates to JSON.' : '\nDry run — re-run with --write to apply.');
}

main().catch((err) => {
  if (err instanceof RateLimitError) {
    console.error(`\n✗ Aborted: ${err.message}\n  No files were left in a half-updated state from this point on.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
