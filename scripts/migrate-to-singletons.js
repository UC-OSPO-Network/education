/**
 * CSV -> JSON singleton migration for lesson content.
 *
 * Flow:
 * 1) Fetch lessons from Google Sheets (same parsing approach as src/lib/getSheetData.ts)
 * 2) Backup fetched rows to scripts/output/backups
 * 3) Keep only "Keep" and "Keep candidate" rows
 * 4) Generate stable slugs (optionally preferring scripts/output/slugs-*.csv)
 * 5) Map columns to content-collection JSON shape
 * 6) Validate required fields + URL format
 * 7) Write one JSON file per lesson under src/content/lessons
 *
 * Usage:
 *   npm run migrate:lessons
 *
 * Optional env vars:
 *   EXPECTED_TOTAL_COUNT=56
 *   EXPECTED_ACTIVE_COUNT=32
 *   SKIP_EXPECTED_COUNT_CHECK=1
 */

import Papa from 'papaparse';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';
const FETCH_TIMEOUT = 8000;
const EXPECTED_TOTAL_COUNT = Number(process.env.EXPECTED_TOTAL_COUNT || '56');
const EXPECTED_ACTIVE_COUNT = process.env.EXPECTED_ACTIVE_COUNT
  ? Number(process.env.EXPECTED_ACTIVE_COUNT)
  : null;
const SKIP_EXPECTED_COUNT_CHECK = process.env.SKIP_EXPECTED_COUNT_CHECK === '1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'content', 'lessons');
const OUTPUT_DIR = path.resolve(__dirname, 'output');
const BACKUP_DIR = path.resolve(OUTPUT_DIR, 'backups');

function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function normalizeList(value) {
  const str = normalizeString(value);
  if (!str) return [];
  return str
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getField(row, keys, fallback = '') {
  for (const key of keys) {
    if (!(key in row)) continue;
    const value = normalizeString(row[key]);
    if (value) return value;
  }
  return fallback;
}

function toKeepStatus(keepValue) {
  const value = normalizeString(keepValue).toLowerCase();
  if (value.includes('keep candidate')) return 'keepCandidate';
  if (value.includes('keep')) return 'keep';
  return 'drop';
}

function normalizeLearnerCategory(value) {
  if (value === 'Maintaining and Sustaining Software') return 'Maintaining & Sustaining Software';
  if (value === 'Building Inclusive Communities') return 'Building Community';
  return value;
}

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchSheetData() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(CSV_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV (status ${response.status})`);
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parsing failed with ${parsed.errors.length} error(s)`);
    }

    const rows = parsed.data.filter((row) =>
      Object.values(row).some((value) => normalizeString(value) !== '')
    );

    return rows;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadSlugMap() {
  const map = new Map();
  let latestSlugFile = null;

  try {
    const files = await readdir(OUTPUT_DIR);
    const slugFiles = files
      .filter((file) => /^slugs-\d{4}-\d{2}-\d{2}\.csv$/.test(file))
      .sort();

    if (slugFiles.length === 0) {
      return { map, file: null };
    }

    latestSlugFile = slugFiles[slugFiles.length - 1];
    const csv = await readFile(path.join(OUTPUT_DIR, latestSlugFile), 'utf8');
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

    for (const row of parsed.data) {
      const name = getField(row, ['name', 'Name']);
      const slug = slugify(getField(row, ['slug', 'Slug']));
      if (!name || !slug) continue;
      map.set(name.toLowerCase(), slug);
    }
  } catch (error) {
    console.warn('⚠️ Could not load slug map from scripts/output:', error.message);
  }

  return { map, file: latestSlugFile };
}

async function backupRows(rows) {
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `google-sheets-lessons-${stamp}.json`);
  await writeFile(backupPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  return backupPath;
}

function validateLessonData(lesson) {
  const errors = [];
  const requiredStringFields = ['name', 'slug', 'description', 'url'];

  for (const field of requiredStringFields) {
    if (typeof lesson[field] !== 'string') {
      errors.push(`missing required string field "${field}"`);
    }
  }

  if (!isValidHttpUrl(lesson.url)) {
    errors.push(`invalid URL format "${lesson.url}"`);
  }

  return errors;
}

