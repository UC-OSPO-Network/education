/**
 * One-time (repeatable) migration script:
 * - Fetches the current Google Sheets CSV (via src/lib/getSheetData.js)
 * - Writes lesson entries to src/content/lessons/*.json for Keystatic + Astro content collections
 *
 * Usage:
 *   node scripts/migrate-lessons-to-content.js
 *
 * Notes:
 * - This requires network access (the sheet is fetched from the public CSV URL).
 * - After migration, the site should read from src/content/lessons/ (not Google Sheets).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSheetData } from '../src/lib/getSheetData.js';

function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toKeepStatus(keepValue) {
  const value = String(keepValue ?? '').toLowerCase();
  if (value.includes('keep candidate')) return 'keepCandidate';
  if (value.includes('keep')) return 'keep';
  return 'drop';
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function normalizeLearnerCategory(value) {
  const v = normalizeString(value);
  if (v === 'Maintaining and Sustaining Software') return 'Maintaining & Sustaining Software';
  if (v === 'Building Inclusive Communities') return 'Building Community';
  return v;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lessonsDir = path.resolve(__dirname, '..', 'src', 'content', 'lessons');

const lessons = await getSheetData();
if (!lessons.length) {
  throw new Error(
    'No lessons returned from Google Sheets. Is the CSV URL still public and reachable?'
  );
}

await mkdir(lessonsDir, { recursive: true });

const usedSlugs = new Set();
let written = 0;

for (const lesson of lessons) {
  const name = normalizeString(lesson.name);
  if (!name) continue;

  const baseSlug = slugify(lesson.slug || name) || 'lesson';
  let slug = baseSlug;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  usedSlugs.add(slug);

  const out = {
    name,
    keepStatus: toKeepStatus(lesson['Keep?']),
    description: normalizeString(lesson.description),
    url: normalizeString(lesson.url),
    learnerCategory: normalizeLearnerCategory(lesson.learnerCategory),
    educationalLevel: normalizeString(lesson.educationalLevel) || 'Unknown',
    oss_role: normalizeString(lesson.oss_role),
    subTopic: normalizeString(lesson.subTopic),
    learningResourceType: normalizeString(lesson.learningResourceType),
    keywords: normalizeString(lesson.keywords),
  };

  const outPath = path.join(lessonsDir, `${slug}.json`);
  await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  written++;
}

console.log(`✅ Wrote ${written} lessons to ${lessonsDir}`);
