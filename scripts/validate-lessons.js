import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isHttpUrl, isSlugToken } from './lib/dependency-normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LESSON_DIR = path.resolve(__dirname, '..', 'src', 'content', 'lessons');
const REQUIRED_FIELDS = ['name', 'slug', 'description', 'url'];

function isNumericDependencyToken(value) {
  return /^\d+(?:\s*[–—-]\s*.+)?$/.test(value.trim());
}

function isValidHttpUrl(value) {
  if (!value) return false;
  return isHttpUrl(value);
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
      lessons.push({ file, data });
    } catch (error) {
      throw new Error(`Invalid JSON in ${file}: ${error.message}`);
    }
  }

  return lessons;
}

function getSlugFromFilename(file) {
  return file.replace(/\.json$/i, '').trim();
}

async function validate() {
  const lessons = await loadLessonFiles();
  const errors = [];
  const slugToFile = new Map();
  let dependencyRefCount = 0;

  for (const lesson of lessons) {
    const fileSlug = getSlugFromFilename(lesson.file);
    const dataSlug = String(lesson.data.slug || '').trim();
    const slug = dataSlug || fileSlug;
    if (!slug) {
      errors.push(`${lesson.file}: missing slug`);
      continue;
    }
    if (!dataSlug) {
      errors.push(`${lesson.file}: missing slug field (must match filename slug "${fileSlug}")`);
    } else if (dataSlug !== fileSlug) {
      errors.push(
        `${lesson.file}: slug field "${dataSlug}" does not match filename slug "${fileSlug}"`
      );
    }
    if (slugToFile.has(slug)) {
      errors.push(`${lesson.file}: duplicate slug "${slug}" (already in ${slugToFile.get(slug)})`);
    } else {
      slugToFile.set(slug, lesson.file);
    }
  }

  const knownSlugs = new Set(slugToFile.keys());
  for (const lesson of lessons) {
    const { data, file } = lesson;

    for (const field of REQUIRED_FIELDS) {
      if (typeof data[field] !== 'string') {
        errors.push(`${file}: required field "${field}" must be a string`);
      }
    }

    if (typeof data.url === 'string' && data.url.trim() !== '' && !isValidHttpUrl(data.url)) {
      errors.push(`${file}: invalid url "${data.url}"`);
    }

    if (!Array.isArray(data.dependsOn)) {
      errors.push(`${file}: dependsOn must be an array`);
      continue;
    }

    for (const token of data.dependsOn) {
      dependencyRefCount += 1;

      if (typeof token !== 'string' || token.trim() === '') {
        errors.push(`${file}: dependency token must be a non-empty string`);
        continue;
      }

      const value = token.trim();
      if (isNumericDependencyToken(value)) {
        errors.push(`${file}: numeric dependency token is not allowed ("${value}")`);
        continue;
      }

      if (isHttpUrl(value)) {
        continue;
      }

      if (!isSlugToken(value)) {
        errors.push(`${file}: invalid dependency token format ("${value}")`);
        continue;
      }

      if (!knownSlugs.has(value)) {
        errors.push(`${file}: unresolved lesson slug dependency ("${value}")`);
      }
    }
  }

  const summary = {
    lessonsChecked: lessons.length,
    dependenciesChecked: dependencyRefCount,
    errors: errors.length,
  };

  if (errors.length > 0) {
    console.error('❌ Lesson validation failed');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    console.error(`SUMMARY:${JSON.stringify(summary)}`);
    process.exit(1);
  }

  console.log('✅ Lesson validation passed');
  console.log(`SUMMARY:${JSON.stringify(summary)}`);
}

validate().catch((error) => {
  console.error('❌ Lesson validation crashed');
  console.error(error);
  process.exit(1);
});
