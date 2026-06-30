import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');

const WRITE = process.argv.includes('--write');

/*
 * Audience ("designed for") normalization.
 *
 * `audience` answers "who was this lesson designed for" — the background the
 * learner brings. This is distinct from `roles` ("which OSS role competency the
 * lesson builds toward", normalized in normalize-roles.mjs). The raw `audience`
 * field had 36 messy values with near-duplicates (Developers / Software
 * Developers / Software Engineers; PhD Students / Graduate Students). This
 * collapses them onto 7 curated persona terms written to a canonical
 * `audiences` array; the raw `audience` string is kept for full-text search.
 *
 * Dropped (null): skill levels (Beginners) and too-generic descriptors
 * (Individuals, Companies) — these are not a learner background; and niche
 * one-offs (Technical Writers).
 */

export const AUDIENCES = [
  'Researcher',
  'Research Software Engineer / Developer',
  'Open Source Contributor',
  'Open Source Maintainer',
  'Project / Program Lead',
  'Community Manager',
  'Librarian / Information Professional',
];

const RESEARCHER = 'Researcher';
const RSE = 'Research Software Engineer / Developer';
const CONTRIB = 'Open Source Contributor';
const MAINT = 'Open Source Maintainer';
const LEAD = 'Project / Program Lead';
const COMMUNITY = 'Community Manager';
const LIBRARIAN = 'Librarian / Information Professional';

const AUDIENCE_MAP = {
  // Researcher (incl. students / scientists in a research context)
  'researchers': RESEARCHER,
  'scientists': RESEARCHER,
  'research staff': RESEARCHER,
  'phd students': RESEARCHER,
  'graduate students': RESEARCHER,
  'data scientists': RESEARCHER,
  'open science contributors': RESEARCHER,

  // Research Software Engineer / Developer
  'research software engineers': RSE,
  'software developers': RSE,
  'developers': RSE,
  'software engineers': RSE,
  'python developers': RSE,
  'hpc engineers': RSE,
  'devops engineers': RSE,
  'system architects': RSE,
  'software engineers checking dependencies': RSE,

  // Open Source Contributor
  'open source contributors': CONTRIB,
  'contributors': CONTRIB,

  // Open Source Maintainer
  'maintainers': MAINT,
  'open source maintainers': MAINT,

  // Project / Program Lead
  'project leads': LEAD,
  'project managers': LEAD,
  'leaders': LEAD,
  'ospo managers': LEAD,
  'ospo staff': LEAD,
  'legal teams': LEAD,
  'software dependency compliance officers': LEAD,
  'community evaluators': LEAD,

  // Community Manager
  'community managers': COMMUNITY,
  'communities': COMMUNITY,

  // Librarian / Information Professional
  'librarians': LIBRARIAN,
  'library staff': LIBRARIAN,

  // dropped (skill level / too generic / niche)
  'beginners': null,
  'individuals': null,
  'companies': null,
  'technical writers': null,
};

const split = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

async function main() {
  const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));

  const counts = Object.fromEntries(AUDIENCES.map((a) => [a, 0]));
  const noAudience = [];
  const unmapped = new Set();
  let active = 0;
  let changed = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    if ((data.keepStatus || 'keepCandidate') === 'drop') continue;
    active++;

    const audiences = new Set();
    for (const raw of split(data.audience)) {
      const key = raw.toLowerCase();
      if (!(key in AUDIENCE_MAP)) { unmapped.add(key); continue; }
      if (AUDIENCE_MAP[key]) audiences.add(AUDIENCE_MAP[key]);
    }

    const sorted = [...audiences].sort();
    sorted.forEach((a) => (counts[a] += 1));
    if (sorted.length === 0) noAudience.push(file);

    if (JSON.stringify(data.audiences || []) !== JSON.stringify(sorted)) {
      changed++;
      if (WRITE) {
        data.audiences = sorted;
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      }
    }
  }

  console.log('='.repeat(60));
  console.log(`AUDIENCE NORMALIZATION  (${WRITE ? 'WRITE' : 'DRY RUN — use --write to persist'})`);
  console.log('='.repeat(60));
  console.log(`Active lessons: ${active}   Files changed: ${changed}\n`);
  console.log(`Audience distribution (${AUDIENCES.length}-term vocab):`);
  for (const a of AUDIENCES) console.log(`  ${String(counts[a]).padStart(2)}  ${a}`);

  if (unmapped.size) {
    console.log(`\n⚠ UNMAPPED audience values (${unmapped.size}) — add to AUDIENCE_MAP:`);
    [...unmapped].sort().forEach((k) => console.log(`  - ${k}`));
  } else {
    console.log('\n✓ All audience values mapped.');
  }
  if (noAudience.length) {
    console.log(`\n⚠ Lessons with NO audience (${noAudience.length}):`);
    noAudience.forEach((f) => console.log(`  - ${f}`));
  } else {
    console.log('✓ Every active lesson resolved to at least one audience.');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
