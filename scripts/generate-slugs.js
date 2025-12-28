/**
 * Generate unique slugs for all lessons
 *
 * Creates URL-friendly identifiers from lesson names for:
 * - Lesson detail page URLs (/lessons/building-community)
 * - Bioschemas @id property (https://education.ucospo.net/lessons/building-community)
 *
 * Usage: node scripts/generate-slugs.js
 * Output: scripts/output/slugs-YYYY-MM-DD.csv
 */

import { getLessons, generateCSVUpdate } from './lib/spreadsheet.js';

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} URL-friendly slug
 */
function slugify(text) {
  return text
    .toLowerCase()                    // "Building Community" → "building community"
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars (keep spaces, hyphens)
    .trim()                           // Remove leading/trailing spaces
    .replace(/\s+/g, '-')            // Spaces → hyphens
    .replace(/-+/g, '-');            // Collapse multiple hyphens
}

/**
 * Generate unique slugs for all lessons
 */
async function generateSlugs() {
  console.log('🔧 Generating slugs for all lessons...\n');

  const lessons = await getLessons();
  const slugs = new Set();
  const updates = [];
  let duplicateCount = 0;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    let slug = slugify(lesson.name);

    // Handle duplicate slugs
    if (slugs.has(slug)) {
      duplicateCount++;
      let counter = 2;
      const originalSlug = slug;

      while (slugs.has(`${originalSlug}-${counter}`)) {
        counter++;
      }

      slug = `${originalSlug}-${counter}`;
      console.log(`⚠️  [${i + 1}/${lessons.length}] Duplicate detected: "${lesson.name}"`);
      console.log(`    Original slug: ${originalSlug}`);
      console.log(`    Updated slug: ${slug}\n`);
    } else {
      console.log(`✅ [${i + 1}/${lessons.length}] ${lesson.name}`);
      console.log(`    → ${slug}\n`);
    }

    slugs.add(slug);

    updates.push({
      ...lesson,
      slug: slug,
      '@id': `https://education.ucospo.net/lessons/${slug}`
    });
  }

  // Generate CSV output
  const today = new Date().toISOString().split('T')[0];
  const filename = `scripts/output/slugs-${today}.csv`;

  await generateCSVUpdate(updates, filename);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SLUG GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total lessons processed: ${lessons.length}`);
  console.log(`✅ Unique slugs generated: ${slugs.size}`);
  console.log(`⚠️  Duplicate names handled: ${duplicateCount}`);
  console.log(`\n📄 Output: ${filename}`);
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Open the CSV file to review generated slugs');
  console.log('2. Check lessons flagged with duplicate handling');
  console.log('3. Verify slugs look reasonable for URLs');
  console.log('4. Copy "slug" and "@id" columns to Google Sheets');
  console.log('='.repeat(60));
}

// Run
generateSlugs().catch(error => {
  console.error('❌ Error generating slugs:', error.message);
  process.exit(1);
});