async function migrate() {
  console.log('📥 Fetching lesson data from Google Sheets...');
  const rawRows = await fetchSheetData();
  if (!rawRows.length) {
    throw new Error('No rows found in Google Sheets CSV.');
  }
  console.log(`✅ Fetched ${rawRows.length} rows`);

  if (!SKIP_EXPECTED_COUNT_CHECK && Number.isFinite(EXPECTED_TOTAL_COUNT)) {
    if (rawRows.length !== EXPECTED_TOTAL_COUNT) {
      throw new Error(
        `Expected ${EXPECTED_TOTAL_COUNT} total lessons from CSV, found ${rawRows.length}. ` +
          'Set SKIP_EXPECTED_COUNT_CHECK=1 to bypass temporarily.'
      );
    }
  }

  const backupPath = await backupRows(rawRows);
  console.log(`💾 Backup written: ${backupPath}`);

  const { map: slugMap, file: slugMapFile } = await loadSlugMap();
  if (slugMapFile) {
    console.log(`🧭 Loaded slug map from scripts/output/${slugMapFile} (${slugMap.size} entries)`);
  } else {
    console.log('🧭 No slug CSV map found; using row slug/name fallback');
  }

  await mkdir(OUT_DIR, { recursive: true });

  const activeRows = [];
  for (const row of rawRows) {
    const keepStatus = toKeepStatus(getField(row, ['Keep?', 'keepStatus']));
    if (keepStatus === 'drop') continue;
    activeRows.push({ row, keepStatus });
  }

  if (
    !SKIP_EXPECTED_COUNT_CHECK &&
    EXPECTED_ACTIVE_COUNT !== null &&
    Number.isFinite(EXPECTED_ACTIVE_COUNT) &&
    activeRows.length !== EXPECTED_ACTIVE_COUNT
  ) {
    throw new Error(
      `Expected ${EXPECTED_ACTIVE_COUNT} active lessons, found ${activeRows.length}. ` +
        'Set EXPECTED_ACTIVE_COUNT to the intended target or use SKIP_EXPECTED_COUNT_CHECK=1.'
    );
  }

  console.log(`🔎 Active lessons to migrate: ${activeRows.length}`);
  if (EXPECTED_ACTIVE_COUNT === null) {
    console.log('ℹ️ EXPECTED_ACTIVE_COUNT not set; active lesson count is informational.');
  }

  const usedSlugs = new Set();
  let slugCollisions = 0;
  let written = 0;
  let skipped = 0;
  const validationErrors = [];

  for (const { row, keepStatus } of activeRows) {
    const name = getField(row, ['name', 'Name']);
    if (!name) {
      skipped += 1;
      validationErrors.push('row skipped because "name" is missing');
      continue;
    }

    const mappedSlug = slugMap.get(name.toLowerCase());
    const baseSlug = slugify(mappedSlug || getField(row, ['slug', 'Slug']) || name) || 'lesson';

    let slug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slugCollisions += 1;
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    const lesson = {
      name,
      slug,
      keepStatus,
      description: getField(row, ['description', 'Description'], ''),
      url: getField(row, ['url', 'URL'], ''),
      topic: getField(row, ['Topic', 'topic'], ''),
      subTopic: getField(row, ['subTopic', 'Sub Topic'], ''),
      learnerCategory: normalizeLearnerCategory(getField(row, ['learnerCategory', 'Learner Category'], '')),
      educationalLevel: getField(row, ['educationalLevel', 'Educational Level'], 'Unknown'),
      learningResourceType: getField(row, ['learningResourceType', 'Learning Resource Type'], ''),
      author: getField(row, ['author', 'Author'], ''),
      license: getField(row, ['license', 'License'], ''),
      ossRole: getField(row, ['ossRole', 'oss_role', 'OSS Role'], ''),
      inLanguage: normalizeList(getField(row, ['inLanguage', 'In Language'], '')),
      keywords: normalizeList(getField(row, ['keywords', 'Keywords'], '')),
      sortingId: getField(row, ['Sorting ID', 'sortingId'], ''),
      dependsOn: getField(row, ['Depends On', 'dependsOn'], ''),
      learningObjectives: getField(row, ['Learning Objectives', 'learningObjectives'], ''),
      ospoRelevance: getField(row, ['OSPO Relevance', 'ospoRelevance'], ''),
      abstract: getField(row, ['abstract', 'Abstract'], ''),
      dateCreated: getField(row, ['dateCreated', 'Date Created'], ''),
      dateModified: getField(row, ['dateModified', 'Date Modified'], ''),
      timeRequired: getField(row, ['timeRequired', 'Time Required'], ''),
      about: getField(row, ['about', 'About'], ''),
      accessibilitySummary: getField(row, ['accessibilitySummary', 'Accessibility Summary'], ''),
      audience: getField(row, ['audience', 'Audience'], ''),
      competencyRequired: getField(row, ['competencyRequired', 'Competency Required'], ''),
      contributor: getField(row, ['contributor', 'Contributor'], ''),
      creativeWorkStatus: getField(row, ['creativeWorkStatus', 'Creative Work Status'], ''),
      datePublished: getField(row, ['datePublished', 'Date Published'], ''),
      hasPart: getField(row, ['hasPart', 'Has Part'], ''),
      identifier: getField(row, ['identifier', 'Identifier'], ''),
      isPartOf: getField(row, ['isPartOf', 'Is Part Of'], ''),
      notes: getField(row, ['Notes', 'notes'], ''),
      mentions: getField(row, ['mentions', 'Mentions'], ''),
      recordedAt: getField(row, ['recordedAt', 'Recorded At'], ''),
      teaches: getField(row, ['teaches', 'Teaches'], ''),
      version: getField(row, ['version', 'Version'], ''),
      workTranslation: getField(row, ['workTranslation', 'Work Translation'], ''),
    };

    const errors = validateLessonData(lesson);
    if (errors.length > 0) {
      skipped += 1;
      validationErrors.push(`${name} (${slug}): ${errors.join('; ')}`);
      continue;
    }

    const outPath = path.join(OUT_DIR, `${slug}.json`);
    await writeFile(outPath, JSON.stringify(lesson, null, 2) + '\n', 'utf8');
    written += 1;
  }

  if (written !== activeRows.length) {
    throw new Error(
      `Migration incomplete: wrote ${written}/${activeRows.length} active lessons. ` +
        `Skipped ${skipped}.`
    );
  }

  console.log('\n✅ Migration complete');
  console.log(`   Active rows migrated: ${written}`);
  console.log(`   Slug collisions handled: ${slugCollisions}`);
  console.log(`   Output directory: ${OUT_DIR}`);

  if (validationErrors.length > 0) {
    console.log('\n⚠️ Validation issues:');
    for (const error of validationErrors) {
      console.log(`   - ${error}`);
    }
  }
}

migrate().catch((error) => {
  console.error('\n❌ Migration failed');
  console.error(error);
  process.exit(1);
});
