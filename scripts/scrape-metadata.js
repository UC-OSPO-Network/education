#!/usr/bin/env node
// Scrape author, license, and date metadata from lesson URLs

import { fetchPage, extractMetaTag, extractJSONLD } from './lib/fetcher.js';
import { getLessons, shouldProcess, generateCSVUpdate } from './lib/spreadsheet.js';

const ORG_DOMAIN_MAP = {
  'opensource.guide': 'GitHub',
  'choosealicense.com': 'GitHub',
  'carpentries.org': 'The Carpentries',
  'docs.github.com': 'GitHub',
  'github.blog': 'GitHub',
  'opensource.com': 'Opensource.com',
  'opensource.org': 'Open Source Initiative',
  'fsf.org': 'Free Software Foundation',
  'creativecommons.org': 'Creative Commons'
};

const LICENSE_MAP = {
  'MIT License': 'MIT',
  'Apache License 2.0': 'Apache-2.0',
  'Apache 2.0': 'Apache-2.0',
  'GPL': 'GPL-3.0',
  'GNU General Public License': 'GPL-3.0',
  'CC BY 4.0': 'CC-BY-4.0',
  'CC-BY-4.0': 'CC-BY-4.0',
  'CC BY-SA 4.0': 'CC-BY-SA-4.0',
  'CC-BY-SA-4.0': 'CC-BY-SA-4.0',
  'CC0': 'CC0-1.0',
  'Public Domain': 'CC0-1.0'
};

