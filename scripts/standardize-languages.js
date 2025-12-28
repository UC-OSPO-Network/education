#!/usr/bin/env node
// Standardize inLanguage field to IETF BCP 47 codes

import { getLessons, generateCSVUpdate } from './lib/spreadsheet.js';

const LANGUAGE_MAP = {
  'english': 'en',
  'spanish': 'es',
  'español': 'es',
  'french': 'fr',
  'français': 'fr',
  'german': 'de',
  'deutsch': 'de',
  'italian': 'it',
  'portuguese': 'pt',
  'russian': 'ru',
  'русский': 'ru',
  'chinese': 'zh',
  'chinese (traditional)': 'zh-TW',
  '繁體中文': 'zh-TW',
  'chinese (simplified)': 'zh-CN',
  '简体中文': 'zh-CN',
  'japanese': 'ja',
  '日本語': 'ja',
  'korean': 'ko',
  '한국어': 'ko',
  'arabic': 'ar',
  'hindi': 'hi',
  'dutch': 'nl',
  'polish': 'pl',
  'turkish': 'tr',
  'türkçe': 'tr',
  'indonesian': 'id',
  'malay': 'ms',
  'swahili': 'sw',
  'bengali': 'bn',
  'bangla': 'bn',
  'bulgarian': 'bg',
  'български': 'bg',
  'greek': 'el',
  'ελληνικά': 'el',
  'persian': 'fa',
  'farsi': 'fa',
  'hungarian': 'hu',
  'magyar': 'hu',
  'romanian': 'ro',
  'tamil': 'ta',
  'தமிழ்': 'ta',
  'nigerian pidgin': 'pcm'
};

function parseLanguages(text) {
  if (!text || text.trim() === '') {
    return 'en'; // Default to English
  }

  // Split by common separators
  const languages = text.split(/[,;/]/).map(lang => lang.trim().toLowerCase());

  const codes = languages.map(lang => {
    // Check if already a language code (e.g., "en", "es")
    if (/^[a-z]{2}(-[A-Z]{2})?$/.test(lang)) {
      return lang;
    }

    // Look up in map
    if (LANGUAGE_MAP[lang]) {
      return LANGUAGE_MAP[lang];
    }

    // Try to extract language code from longer strings
    for (const [key, value] of Object.entries(LANGUAGE_MAP)) {
      if (lang.includes(key)) {
        return value;
      }
    }

    // Keep as-is if can't map
    return lang;
  });

  // Remove duplicates and return
  return [...new Set(codes)].join(', ');
}

function standardizeLanguage(lesson) {
  const current = lesson.inLanguage;

  if (!current || current.trim() === '') {
    return {
      inLanguage: 'en',
      _updated: true
    };
  }

  const standardized = parseLanguages(current);

  if (standardized === current) {
    return {
      inLanguage: current,
      _updated: false
    };
  }

  return {
    inLanguage: standardized,
    _updated: true,
    _original: current
  };
}

async function main() {
  console.log('🔍 Starting language code standardization...\n');

  const lessons = await getLessons();
  const updates = [];
  let updated = 0;
  let unchanged = 0;

  for (const lesson of lessons) {
    const result = standardizeLanguage(lesson);

    if (result._updated) {
      console.log(`✏️  ${lesson.name}`);
      console.log(`   Old: ${result._original || '(empty)'}`);
      console.log(`   New: ${result.inLanguage}`);
      updated++;
    } else {
      unchanged++;
    }

    updates.push({
      ...lesson,
      inLanguage: result.inLanguage
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total lessons: ${lessons.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);

  // Export results
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `scripts/output/languages-${timestamp}.csv`;

  generateCSVUpdate(updates, filename);

  console.log('\n✅ Done! Review the CSV and import to Google Sheets.');
}

main().catch(console.error);
