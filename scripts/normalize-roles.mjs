import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');

const WRITE = process.argv.includes('--write');

/*
 * OSS Role normalization.
 *
 * `roles` answers "which open-source ROLE is this lesson about" — distinct from
 * `audience` ("who was it designed for", normalized separately in
 * normalize-audience.mjs). This collapses the 8 raw role values onto 4 canonical
 * OSS roles. Source: the `roles` array + legacy `ossRole` string only — NOT
 * audience. Research Software Engineer is a professional background (an audience
 * persona), not an OSS role, so it is dropped here. User/Consumer is dropped
 * (an intro lesson with no specific role is legitimately role-less).
 */

export const ROLES = ['Contributor', 'Maintainer', 'Community Manager', 'Project Lead'];

const ROLE_MAP = {
  'contributor': 'Contributor',
  'maintainer': 'Maintainer',
  'community manager': 'Community Manager',
  'project lead': 'Project Lead',
  'ip': 'Project Lead',          // IP / governance fold into Lead
  'governance': 'Project Lead',
  'research software engineer': null, // a persona → audience, not an OSS role
  'user/consumer': null,         // intro lessons are legitimately role-less
};

async function main() {
  const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));

  const counts = Object.fromEntries(ROLES.map((r) => [r, 0]));
  const noRole = [];
  const unmapped = new Set();
  let active = 0;
  let changed = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    if ((data.keepStatus || 'keepCandidate') === 'drop') continue;
    active++;

    const sources = [
      ...(Array.isArray(data.roles) ? data.roles : []),
      ...(data.ossRole ? [data.ossRole] : []),
    ];

    const roles = new Set();
    for (const raw of sources) {
      const key = raw.trim().toLowerCase();
      if (!key) continue;
      if (!(key in ROLE_MAP)) { unmapped.add(key); continue; }
      if (ROLE_MAP[key]) roles.add(ROLE_MAP[key]);
    }

    const sorted = [...roles].sort();
    sorted.forEach((r) => (counts[r] += 1));
    if (sorted.length === 0) noRole.push(file);

    if (JSON.stringify(data.roles || []) !== JSON.stringify(sorted)) {
      changed++;
      if (WRITE) {
        data.roles = sorted;
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      }
    }
  }

  console.log('='.repeat(60));
  console.log(`OSS ROLE NORMALIZATION  (${WRITE ? 'WRITE' : 'DRY RUN — use --write to persist'})`);
  console.log('='.repeat(60));
  console.log(`Active lessons: ${active}   Files changed: ${changed}\n`);
  console.log(`Role distribution (${ROLES.length}-term vocab):`);
  for (const r of ROLES) console.log(`  ${String(counts[r]).padStart(2)}  ${r}`);

  if (unmapped.size) {
    console.log(`\n⚠ UNMAPPED role values (${unmapped.size}):`);
    [...unmapped].sort().forEach((k) => console.log(`  - ${k}`));
  } else {
    console.log('\n✓ All role values mapped.');
  }
  if (noRole.length) {
    console.log(`\nℹ Role-agnostic lessons (${noRole.length}) — no specific OSS role (expected for intros):`);
    noRole.forEach((f) => console.log(`  - ${f}`));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
