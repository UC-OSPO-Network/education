import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSheetRows } from './lib/sheet-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LESSON_DIR = path.resolve(__dirname, '..', 'src', 'content', 'lessons');

const DEFAULT_FIELDS = [
  'name',
  'description',
  'learnerCategory',
  'audience',
  'url',
  'educationalLevel',
  'subTopic',
  'author',
];

const NORMALIZATION_ONLY_FIELDS = new Set(['learnerCategory', 'educationalLevel']);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const [rawKey, inlineValue] = token.split('=');
    const key = rawKey.slice(2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
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

function normalizeLearnerCategory(value) {
  if (value === 'Maintaining and Sustaining Software') return 'Maintaining & Sustaining Software';
  if (value === 'Building Inclusive Communities') return 'Building Community';
  return value;
}

function normalizeField(field, value) {
  const normalizedValue = normalizeString(value);
  if (field === 'learnerCategory') {
    return normalizeLearnerCategory(normalizedValue);
  }
  return normalizedValue;
}

function displayValue(value) {
  const normalizedValue = normalizeString(value);
  return normalizedValue === '' ? '(empty)' : normalizedValue;
}

function getSheetField(row, field) {
  const aliases = {
    name: ['name', 'Name'],
    description: ['description', 'Description'],
    learnerCategory: ['learnerCategory', 'Learner Category'],
    audience: ['audience', 'Audience'],
    url: ['url', 'URL'],
    educationalLevel: ['educationalLevel', 'Educational Level'],
    subTopic: ['subTopic', 'Sub Topic'],
    author: ['author', 'Author'],
    keepStatus: ['Keep?', 'keepStatus'],
    slug: ['slug', 'Slug'],
  };

  for (const key of aliases[field] || [field]) {
    if (!(key in row)) continue;
    const value = normalizeString(row[key]);
    if (value !== '') return value;
  }
  return '';
}

async function loadJsonLessons() {
  const files = (await readdir(LESSON_DIR))
    .filter((file) => file.endsWith('.json'))
    .sort();

  const lessons = [];
  for (const file of files) {
    const filePath = path.join(LESSON_DIR, file);
    const data = JSON.parse(await readFile(filePath, 'utf8'));
    const fileSlug = file.replace(/\.json$/i, '');
    const slug = normalizeString(data.slug) || fileSlug;

    lessons.push({
      key: slug || slugify(data.name),
      slug,
      file,
      fileSlug,
      name: normalizeString(data.name),
      keepStatus: normalizeString(data.keepStatus),
      raw: {
        name: normalizeString(data.name),
        description: normalizeString(data.description),
        learnerCategory: normalizeString(data.learnerCategory),
        audience: normalizeString(data.audience),
        url: normalizeString(data.url),
        educationalLevel: normalizeString(data.educationalLevel),
        subTopic: normalizeString(data.subTopic),
        author: normalizeString(data.author),
      },
      normalized: {
        name: normalizeField('name', data.name),
        description: normalizeField('description', data.description),
        learnerCategory: normalizeField('learnerCategory', data.learnerCategory),
        audience: normalizeField('audience', data.audience),
        url: normalizeField('url', data.url),
        educationalLevel: normalizeField('educationalLevel', data.educationalLevel),
        subTopic: normalizeField('subTopic', data.subTopic),
        author: normalizeField('author', data.author),
      },
    });
  }

  return lessons;
}

function normalizeSheetRows(rows) {
  return rows.map((row) => {
    const name = getSheetField(row, 'name');
    const explicitSlug = getSheetField(row, 'slug');
    const slug = explicitSlug || slugify(name);
    return {
      key: slug,
      slug,
      name,
      keepStatus: toKeepStatus(getSheetField(row, 'keepStatus')),
      raw: {
        name: getSheetField(row, 'name'),
        description: getSheetField(row, 'description'),
        learnerCategory: getSheetField(row, 'learnerCategory'),
        audience: getSheetField(row, 'audience'),
        url: getSheetField(row, 'url'),
        educationalLevel: getSheetField(row, 'educationalLevel'),
        subTopic: getSheetField(row, 'subTopic'),
        author: getSheetField(row, 'author'),
      },
      normalized: {
        name: normalizeField('name', getSheetField(row, 'name')),
        description: normalizeField('description', getSheetField(row, 'description')),
        learnerCategory: normalizeField('learnerCategory', getSheetField(row, 'learnerCategory')),
        audience: normalizeField('audience', getSheetField(row, 'audience')),
        url: normalizeField('url', getSheetField(row, 'url')),
        educationalLevel: normalizeField('educationalLevel', getSheetField(row, 'educationalLevel')),
        subTopic: normalizeField('subTopic', getSheetField(row, 'subTopic')),
        author: normalizeField('author', getSheetField(row, 'author')),
      },
    };
  });
}

function buildIndex(records, sideLabel) {
  const byKey = new Map();
  const duplicates = [];

  for (const record of records) {
    if (!record.key) {
      duplicates.push({
        side: sideLabel,
        key: '(empty)',
        entries: [record.name || '(unnamed)'],
        reason: 'record has no slug and no slugifiable name',
      });
      continue;
    }

    if (!byKey.has(record.key)) {
      byKey.set(record.key, [record]);
      continue;
    }

    const existing = byKey.get(record.key);
    existing.push(record);
  }

  const unique = new Map();
  for (const [key, entries] of byKey.entries()) {
    if (entries.length === 1) {
      unique.set(key, entries[0]);
    } else {
      duplicates.push({
        side: sideLabel,
        key,
        entries: entries.map((entry) => entry.name || entry.file || '(unnamed)'),
        reason: 'duplicate comparison key',
      });
    }
  }

  return { unique, duplicates };
}

function compareMatchedLessons(sheetLesson, jsonLesson, fields) {
  const rawMismatches = [];
  const normalizedOnlyDifferences = [];

  for (const field of fields) {
    const sheetRaw = sheetLesson.raw[field] ?? '';
    const jsonRaw = jsonLesson.raw[field] ?? '';
    if (sheetRaw === jsonRaw) continue;

    const sheetNormalized = sheetLesson.normalized[field] ?? '';
    const jsonNormalized = jsonLesson.normalized[field] ?? '';
    const mismatch = {
      field,
      sheetRaw,
      jsonRaw,
      sheetNormalized,
      jsonNormalized,
    };

    if (sheetNormalized === jsonNormalized) {
      normalizedOnlyDifferences.push(mismatch);
      continue;
    }

    if (
      NORMALIZATION_ONLY_FIELDS.has(field) &&
      ((field === 'educationalLevel' && sheetRaw === '' && jsonRaw === 'Unknown') ||
        (field === 'learnerCategory' && normalizeLearnerCategory(sheetRaw) === jsonRaw))
    ) {
      normalizedOnlyDifferences.push(mismatch);
      continue;
    }

    rawMismatches.push(mismatch);
  }

  return { rawMismatches, normalizedOnlyDifferences };
}

function renderMismatchList(mismatches) {
  if (mismatches.length === 0) {
    return ['- None'];
  }

  return mismatches.flatMap((mismatch) => {
    const lines = [`- ${mismatch.slug} — ${mismatch.field} differs`];
    lines.push(`  - Sheet: ${displayValue(mismatch.sheetRaw)}`);
    lines.push(`  - JSON: ${displayValue(mismatch.jsonRaw)}`);
    return lines;
  });
}

function renderDuplicateList(duplicates) {
  if (duplicates.length === 0) {
    return ['- None'];
  }

  return duplicates.map(
    (duplicate) =>
      `- ${duplicate.side} key \`${duplicate.key}\` (${duplicate.reason}): ${duplicate.entries.join(', ')}`
  );
}

function classifyNormalizationDifference(mismatch) {
  if (
    mismatch.field === 'learnerCategory' &&
    mismatch.sheetRaw === 'Maintaining and Sustaining Software' &&
    mismatch.jsonRaw === 'Maintaining & Sustaining Software'
  ) {
    return 'learnerCategory normalized from "Maintaining and Sustaining Software" to "Maintaining & Sustaining Software"';
  }

  if (
    mismatch.field === 'learnerCategory' &&
    mismatch.sheetRaw === 'Building Inclusive Communities' &&
    mismatch.jsonRaw === 'Building Community'
  ) {
    return 'learnerCategory normalized from "Building Inclusive Communities" to "Building Community"';
  }

  if (
    mismatch.field === 'educationalLevel' &&
    mismatch.sheetRaw === '' &&
    mismatch.jsonRaw === 'Unknown'
  ) {
    return 'educationalLevel blank in Sheet but defaulted to "Unknown" in JSON';
  }

  return `${mismatch.field} differs only after normalization/default handling`;
}

function renderNormalizationSummary(mismatches) {
  if (mismatches.length === 0) {
    return ['- None'];
  }

  const buckets = new Map();
  for (const mismatch of mismatches) {
    const label = classifyNormalizationDifference(mismatch);
    buckets.set(label, (buckets.get(label) || 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, count]) => `- ${count} lesson(s): ${label}`);
}

function renderMissingList(items, formatter) {
  if (items.length === 0) {
    return ['- None'];
  }
  return items.map(formatter);
}

function buildReport({
  source,
  backupPath,
  fetchError,
  sheetLessons,
  jsonLessons,
  matchedLessons,
  missingFromJson,
  missingFromSheet,
  rawFieldMismatches,
  normalizedOnlyDifferences,
  duplicates,
}) {
  const reportDate = new Date().toISOString().slice(0, 10);
  const sourceLabel =
    source === 'google-sheet'
      ? 'Google Sheets (live)'
      : `Google Sheets backup (${backupPath || 'latest backup'})`;
  const matchMode =
    'Primary key: slug. Fallback key: slug derived from lesson name when Sheet slug is missing.';

  const lines = [
    '# Sheets ↔ JSON Diff Report',
    `Date: ${reportDate}`,
    `Source: ${sourceLabel}`,
    `Match mode: ${matchMode}`,
  ];

  if (fetchError) {
    lines.push(`Fetch fallback: Live fetch failed, using backup instead (${fetchError})`);
  }

  lines.push(
    '',
    '## Lesson Counts',
    `- Google Sheets: ${sheetLessons.length} lessons`,
    `- JSON files: ${jsonLessons.length} lessons`,
    `- Matched: ${matchedLessons} lessons`,
    `- Missing from JSON: ${missingFromJson.length}`,
    `- Missing from Sheet: ${missingFromSheet.length}`,
    ''
  );

  lines.push(
    '## Missing From JSON',
    ...renderMissingList(missingFromJson, (item) => `- ${item.slug} (${item.name})`),
    '',
    '## Missing From Sheet',
    ...renderMissingList(missingFromSheet, (item) => `- ${item.slug} (${item.name})`),
    '',
    '## Field Mismatches',
    ...renderMismatchList(rawFieldMismatches),
    '',
    '## Normalization / Default Differences',
    ...renderNormalizationSummary(normalizedOnlyDifferences),
    '',
    '## Duplicate / Ambiguous Match Issues',
    ...renderDuplicateList(duplicates),
    '',
    '## Summary',
    `- Raw field mismatches: ${rawFieldMismatches.length}`,
    `- Normalization/default-only differences: ${normalizedOnlyDifferences.length}`,
    '- Review raw mismatches with the education committee before treating them as migration regressions.'
  );

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputPath = args.output ? path.resolve(process.cwd(), String(args.output)) : null;
  const useBackupOnly = args['use-backup-only'] === true;
  const fields = args.fields
    ? String(args.fields)
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean)
    : DEFAULT_FIELDS;

  const { rows, source, backupPath, fetchError } = await fetchSheetRows({ useBackupOnly });
  const sheetLessons = normalizeSheetRows(rows);
  const jsonLessons = await loadJsonLessons();

  const sheetIndex = buildIndex(sheetLessons, 'Sheet');
  const jsonIndex = buildIndex(jsonLessons, 'JSON');
  const duplicates = [...sheetIndex.duplicates, ...jsonIndex.duplicates];

  const matchedLessons = [];
  const missingFromJson = [];
  const missingFromSheet = [];
  const rawFieldMismatches = [];
  const normalizedOnlyDifferences = [];

  for (const [key, sheetLesson] of sheetIndex.unique.entries()) {
    const jsonLesson = jsonIndex.unique.get(key);
    if (!jsonLesson) {
      missingFromJson.push({ slug: sheetLesson.slug || key, name: sheetLesson.name || '(unnamed)' });
      continue;
    }

    matchedLessons.push(key);
    const comparison = compareMatchedLessons(sheetLesson, jsonLesson, fields);
    rawFieldMismatches.push(
      ...comparison.rawMismatches.map((mismatch) => ({
        slug: key,
        field: mismatch.field,
        sheetRaw: mismatch.sheetRaw,
        jsonRaw: mismatch.jsonRaw,
      }))
    );
    normalizedOnlyDifferences.push(
      ...comparison.normalizedOnlyDifferences.map((mismatch) => ({
        slug: key,
        field: mismatch.field,
        sheetRaw: mismatch.sheetRaw,
        jsonRaw: mismatch.jsonRaw,
      }))
    );
  }

  for (const [key, jsonLesson] of jsonIndex.unique.entries()) {
    if (!sheetIndex.unique.has(key)) {
      missingFromSheet.push({ slug: key, name: jsonLesson.name || jsonLesson.file || '(unnamed)' });
    }
  }

  const report = buildReport({
    source,
    backupPath,
    fetchError,
    sheetLessons,
    jsonLessons,
    matchedLessons: matchedLessons.length,
    missingFromJson,
    missingFromSheet,
    rawFieldMismatches: rawFieldMismatches.sort((a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field)),
    normalizedOnlyDifferences: normalizedOnlyDifferences.sort(
      (a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field)
    ),
    duplicates,
  });

  process.stdout.write(report);

  if (outputPath) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report, 'utf8');
  }
}

main().catch((error) => {
  console.error('❌ Sheets ↔ JSON diff audit failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
