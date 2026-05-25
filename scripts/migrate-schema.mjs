#!/usr/bin/env node
// One-shot migration: ossRole → roles[], learnerCategory → pathways[], dependsOn → prerequisites[]
// Safe to re-run (skips files already migrated).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { glob } from 'node:fs/promises';

const LESSON_DIR = resolve(process.cwd(), 'src/content/lessons');

const CATEGORY_TO_ID = {
  'Getting Started with Open Source': 'getting-started',
  'Contributing to a Project': 'contributing',
  'Maintaining & Sustaining Software': 'maintaining',
  'Building Community': 'building-communities',
  'Understanding Licensing & Compliance': 'licensing',
  'Strategic Practices & Career Development': 'strategic',
};

let migrated = 0;
let skipped = 0;

for await (const file of glob(`${LESSON_DIR}/*.json`)) {
  const data = JSON.parse(readFileSync(file, 'utf-8'));
  let changed = false;

  // roles: migrate only if ossRole exists and roles is missing/empty
  if ('ossRole' in data && (!data.roles || data.roles.length === 0)) {
    data.roles = data.ossRole
      ? data.ossRole.split(',').map((r) => r.trim()).filter(Boolean)
      : [];
    delete data.ossRole;
    changed = true;
  }

  // pathways: migrate only if learnerCategory exists and pathways is missing/empty
  if ('learnerCategory' in data && (!data.pathways || data.pathways.length === 0)) {
    const id = CATEGORY_TO_ID[data.learnerCategory];
    data.pathways = id ? [id] : data.learnerCategory ? [data.learnerCategory] : [];
    delete data.learnerCategory;
    changed = true;
  }

  // prerequisites: migrate only if dependsOn exists and prerequisites is missing/empty
  if ('dependsOn' in data && (!data.prerequisites || data.prerequisites.length === 0)) {
    data.prerequisites = (data.dependsOn ?? [])
      .filter((v) => typeof v === 'string' && v.trim())
      .map((v) => ({ type: v.startsWith('http') ? 'url' : 'lesson', value: v }));
    delete data.dependsOn;
    changed = true;
  }

  if (changed) {
    writeFileSync(file, JSON.stringify(data, null, 4));
    console.log(`migrated: ${file.split('/').at(-1)}`);
    migrated++;
  } else {
    skipped++;
  }
}

console.log(`\nDone: ${migrated} migrated, ${skipped} already up-to-date.`);
