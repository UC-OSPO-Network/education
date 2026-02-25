/**
 * CSV -> JSON singleton migration for lesson content.
 *
 * Flow:
 * 1) Fetch lessons from Google Sheets (same parsing approach as src/lib/getSheetData.ts)
 * 2) Backup fetched rows to scripts/output/backups
 * 3) Keep only "Keep" and "Keep candidate" rows
 * 4) Generate stable slugs (optionally preferring scripts/output/slugs-*.csv)
 * 5) Normalize mixed Depends On data to string[] refs + prerequisite notes
 * 6) Validate required fields + URL format + dependency references
 * 7) Write one JSON file per lesson under src/content/lessons
 *
 * Usage:
 *   npm run migrate:lessons
 *
 * Optional env vars:
 *   EXPECTED_TOTAL_COUNT=56
 *   EXPECTED_ACTIVE_COUNT=32
 *   SKIP_EXPECTED_COUNT_CHECK=1
 *   FAIL_ON_DEPENDENCY_ISSUES=1
 *   ALLOW_BACKUP_FALLBACK=1
 */

import Papa from 'papaparse';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDependsOn } from './lib/dependency-normalizer.js';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';
const FETCH_TIMEOUT = 8000;
const EXPECTED_TOTAL_COUNT = Number(process.env.EXPECTED_TOTAL_COUNT || '56');
const EXPECTED_ACTIVE_COUNT = process.env.EXPECTED_ACTIVE_COUNT
  ? Number(process.env.EXPECTED_ACTIVE_COUNT)
  : null;
const SKIP_EXPECTED_COUNT_CHECK = process.env.SKIP_EXPECTED_COUNT_CHECK === '1';
const FAIL_ON_DEPENDENCY_ISSUES = process.env.FAIL_ON_DEPENDENCY_ISSUES !== '0';
const ALLOW_BACKUP_FALLBACK = process.env.ALLOW_BACKUP_FALLBACK !== '0';

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

    return parsed.data.filter((row) => Object.values(row).some((value) => normalizeString(value) !== ''));
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readLatestBackupRows() {
  const files = await readdir(BACKUP_DIR);
  const backups = files
    .filter((file) => /^google-sheets-lessons-.*\.json$/.test(file))
    .sort();
  if (backups.length === 0) {
    throw new Error(`No backups found in ${BACKUP_DIR}`);
  }

  const latestBackup = backups[backups.length - 1];
  const backupPath = path.join(BACKUP_DIR, latestBackup);
  const rows = JSON.parse(await readFile(backupPath, 'utf8'));
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`Latest backup is empty or invalid: ${backupPath}`);
  }

  return { rows, backupPath };
}

