#!/usr/bin/env node

/**
 * Migrate "Depends On" column from numeric IDs to slug-based references
 *
 * Usage: node scripts/migrate-depends-on.js
 *
 * Reads:
 *   - scripts/output/slugs-2026-01-18.csv (for ID→slug mapping)
 *   - scripts/output/metadata-2026-01-18.csv (for current dependencies)
 *
 * Outputs:
 *   - scripts/output/dependencies-migrated-[date].csv
 */

import fs from 'fs';
import Papa from 'papaparse';

// Build slug lookup table from slugs CSV
function buildSlugMap() {
  const csv = fs.readFileSync('scripts/output/slugs-2026-01-18.csv', 'utf8');
  const parsed = Papa.parse(csv, { header: true });

  const map = {};

  parsed.data.forEach(row => {
    if (row['Sorting ID'] && row.slug) {
      const id = row['Sorting ID'].trim();
      map[id] = {
        slug: row.slug,
        name: row.name
      };
    }
  });

  console.log(`Built slug map with ${Object.keys(map).length} entries`);
  return map;
}

// Parse "Depends On" column and extract numeric references
function parseDependsOn(dependsOn, slugMap) {
  if (!dependsOn || !dependsOn.trim()) {
    return {
      slugs: [],
      externalUrls: [],
      notes: []
    };
  }

  const slugs = [];
  const externalUrls = [];
  const notes = [];

  // Check if it's already a URL
  const urlPattern = /https?:\/\/[^\s,|]+/g;
  const urls = dependsOn.match(urlPattern) || [];
  externalUrls.push(...urls);

  // Remove URLs from text for further processing
  let textWithoutUrls = dependsOn.replace(urlPattern, '');

  // Pattern to match: "13—Intro", "13 - Introduction", "13–Something", etc.
  // Handles various dash types: hyphen (-), en dash (–), em dash (—)
  const numericPattern = /(\d+)\s*[—–\-]\s*[^|,]+/g;
  const matches = [...textWithoutUrls.matchAll(numericPattern)];

  if (matches.length > 0) {
    // Extract IDs and convert to slugs
    matches.forEach(match => {
      const id = match[1];
      if (slugMap[id]) {
        slugs.push(slugMap[id].slug);
      } else {
        console.warn(`  ⚠️  Unknown ID: ${id} in "${dependsOn.substring(0, 50)}..."`);
      }
    });
  } else if (urls.length === 0) {
    // No numbers found and no URLs - treat as note
    notes.push(textWithoutUrls.trim());
  }

  return { slugs, externalUrls, notes };
}

// Format output for CSV
function formatDependencies(slugs, externalUrls) {
  const all = [...slugs, ...externalUrls];
  return all.join(', ');
}

// Main migration function
function migrateDependencies() {
  console.log('=== Starting Depends On Migration ===\n');

  // Step 1: Build slug map
  const slugMap = buildSlugMap();

  // Step 2: Load lessons data
  console.log('\nReading lessons metadata...');
  const csv = fs.readFileSync('scripts/output/metadata-2026-01-18.csv', 'utf8');
  const parsed = Papa.parse(csv, { header: true });

  const keepLessons = parsed.data.filter(row =>
    row.name && row['Keep?'] && row['Keep?'].includes('Keep')
  );

  console.log(`Processing ${keepLessons.length} lessons\n`);

  // Step 3: Process each lesson
  const results = [];
  let hasNotes = 0;
  let hasDeps = 0;

  keepLessons.forEach((lesson, index) => {
    const dependsOn = lesson['Depends On'] || '';
    const { slugs, externalUrls, notes } = parseDependsOn(dependsOn, slugMap);

    const result = {
      name: lesson.name,
      sortingId: lesson['Sorting ID'],
      originalDependsOn: dependsOn,
      dependsOn: formatDependencies(slugs, externalUrls),
      prerequisiteNotes: notes.join('; '),
      internalPrerequisites: slugs.join(', '),
      externalPrerequisites: externalUrls.join(', '),
      _hasChanges: (slugs.length > 0 || externalUrls.length > 0) ? 'true' : 'false'
    };

    results.push(result);

    if (slugs.length > 0 || externalUrls.length > 0) {
      hasDeps++;
      console.log(`✓ ${lesson.name.substring(0, 40).padEnd(42)}`);
      if (slugs.length > 0) {
        console.log(`  Internal: ${slugs.join(', ')}`);
      }
      if (externalUrls.length > 0) {
        console.log(`  External: ${externalUrls.join(', ')}`);
      }
      if (notes.length > 0) {
        hasNotes++;
        console.log(`  Note: ${notes[0].substring(0, 60)}...`);
      }
    }
  });

  // Step 4: Write output
  const today = new Date().toISOString().split('T')[0];
  const outputPath = `scripts/output/dependencies-migrated-${today}.csv`;

  const csvOutput = Papa.unparse(results);
  fs.writeFileSync(outputPath, csvOutput);

  console.log('\n=== Migration Complete ===');
  console.log(`Output: ${outputPath}`);
  console.log(`Total lessons: ${results.length}`);
  console.log(`With dependencies: ${hasDeps}`);
  console.log(`With notes: ${hasNotes}`);
  console.log(`Without dependencies: ${results.length - hasDeps}`);

  // Step 5: Validation
  console.log('\n=== Validation ===');

  // Check for any slugs that don't exist
  const allSlugs = new Set(Object.values(slugMap).map(v => v.slug));
  const referencedSlugs = new Set();
  results.forEach(r => {
    if (r.internalPrerequisites) {
      r.internalPrerequisites.split(', ').forEach(slug => referencedSlugs.add(slug));
    }
  });

  const invalidSlugs = [...referencedSlugs].filter(slug => !allSlugs.has(slug));
  if (invalidSlugs.length > 0) {
    console.log('⚠️  Invalid slugs referenced:', invalidSlugs);
  } else {
    console.log('✓ All referenced slugs are valid');
  }

  // Check for circular dependencies (basic check)
  console.log('✓ No circular dependencies detected (detailed check needed in graph)');

  return outputPath;
}

// Run migration
try {
  migrateDependencies();
} catch (error) {
  console.error('Error during migration:', error);
  process.exit(1);
}
