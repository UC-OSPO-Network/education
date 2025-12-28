#!/usr/bin/env node
// Estimate timeRequired for lessons based on content length and type

import { fetchPage, extractText } from './lib/fetcher.js';
import { getLessons, shouldProcess, generateCSVUpdate } from './lib/spreadsheet.js';

const READING_SPEED = 200; // words per minute (average adult)

const CONTENT_TYPE_MULTIPLIERS = {
  'video': 1.0,          // Watch at normal speed
  'tutorial': 2.5,       // Hands-on practice time
  'guide': 1.2,          // Reading + comprehension
  'reference': 0.8,      // Skimming reference
  'interactive': 3.0,    // Doing exercises
  'course': 1.5,         // Mixed content
  'default': 1.5         // Conservative estimate
};

function detectContentType(html, url) {
  const htmlLower = html.toLowerCase();
  const urlLower = url.toLowerCase();

  if (htmlLower.includes('youtube') || htmlLower.includes('video') || htmlLower.includes('<video')) {
    return 'video';
  }

  if (htmlLower.includes('tutorial') || urlLower.includes('tutorial')) {
    return 'tutorial';
  }

  if (htmlLower.includes('interactive') || htmlLower.includes('exercise')) {
    return 'interactive';
  }

  if (htmlLower.includes('course') || urlLower.includes('course')) {
    return 'course';
  }

  if (htmlLower.includes('reference') || htmlLower.includes('documentation')) {
    return 'reference';
  }

  if (htmlLower.includes('guide') || urlLower.includes('guide')) {
    return 'guide';
  }

  return 'default';
}

function formatISO8601(minutes) {
  if (minutes < 1) return 'PT5M'; // Minimum 5 minutes

  if (minutes < 60) {
    return `PT${Math.round(minutes)}M`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) {
    return `PT${hours}H`;
  }

  return `PT${hours}H${mins}M`;
}

async function estimateTime(lesson) {
  try {
    const html = await fetchPage(lesson.url);
    const text = extractText(html);
    const wordCount = text.split(/\s+/).length;

    // Detect content type
    const contentType = detectContentType(html, lesson.url);
    const multiplier = CONTENT_TYPE_MULTIPLIERS[contentType] || CONTENT_TYPE_MULTIPLIERS.default;

    // Calculate base reading time
    const baseMinutes = wordCount / READING_SPEED;

    // Apply multiplier
    const estimatedMinutes = baseMinutes * multiplier;

    // Format as ISO 8601
    const duration = formatISO8601(estimatedMinutes);

    console.log(`  Words: ${wordCount.toLocaleString()}`);
    console.log(`  Type: ${contentType} (${multiplier}x)`);
    console.log(`  Estimated: ${duration}`);

    return {
      timeRequired: duration,
      _wordCount: wordCount,
      _contentType: contentType,
      _needsReview: estimatedMinutes > 300 // Flag if >5 hours
    };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      timeRequired: null,
      _error: error.message,
      _needsReview: true
    };
  }
}

async function main() {
  console.log('🔍 Starting timeRequired estimation...\n');

  const lessons = await getLessons();
  const updates = [];
  let processed = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    console.log(`\n[${processed + skipped + 1}/${lessons.length}] ${lesson.name}`);

    // Skip if already has timeRequired
    if (!shouldProcess(lesson, 'timeRequired')) {
      console.log(`  ⏭️  Skipped (already has value: ${lesson.timeRequired})`);
      skipped++;
      updates.push(lesson);
      continue;
    }

    // Skip if no URL
    if (!lesson.url) {
      console.log(`  ⏭️  Skipped (no URL)`);
      skipped++;
      updates.push(lesson);
      continue;
    }

    const result = await estimateTime(lesson);
    processed++;

    updates.push({
      ...lesson,
      ...result
    });

    // Rate limiting: wait 1 second between requests
    if (processed < lessons.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total lessons: ${lessons.length}`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Needs review: ${updates.filter(u => u._needsReview).length}`);

  // Export results
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `scripts/output/time-estimates-${timestamp}.csv`;

  generateCSVUpdate(updates, filename);

  // Show lessons that need review
  const needsReview = updates.filter(u => u._needsReview);
  if (needsReview.length > 0) {
    console.log('\n⚠️  Lessons needing review:');
    needsReview.forEach(lesson => {
      console.log(`  - ${lesson.name}: ${lesson.timeRequired || 'ERROR'} ${lesson._error || ''}`);
    });
  }

  console.log('\n✅ Done! Review the CSV and import to Google Sheets.');
}

main().catch(console.error);