function extractAuthor(html, url) {
  // 1. Check meta tags
  const metaAuthor = extractMetaTag(html, 'author') ||
                     extractMetaTag(html, 'article:author') ||
                     extractMetaTag(html, 'og:author');
  if (metaAuthor) return metaAuthor;

  // 2. Check JSON-LD
  const jsonLD = extractJSONLD(html);
  if (jsonLD?.author) {
    if (typeof jsonLD.author === 'string') return jsonLD.author;
    if (jsonLD.author.name) return jsonLD.author.name;
  }

  // 3. Check for byline patterns
  const bylinePatterns = [
    /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /author[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /<span class=["']author["']>([^<]+)<\/span>/i,
    /<a[^>]+class=["']author["'][^>]*>([^<]+)<\/a>/i
  ];

  for (const pattern of bylinePatterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }

  // 4. Fallback to domain mapping
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    if (ORG_DOMAIN_MAP[domain]) {
      return ORG_DOMAIN_MAP[domain];
    }
  } catch (error) {
    // Invalid URL
  }

  return null;
}

function extractLicense(html, url) {
  // 1. Check meta tags
  const metaLicense = extractMetaTag(html, 'license') ||
                      extractMetaTag(html, 'dc.rights');
  if (metaLicense) return normalizeLicense(metaLicense);

  // 2. Check JSON-LD
  const jsonLD = extractJSONLD(html);
  if (jsonLD?.license) {
    return normalizeLicense(jsonLD.license);
  }

  // 3. Check for Creative Commons links
  const ccMatch = html.match(/creativecommons\.org\/licenses\/([^/]+)\/([^/"']+)/i);
  if (ccMatch) {
    const type = ccMatch[1].toUpperCase();
    const version = ccMatch[2];
    return `CC-${type}-${version}`;
  }

  // 4. Search for license text patterns
  const licensePatterns = [
    { pattern: /MIT License/i, license: 'MIT' },
    { pattern: /Apache License,?\s*Version 2\.0/i, license: 'Apache-2.0' },
    { pattern: /Apache 2\.0/i, license: 'Apache-2.0' },
    { pattern: /GPL v?3/i, license: 'GPL-3.0' },
    { pattern: /GNU General Public License/i, license: 'GPL-3.0' },
    { pattern: /CC BY 4\.0/i, license: 'CC-BY-4.0' },
    { pattern: /CC BY-SA 4\.0/i, license: 'CC-BY-SA-4.0' },
    { pattern: /CC0 1\.0/i, license: 'CC0-1.0' },
    { pattern: /Public Domain/i, license: 'CC0-1.0' }
  ];

  for (const { pattern, license } of licensePatterns) {
    if (pattern.test(html)) {
      return license;
    }
  }

  // 5. Check footer area specifically
  const footerMatch = html.match(/<footer[^>]*>(.*?)<\/footer>/is);
  if (footerMatch) {
    const footer = footerMatch[1];
    for (const { pattern, license } of licensePatterns) {
      if (pattern.test(footer)) {
        return license;
      }
    }
  }

  return null;
}

function normalizeLicense(text) {
  if (!text) return null;

  // Direct lookup
  if (LICENSE_MAP[text]) return LICENSE_MAP[text];

  // Check if already SPDX format
  if (/^[A-Z0-9]+-[0-9.]+$/i.test(text)) return text;

  // Extract from URL
  if (text.includes('creativecommons.org')) {
    const match = text.match(/\/licenses\/([^/]+)\/([^/]+)/);
    if (match) return `CC-${match[1].toUpperCase()}-${match[2]}`;
  }

  return text; // Return as-is if can't normalize
}

function extractDates(html) {
  const dates = {
    dateCreated: null,
    dateModified: null,
    datePublished: null
  };

  // Check meta tags
  dates.dateCreated = extractMetaTag(html, 'article:created_time') ||
                      extractMetaTag(html, 'dcterms.created');

  dates.dateModified = extractMetaTag(html, 'article:modified_time') ||
                       extractMetaTag(html, 'dcterms.modified') ||
                       extractMetaTag(html, 'last-modified');

  dates.datePublished = extractMetaTag(html, 'article:published_time') ||
                        extractMetaTag(html, 'dcterms.date') ||
                        extractMetaTag(html, 'date');

  // Check JSON-LD
  const jsonLD = extractJSONLD(html);
  if (jsonLD) {
    dates.dateCreated = dates.dateCreated || jsonLD.dateCreated;
    dates.dateModified = dates.dateModified || jsonLD.dateModified;
    dates.datePublished = dates.datePublished || jsonLD.datePublished;
  }

  // Normalize to YYYY-MM-DD
  for (const key in dates) {
    if (dates[key]) {
      try {
        const date = new Date(dates[key]);
        if (!isNaN(date)) {
          dates[key] = date.toISOString().split('T')[0];
        }
      } catch (error) {
        // Keep original value if can't parse
      }
    }
  }

  return dates;
}

async function scrapeMetadata(lesson) {
  try {
    const html = await fetchPage(lesson.url);

    const author = extractAuthor(html, lesson.url);
    const license = extractLicense(html, lesson.url);
    const dates = extractDates(html);

    console.log(`  Author: ${author || '(not found)'}`);
    console.log(`  License: ${license || '(not found)'}`);
    console.log(`  Published: ${dates.datePublished || '(not found)'}`);

    return {
      author: author || lesson.author,
      license: license || lesson.license,
      dateCreated: dates.dateCreated || lesson.dateCreated,
      dateModified: dates.dateModified || lesson.dateModified,
      datePublished: dates.datePublished || lesson.datePublished,
      _needsReview: !author || !license
    };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      author: lesson.author,
      license: lesson.license,
      dateCreated: lesson.dateCreated,
      dateModified: lesson.dateModified,
      datePublished: lesson.datePublished,
      _error: error.message,
      _needsReview: true
    };
  }
}

async function main() {
  console.log('🔍 Starting metadata scraping (author, license, dates)...\n');

  const lessons = await getLessons();
  const updates = [];
  let processed = 0;
  let skipped = 0;

  for (const lesson of lessons) {
    console.log(`\n[${processed + skipped + 1}/${lessons.length}] ${lesson.name}`);

    // Check if any fields need updating
    const needsAuthor = shouldProcess(lesson, 'author');
    const needsLicense = shouldProcess(lesson, 'license');
    const needsDates = shouldProcess(lesson, 'datePublished') ||
                       shouldProcess(lesson, 'dateCreated') ||
                       shouldProcess(lesson, 'dateModified');

    if (!needsAuthor && !needsLicense && !needsDates) {
      console.log(`  ⏭️  Skipped (all fields already filled)`);
      skipped++;
      updates.push(lesson);
      continue;
    }

    if (!lesson.url) {
      console.log(`  ⏭️  Skipped (no URL)`);
      skipped++;
      updates.push(lesson);
      continue;
    }

    const result = await scrapeMetadata(lesson);
    processed++;

    updates.push({
      ...lesson,
      ...result
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total lessons: ${lessons.length}`);
  console.log(`Processed: ${processed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Needs review: ${updates.filter(u => u._needsReview).length}`);

  // Count successes
  const foundAuthor = updates.filter(u => u.author && u.author !== lessons.find(l => l.name === u.name)?.author).length;
  const foundLicense = updates.filter(u => u.license && u.license !== lessons.find(l => l.name === u.name)?.license).length;
  const foundDates = updates.filter(u => u.datePublished || u.dateCreated).length;

  console.log(`\nFound author: ${foundAuthor}`);
  console.log(`Found license: ${foundLicense}`);
  console.log(`Found dates: ${foundDates}`);

  // Export results
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `scripts/output/metadata-${timestamp}.csv`;

  generateCSVUpdate(updates, filename);

  // Show lessons that need review
  const needsReview = updates.filter(u => u._needsReview);
  if (needsReview.length > 0) {
    console.log('\n⚠️  Lessons needing manual review:');
    needsReview.forEach(lesson => {
      const missing = [];
      if (!lesson.author) missing.push('author');
      if (!lesson.license) missing.push('license');
      console.log(`  - ${lesson.name}: Missing ${missing.join(', ')}`);
    });
  }

  console.log('\n✅ Done! Review the CSV and import to Google Sheets.');
}

main().catch(console.error);
