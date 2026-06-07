/**
 * HOW TO RUN:
 * Ensure you are using Node 18 or higher.
 * Run from the root of your project:
 * node scripts/check-lesson-urls.mjs
 *
 * Output: Generates a `url-report.md` file to scripts/output/.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');
const REPORT_FILE = path.join(__dirname, '../scripts/output/url-report.md');

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const CONCURRENCY = 4;

async function fetchWithTimeout(url, method, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; uc-ospo-url-checker/1.0)',
      },
    });
    clearTimeout(timeoutId);
    return { ok: true, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      error: error?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : (error?.message || 'network error'),
    };
  }
}

async function checkUrl(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const headResult = await fetchWithTimeout(url, 'HEAD', TIMEOUT_MS);
    if (headResult.ok && headResult.status >= 200 && headResult.status < 400) {
      return { status: '✅ OK', code: headResult.status };
    }

    // Fall back to GET — some servers block HEAD requests
    const getResult = await fetchWithTimeout(url, 'GET', TIMEOUT_MS);
    if (getResult.ok && getResult.status >= 200 && getResult.status < 400) {
      return { status: '✅ OK', code: getResult.status };
    }

    if (getResult.ok) {
      if (attempt < retries) continue;
      return { status: '❌ Error', code: getResult.status };
    }

    if (attempt === retries) {
      return { status: '❌ Dead', code: 'N/A', details: getResult.error };
    }
  }
}

async function runWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }
  const count = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: count }, () => worker()));
  return results;
}

async function runAudit() {
  console.log('🔍 Starting Lesson URL Audit...');

  const files = await fs.readdir(CONTENT_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const structuralGaps = [];
  const candidates = [];
  let dropCount = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');

    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      structuralGaps.push({ lesson: file, file, details: `Invalid JSON: ${e.message}` });
      continue;
    }

    if (String(data.keepStatus || '').trim() === 'drop') {
      dropCount++;
      continue;
    }

    const lessonName = data.name || file;
    const url = typeof data.url === 'string' ? data.url.trim() : '';

    if (!url) {
      structuralGaps.push({ lesson: lessonName, file, details: 'Missing url field' });
      continue;
    }

    candidates.push({ lesson: lessonName, file, url });
  }

  console.log(`📋 ${jsonFiles.length} total: ${candidates.length} to check, ${dropCount} drop (skipped), ${structuralGaps.length} structural gap(s)`);
  console.log(`🔗 Checking ${candidates.length} URLs (concurrency: ${CONCURRENCY})...`);

  let checkedCount = 0;
  const reachabilityResults = await runWithConcurrency(candidates, CONCURRENCY, async (entry) => {
    const result = await checkUrl(entry.url);
    checkedCount++;
    process.stdout.write(`\r  ${checkedCount}/${candidates.length} checked...`);
    return { ...entry, ...result };
  });
  console.log('');

  const failures = reachabilityResults.filter(r => r.status.includes('❌'));
  const ok = reachabilityResults.filter(r => r.status.includes('✅'));

  console.log('\n📝 Generating report...');

  const now = new Date().toUTCString();
  let md = `# Lesson URL Audit Report\n\n`;
  md += `*Generated: ${now}*\n\n`;

  md += `## Summary\n\n`;
  md += `| | Count |\n| :--- | ---: |\n`;
  md += `| Total lessons | ${jsonFiles.length} |\n`;
  md += `| Drop (skipped) | ${dropCount} |\n`;
  md += `| Structural gaps | ${structuralGaps.length} |\n`;
  md += `| URLs checked | ${candidates.length} |\n`;
  md += `| ✅ OK | ${ok.length} |\n`;
  md += `| ❌ Dead / Error | ${failures.length} |\n\n`;

  if (structuralGaps.length > 0) {
    md += `## Structural Gaps\n\n`;
    md += `Lessons missing a \`url\` field or with invalid JSON. Fix these in the lesson content files.\n\n`;
    md += `| Lesson (File) | Issue |\n| :--- | :--- |\n`;
    structuralGaps.forEach(r => {
      md += `| **${r.lesson}**<br>(\`${r.file}\`) | ${r.details} |\n`;
    });
    md += '\n';
  }

  if (failures.length > 0) {
    md += `## Reachability Failures\n\n`;
    md += `These lesson URLs returned errors. Verify each link and update or remove as appropriate.\n\n`;
    md += `| Status | Code | Lesson (File) | URL | Details |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    failures.forEach(r => {
      md += `| ${r.status} | ${r.code} | **${r.lesson}**<br>(\`${r.file}\`) | [Link](${r.url}) | ${r.details || ''} |\n`;
    });
    md += '\n';
  }

  md += `## All Results\n\n`;
  md += `| Status | Code | Lesson (File) | URL |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  [...failures, ...ok].forEach(r => {
    md += `| ${r.status} | ${r.code} | **${r.lesson}**<br>(\`${r.file}\`) | [Link](${r.url}) |\n`;
  });

  await fs.writeFile(REPORT_FILE, md, 'utf-8');

  console.log('='.repeat(50));
  console.log(`✅ Audit complete! Checked ${checkedCount} URLs.`);
  if (failures.length > 0) console.log(`❌ ${failures.length} dead/error link(s) found.`);
  if (structuralGaps.length > 0) console.log(`⚠️  ${structuralGaps.length} structural gap(s).`);
  console.log(`📄 Report: ${REPORT_FILE}`);
  console.log('='.repeat(50));
}

runAudit();
