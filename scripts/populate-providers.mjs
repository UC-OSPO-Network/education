// Populates the `provider` field in lesson JSON files based on URL domain and author patterns.
// Safe to re-run: skips lessons that already have a provider set.
// Usage: node scripts/populate-providers.mjs [--force]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LESSONS_DIR = path.join(__dirname, '../src/content/lessons');
const FORCE = process.argv.includes('--force');

const URL_RULES = [
  { pattern: /ucdavisdatalab\.github\.io/, provider: 'UC Davis DataLab' },
  { pattern: /video\.ucdavis\.edu/, provider: 'UC Davis DataLab' },
  { pattern: /ucjug\.github\.io/, provider: 'UC Carpentries' },
  { pattern: /carpentries-incubator\.github\.io/, provider: 'The Carpentries Incubator' },
  { pattern: /coderefinery\.github\.io/, provider: 'CodeRefinery' },
  { pattern: /intersect-training\.org/, provider: 'INTERSECT' },
  { pattern: /opensource\.guide/, provider: 'GitHub / Open Source Guides' },
  { pattern: /github\.com\/github\//, provider: 'GitHub / Open Source Guides' },
  { pattern: /book\.the-turing-way\.org/, provider: 'The Turing Way' },
  { pattern: /alan-turing-institute\.github\.io/, provider: 'The Turing Way' },
  { pattern: /hsf-training\.github\.io/, provider: 'HSF Training' },
  { pattern: /education\.molssi\.org/, provider: 'MolSSI' },
];

const AUTHOR_RULES = [
  { pattern: /intersect/i, provider: 'INTERSECT' },
  { pattern: /carpentries incubator/i, provider: 'The Carpentries Incubator' },
  { pattern: /coderefinery/i, provider: 'CodeRefinery' },
  { pattern: /turing way|alan turing institute/i, provider: 'The Turing Way' },
  { pattern: /hsf training/i, provider: 'HSF Training' },
  { pattern: /molssi/i, provider: 'MolSSI' },
  { pattern: /^github$/i, provider: 'GitHub / Open Source Guides' },
  { pattern: /open source guides/i, provider: 'GitHub / Open Source Guides' },
  { pattern: /first contributions/i, provider: 'GitHub / Open Source Guides' },
];

function detectProvider(lesson) {
  for (const rule of URL_RULES) {
    if (lesson.url && rule.pattern.test(lesson.url)) return rule.provider;
  }
  for (const rule of AUTHOR_RULES) {
    if (lesson.author && rule.pattern.test(lesson.author)) return rule.provider;
  }
  return null;
}

const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.json'));
let updated = 0;
let skipped = 0;
let unmatched = [];

for (const file of files) {
  const filePath = path.join(LESSONS_DIR, file);
  const lesson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (lesson.provider && !FORCE) {
    skipped++;
    continue;
  }

  const provider = detectProvider(lesson);
  if (!provider) {
    unmatched.push({ file, author: lesson.author, url: lesson.url });
    continue;
  }

  lesson.provider = provider;
  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 4));
  updated++;
  console.log(`  ✓ ${file} → ${provider}`);
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped (already set).`);
if (unmatched.length) {
  console.log(`\nNo match found for ${unmatched.length} lessons:`);
  unmatched.forEach(({ file, author, url }) =>
    console.log(`  ${file}\n    author: ${author}\n    url: ${url}`)
  );
}
