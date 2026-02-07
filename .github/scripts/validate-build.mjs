#!/usr/bin/env node
// Build output validation script for PR checks
// Ensures critical pages and assets exist after build

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

// Critical pages that must exist
const CRITICAL_PAGES = [
  'index.html',
  'lessons/index.html',
  'pathways/index.html',
  'for-educators/index.html',
  'develop-a-lesson/index.html'
];

// Critical assets
const CRITICAL_ASSETS = [
  'styles.css',
  'uc-ospo-logo.svg'
];

function checkFile(filePath) {
  const fullPath = path.join(DIST_DIR, filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    const stats = fs.statSync(fullPath);
    // Check if file is suspiciously small (likely empty or error page)
    if (stats.size < 100) {
      return { exists: true, warning: `File is suspiciously small (${stats.size} bytes)` };
    }
    return { exists: true, size: stats.size };
  }

  return { exists: false };
}

async function main() {
  console.log('🏗️  Validating build output...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found');
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Check critical pages
  console.log('📄 Checking critical pages:');
  for (const page of CRITICAL_PAGES) {
    const result = checkFile(page);
    if (!result.exists) {
      console.error(`   ❌ ${page}`);
      errors.push(`Missing critical page: ${page}`);
    } else if (result.warning) {
      console.warn(`   ⚠️  ${page} - ${result.warning}`);
      warnings.push(`${page}: ${result.warning}`);
    } else {
      console.log(`   ✅ ${page} (${(result.size / 1024).toFixed(1)} KB)`);
    }
  }

  // Check critical assets
  console.log('\n🎨 Checking critical assets:');
  for (const asset of CRITICAL_ASSETS) {
    const result = checkFile(asset);
    if (!result.exists) {
      console.error(`   ❌ ${asset}`);
      errors.push(`Missing critical asset: ${asset}`);
    } else {
      console.log(`   ✅ ${asset} (${(result.size / 1024).toFixed(1)} KB)`);
    }
  }

  // Check for HTML files (should have at least 10)
  const htmlFiles = [];
  function findHTML(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findHTML(fullPath);
      } else if (entry.name.endsWith('.html')) {
        htmlFiles.push(path.relative(DIST_DIR, fullPath));
      }
    }
  }
  findHTML(DIST_DIR);

  console.log(`\n📊 Total HTML pages generated: ${htmlFiles.length}`);

  if (htmlFiles.length < 10) {
    warnings.push(`Only ${htmlFiles.length} HTML pages generated. Expected at least 10.`);
    console.warn('   ⚠️  Fewer pages than expected');
  }

  // Summary
  console.log('\n' + '='.repeat(50));

  if (errors.length > 0) {
    console.error(`\n❌ Build validation failed with ${errors.length} error(s):`);
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  Build completed with ${warnings.length} warning(s):`);
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  console.log('\n✅ Build validation passed!');
  process.exit(0);
}

main();