async function fetchOrLoadRows() {
  try {
    const rows = await fetchSheetData();
    return { rows, source: 'google-sheet' };
  } catch (error) {
    if (!ALLOW_BACKUP_FALLBACK) {
      throw error;
    }

    const { rows, backupPath } = await readLatestBackupRows();
    console.warn(`⚠️ Fetch failed (${error.message}). Falling back to backup: ${backupPath}`);
    return { rows, source: 'backup', backupPath };
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

function buildRowMetadata(rows, slugMap) {
  const usedSlugs = new Set();
  let slugCollisions = 0;
  const rowMeta = [];

  for (const row of rows) {
    const name = getField(row, ['name', 'Name']);
    const keepStatus = toKeepStatus(getField(row, ['Keep?', 'keepStatus']));
    const mappedSlug = name ? slugMap.get(name.toLowerCase()) : '';
    const baseSlug = slugify(mappedSlug || getField(row, ['slug', 'Slug']) || name) || 'lesson';

    let slug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slugCollisions += 1;
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    const sortingId = normalizeString(getField(row, ['Sorting ID', 'sortingId']));
    rowMeta.push({ row, name, keepStatus, slug, sortingId });
  }

  return { rowMeta, slugCollisions };
}

function buildSortingMaps(rowMeta) {
  const sortingIdToSlug = new Map();
  const sortingIdToName = new Map();

  for (const item of rowMeta) {
    if (!item.sortingId) continue;
    const key = String(Number(item.sortingId));
    if (!key || key === 'NaN') continue;
    sortingIdToSlug.set(key, item.slug);
    sortingIdToName.set(key, item.name);
  }

  return { sortingIdToSlug, sortingIdToName };
}

function buildNameToSlugMap(rowMeta) {
  const nameToSlug = new Map();
  for (const item of rowMeta) {
    if (!item.name || !item.slug) continue;
    nameToSlug.set(item.name, item.slug);
  }
  return nameToSlug;
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

  if (!Array.isArray(lesson.dependsOn)) {
    errors.push('"dependsOn" must be an array');
  }

  if (typeof lesson.prerequisiteNotes !== 'string') {
    errors.push('"prerequisiteNotes" must be a string');
  }

  return errors;
}

async function migrate() {
  console.log('📥 Fetching lesson data from Google Sheets...');
  const { rows: rawRows, source, backupPath: sourceBackupPath } = await fetchOrLoadRows();
  if (!rawRows.length) {
    throw new Error('No rows found in source data.');
  }
  console.log(`✅ Loaded ${rawRows.length} rows from ${source === 'google-sheet' ? 'Google Sheets' : 'backup'}`);

  if (source === 'backup') {
    console.log(`📦 Backup source: ${sourceBackupPath}`);
  }

  if (!SKIP_EXPECTED_COUNT_CHECK && Number.isFinite(EXPECTED_TOTAL_COUNT)) {
    if (rawRows.length !== EXPECTED_TOTAL_COUNT) {
      throw new Error(
        `Expected ${EXPECTED_TOTAL_COUNT} total lessons from CSV, found ${rawRows.length}. ` +
          'Set SKIP_EXPECTED_COUNT_CHECK=1 to bypass temporarily.'
      );
    }
  }

  if (source === 'google-sheet') {
    const newBackupPath = await backupRows(rawRows);
    console.log(`💾 Backup written: ${newBackupPath}`);
  }

  const { map: slugMap, file: slugMapFile } = await loadSlugMap();
  if (slugMapFile) {
    console.log(`🧭 Loaded slug map from scripts/output/${slugMapFile} (${slugMap.size} entries)`);
  } else {
    console.log('🧭 No slug CSV map found; using row slug/name fallback');
  }

  const { rowMeta, slugCollisions } = buildRowMetadata(rawRows, slugMap);
  const { sortingIdToSlug, sortingIdToName } = buildSortingMaps(rowMeta);
  const nameToSlug = buildNameToSlugMap(rowMeta);

  const activeRows = rowMeta.filter((item) => item.keepStatus !== 'drop');
  const knownSlugSet = new Set(rowMeta.map((item) => item.slug));

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

  await mkdir(OUT_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  const validationErrors = [];
  const dependencyWarnings = [];

  for (const item of activeRows) {
    const { row, name, keepStatus, slug } = item;
    if (!name) {
      skipped += 1;
      validationErrors.push('row skipped because "name" is missing');
      continue;
    }

    const dependencyResult = parseDependsOn(getField(row, ['Depends On', 'dependsOn'], ''), {
      sortingIdToSlug,
      sortingIdToName,
      nameToSlug,
      knownSlugs: knownSlugSet,
    });
    const unresolvedSlugIssues = dependencyResult.issues.filter((issue) =>
      issue.startsWith('Unresolved slug reference')
    );
    const unresolvedIdIssues = dependencyResult.issues.filter((issue) =>
      issue.startsWith('Unresolved sorting ID')
    );

    if (unresolvedIdIssues.length > 0) {
      dependencyWarnings.push(`${name} (${slug}): ${unresolvedIdIssues.join('; ')}`);
    }

    if (FAIL_ON_DEPENDENCY_ISSUES && unresolvedSlugIssues.length > 0) {
      skipped += 1;
      validationErrors.push(`${name} (${slug}): ${unresolvedSlugIssues.join('; ')}`);
      continue;
    }

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
      dependsOn: dependencyResult.dependsOn,
      prerequisiteNotes: dependencyResult.prerequisiteNotes,
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

  if (dependencyWarnings.length > 0) {
    console.log('\n⚠️ Dependency conversion notes:');
    for (const warning of dependencyWarnings) {
      console.log(`   - ${warning}`);
    }
  }

  if (validationErrors.length > 0) {
    console.log('\n⚠️ Validation issues:');
    for (const error of validationErrors) {
      console.log(`   - ${error}`);
    }
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
}

migrate().catch((error) => {
  console.error('\n❌ Migration failed');
  console.error(error);
  process.exit(1);
});
