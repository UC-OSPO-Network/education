/**
 * Convert mixed "Depends On" text to machine-readable slug/URL references.
 *
 * Outputs:
 * - scripts/output/dependencies-migrated-YYYY-MM-DD.csv
 * - scripts/output/dependencies-migration-report-YYYY-MM-DD.md
 *
 * Usage:
 *   npm run migrate:depends-on
 *
 * Optional env vars:
 *   ALLOW_BACKUP_FALLBACK=1
 *   INCLUDE_DROPPED=0
 */

import Papa from 'papaparse';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDependsOn } from './lib/dependency-normalizer.js';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';
const FETCH_TIMEOUT = 8000;
const ALLOW_BACKUP_FALLBACK = process.env.ALLOW_BACKUP_FALLBACK !== '0';
const INCLUDE_DROPPED = process.env.INCLUDE_DROPPED === '1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, 'output');
const BACKUP_DIR = path.resolve(OUTPUT_DIR, 'backups');

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function getField(row, keys, fallback = '') {
  for (const key of keys) {
    if (!(key in row)) continue;
    const value = normalizeString(row[key]);
    if (value) return value;
  }
  return fallback;
}

function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toKeepStatus(keepValue) {
  const value = normalizeString(keepValue).toLowerCase();
  if (value.includes('keep candidate')) return 'keepCandidate';
  if (value.includes('keep')) return 'keep';
  return 'drop';
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
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

function buildRowMetadata(rows, slugMap) {
  const usedSlugs = new Set();
  const rowMeta = [];
  for (const row of rows) {
    const name = getField(row, ['name', 'Name']);
    const keepStatus = toKeepStatus(getField(row, ['Keep?', 'keepStatus']));
    const mappedSlug = name ? slugMap.get(name.toLowerCase()) : '';
    const baseSlug = slugify(mappedSlug || getField(row, ['slug', 'Slug']) || name) || 'lesson';

    let slug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    const sortingId = normalizeString(getField(row, ['Sorting ID', 'sortingId']));
    rowMeta.push({ row, name, keepStatus, slug, sortingId });
  }
  return rowMeta;
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

function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function run() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const stamp = isoDate();

  console.log('📥 Loading source rows...');
  const { rows, source, backupPath } = await fetchOrLoadRows();
  console.log(`✅ Loaded ${rows.length} rows from ${source === 'google-sheet' ? 'Google Sheets' : 'backup'}`);
  if (backupPath) {
    console.log(`📦 Backup source: ${backupPath}`);
  }

  const { map: slugMap, file: slugMapFile } = await loadSlugMap();
  if (slugMapFile) {
    console.log(`🧭 Loaded slug map from scripts/output/${slugMapFile} (${slugMap.size} entries)`);
  } else {
    console.log('🧭 No slug CSV map found; using row slug/name fallback');
  }

  const rowMeta = buildRowMetadata(rows, slugMap);
  const activeRows = rowMeta.filter((item) => item.keepStatus !== 'drop');
  const selectedRows = INCLUDE_DROPPED ? rowMeta : activeRows;
  const knownSlugSet = new Set(rowMeta.map((item) => item.slug));
  const { sortingIdToSlug, sortingIdToName } = buildSortingMaps(rowMeta);
  const nameToSlug = buildNameToSlugMap(rowMeta);

  const csvRows = [];
  const unresolvedRows = [];
  const numericIssueRows = [];
  let rowsWithRefs = 0;

  for (const item of selectedRows) {
    const rawDependsOn = getField(item.row, ['Depends On', 'dependsOn'], '');
    const parsed = parseDependsOn(rawDependsOn, {
      sortingIdToSlug,
      sortingIdToName,
      nameToSlug,
      knownSlugs: knownSlugSet,
    });
    if (parsed.dependsOn.length > 0) {
      rowsWithRefs += 1;
    }

    const unresolvedSlugIssues = parsed.issues.filter((issue) =>
      issue.startsWith('Unresolved slug reference')
    );
    const unresolvedIdIssues = parsed.issues.filter((issue) =>
      issue.startsWith('Unresolved sorting ID')
    );

    if (unresolvedSlugIssues.length > 0) {
      unresolvedRows.push({
        name: item.name,
        slug: item.slug,
        issues: unresolvedSlugIssues,
      });
    }

    if (unresolvedIdIssues.length > 0) {
      numericIssueRows.push({
        name: item.name,
        slug: item.slug,
        issues: unresolvedIdIssues,
      });
    }

    csvRows.push({
      name: item.name,
      sortingId: item.sortingId,
      keepStatus: item.keepStatus,
      originalDependsOn: rawDependsOn,
      dependsOn: parsed.dependsOn.join(', '),
      prerequisiteNotes: parsed.prerequisiteNotes,
      issues: parsed.issues.join(' | '),
    });
  }

  const csvPath = path.join(OUTPUT_DIR, `dependencies-migrated-${stamp}.csv`);
  const headers = [
    'name',
    'sortingId',
    'keepStatus',
    'originalDependsOn',
    'dependsOn',
    'prerequisiteNotes',
    'issues',
  ];
  const csvContent = [
    headers.join(','),
    ...csvRows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n');
  await writeFile(csvPath, `${csvContent}\n`, 'utf8');

  const reportPath = path.join(OUTPUT_DIR, `dependencies-migration-report-${stamp}.md`);
  const report = [
    '# Depends On Migration Report',
    '',
    `- Date: ${stamp}`,
    `- Source: ${source}${backupPath ? ` (${backupPath})` : ''}`,
    `- Rows evaluated: ${selectedRows.length}`,
    `- Rows with dependency refs: ${rowsWithRefs}`,
    `- Unresolved internal slug refs: ${unresolvedRows.length}`,
    `- Unresolved sorting IDs: ${numericIssueRows.length}`,
    '',
    '## Output',
    '',
    `- CSV: \`${csvPath}\``,
    '',
    '## Unresolved Internal Slug References',
    '',
  ];

  if (unresolvedRows.length === 0) {
    report.push('None.');
  } else {
    for (const row of unresolvedRows) {
      report.push(`- ${row.name} (\`${row.slug}\`): ${row.issues.join('; ')}`);
    }
  }

  report.push('', '## Unresolved Sorting IDs', '');
  if (numericIssueRows.length === 0) {
    report.push('None.');
  } else {
    for (const row of numericIssueRows) {
      report.push(`- ${row.name} (\`${row.slug}\`): ${row.issues.join('; ')}`);
    }
  }

  report.push('', '## Manual Follow-up', '');
  report.push('- Review rows with non-empty `issues` in the CSV.');
  report.push('- Copy `dependsOn` and `prerequisiteNotes` into the Google Sheet after verification.');
  await writeFile(reportPath, `${report.join('\n')}\n`, 'utf8');

  console.log(`✅ Wrote migration CSV: ${csvPath}`);
  console.log(`✅ Wrote migration report: ${reportPath}`);
}

run().catch((error) => {
  console.error('\n❌ Depends On migration failed');
  console.error(error);
  process.exit(1);
});
