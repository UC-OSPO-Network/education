/**
 * Normalize lesson content files to match the Keystatic schema options.
 *
 * Usage:
 *   node scripts/normalize-lessons.js
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lessonsDir = path.resolve(__dirname, '..', 'src', 'content', 'lessons');

function normalizeLearnerCategory(value) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (v === 'Maintaining and Sustaining Software') return 'Maintaining & Sustaining Software';
  if (v === 'Building Inclusive Communities') return 'Building Community';
  return v;
}

const files = (await readdir(lessonsDir)).filter((f) => f.endsWith('.json'));
let updated = 0;

for (const file of files) {
  const fullPath = path.join(lessonsDir, file);
  const raw = await readFile(fullPath, 'utf8');
  const data = JSON.parse(raw);

  const before = data.learnerCategory;
  const after = normalizeLearnerCategory(before);

  if (after && before !== after) {
    data.learnerCategory = after;
    await writeFile(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    updated++;
  }
}

console.log(`✅ Normalized learnerCategory in ${updated} file(s).`);

