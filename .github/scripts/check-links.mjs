#!/usr/bin/env node
// Link validation script for PR checks
// Checks for broken internal links in the built site

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SITE_BASE = (process.env.SITE_BASE || '/education/').replace(/\/+$/, '');

// Collect all HTML files
function collectHTMLFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHTMLFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Extract internal links from HTML
function extractInternalLinks(html, filePath) {
  const links = [];

  // Match href attributes
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];

    // Skip external links, anchors, mailto, tel, etc.
    if (href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')) {
      continue;
    }

    links.push({ href, file: filePath });
  }

  return links;
}

// Check if a link resolves to a real file
function checkLink(link, baseDir) {
  let targetPath = link.href;

  // Remove query strings and anchors
  targetPath = targetPath.split('?')[0].split('#')[0];

  const candidatePaths = [];

  // Handle absolute paths
  if (targetPath.startsWith('/')) {
    const absolute = targetPath.replace(/^\/+/, '');
    const normalizedBase = SITE_BASE.replace(/^\/+/, '');

    // Astro static builds keep files at dist root even when links are base-prefixed
    // (e.g. /education/lessons -> dist/lessons/index.html).
    if (normalizedBase) {
      const basePrefix = `${normalizedBase}/`;
      if (absolute === normalizedBase || absolute.startsWith(basePrefix)) {
        const withoutBase = absolute.slice(normalizedBase.length).replace(/^\/+/, '');
        candidatePaths.push(path.join(baseDir, withoutBase));
      }
    }

    candidatePaths.push(path.join(baseDir, absolute));
  } else {
    // Handle relative paths
    const linkDir = path.dirname(link.file);
    candidatePaths.push(path.join(linkDir, targetPath));
  }

  for (const candidate of candidatePaths) {
    const normalizedCandidate = path.normalize(candidate);

    // Check if file exists
    if (fs.existsSync(normalizedCandidate)) {
      return { valid: true };
    }

    // Check with .html extension
    if (fs.existsSync(normalizedCandidate + '.html')) {
      return { valid: true };
    }

    // Check if it's a directory with index.html
    if (fs.existsSync(path.join(normalizedCandidate, 'index.html'))) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    error: `Link points to non-existent path: ${targetPath}`
  };
}

async function main() {
  console.log('🔗 Checking internal links...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Build the site first.');
    process.exit(1);
  }

  // Collect all HTML files
  const htmlFiles = collectHTMLFiles(DIST_DIR);
  console.log(`Found ${htmlFiles.length} HTML files\n`);

  if (htmlFiles.length === 0) {
    console.error('❌ No HTML files found in dist/');
    process.exit(1);
  }

  // Extract and check all links
  const allLinks = [];
  const brokenLinks = [];

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf-8');
    const links = extractInternalLinks(html, file);
    allLinks.push(...links);
  }

  console.log(`Checking ${allLinks.length} internal links...\n`);

  // Check each unique link
  const checkedLinks = new Set();

  for (const link of allLinks) {
    const linkKey = `${link.file}::${link.href}`;

    // Skip if already checked
    if (checkedLinks.has(linkKey)) {
      continue;
    }
    checkedLinks.add(linkKey);

    const result = checkLink(link, DIST_DIR);

    if (!result.valid) {
      brokenLinks.push({
        file: path.relative(DIST_DIR, link.file),
        href: link.href,
        error: result.error
      });
    }
  }

  // Report results
  if (brokenLinks.length > 0) {
    console.error(`❌ Found ${brokenLinks.length} broken internal links:\n`);

    // Group by file
    const byFile = {};
    brokenLinks.forEach(link => {
      if (!byFile[link.file]) byFile[link.file] = [];
      byFile[link.file].push(link.href);
    });

    Object.entries(byFile).forEach(([file, links]) => {
      console.error(`📄 ${file}`);
      links.forEach(link => console.error(`   ❌ ${link}`));
      console.error('');
    });

    process.exit(1);
  } else {
    console.log(`✅ All ${checkedLinks.size} internal links are valid!`);
    process.exit(0);
  }
}

main();
