/**
 * HOW TO RUN:
 * Ensure you are using Node 20 or higher.
 * Run from the root of your project:
 *   node scripts/check-lesson-urls.mjs
 *
 * To compare against a previous run (delta reporting):
 *   node scripts/check-lesson-urls.mjs --previous-results=scripts/output/url-check-results.json
 *
 * Outputs:
 *   scripts/output/url-report.md       — human-readable markdown report
 *   scripts/output/url-check-results.json — machine-readable results for delta comparison
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');
const OUTPUT_DIR = path.join(__dirname, '../scripts/output');
const REPORT_FILE = path.join(OUTPUT_DIR, 'url-report.md');
const RESULTS_FILE = path.join(OUTPUT_DIR, 'url-check-results.json');

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const CONCURRENCY = 4;

function parseArgs(argv) {
  const args = {};
  for (const token of argv) {
    if (!token.startsWith('--')) continue;
    const [key, value] = token.slice(2).split('=');
    args[key] = value ?? true;
  }
  return args;
}

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return 'unknown'; }
}

async function fetchWithTimeout(url, method, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; uc-ospo-url-checker/1.0)' },
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
  const args = parseArgs(process.argv.slice(2));

  // Load previous results for delta comparison
  let previousResults = null;
  if (args['previous-results']) {
    try {
      const raw = await fs.readFile(path.resolve(process.cwd(), args['previous-results']), 'utf-8');
      previousResults = JSON.parse(raw);
      console.log(`📂 Loaded previous results from ${args['previous-results']} (${previousResults.generatedAt})`);
    } catch {
      console.log('📂 No previous results found — skipping delta comparison');
    }
  }

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

  // Delta computation
  let delta = null;
  if (previousResults) {
    const prevFailureUrls = new Set(previousResults.failures.map(r => r.url));
    const currFailureUrls = new Set(failures.map(r => r.url));
    delta = {
      newFailures: failures.filter(r => !prevFailureUrls.has(r.url)),
      fixed: previousResults.failures.filter(r => !currFailureUrls.has(r.url)),
      recurring: failures.filter(r => prevFailureUrls.has(r.url)),
    };
  }

  // Domain grouping for failures
  const failuresByDomain = failures.reduce((acc, r) => {
    const domain = getDomain(r.url);
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(r);
    return acc;
  }, {});

  console.log('\n📝 Generating report...');

  const now = new Date().toUTCString();
  let md = `# Lesson URL Audit Report\n\n`;
  md += `*Generated: ${now}*\n\n`;

  // Summary
  md += `## Summary\n\n`;
  md += `| | Count |\n| :--- | ---: |\n`;
  md += `| Total lessons | ${jsonFiles.length} |\n`;
  md += `| Drop (skipped) | ${dropCount} |\n`;
  md += `| Structural gaps | ${structuralGaps.length} |\n`;
  md += `| URLs checked | ${candidates.length} |\n`;
  md += `| ✅ OK | ${ok.length} |\n`;
  md += `| ❌ Dead / Error | ${failures.length} |\n`;
  if (delta) {
    md += `| 🆕 New failures | ${delta.newFailures.length} |\n`;
    md += `| ✔️ Fixed since last run | ${delta.fixed.length} |\n`;
    md += `| 🔁 Recurring | ${delta.recurring.length} |\n`;
  }
  md += '\n';

  // Delta section
  if (delta && (delta.newFailures.length > 0 || delta.fixed.length > 0)) {
    md += `## Changes Since Last Run\n\n`;

    if (delta.newFailures.length > 0) {
      md += `### 🆕 New Failures (${delta.newFailures.length})\n\n`;
      md += `| Lesson | URL | Status |\n| :--- | :--- | :--- |\n`;
      delta.newFailures.forEach(r => {
        md += `| **${r.lesson}** | [Link](${r.url}) | ${r.status} ${r.code} |\n`;
      });
      md += '\n';
    }

    if (delta.fixed.length > 0) {
      md += `### ✔️ Fixed (${delta.fixed.length})\n\n`;
      md += `| Lesson | URL |\n| :--- | :--- |\n`;
      delta.fixed.forEach(r => {
        md += `| **${r.lesson}** | [Link](${r.url}) |\n`;
      });
      md += '\n';
    }
  }

  // Structural gaps
  if (structuralGaps.length > 0) {
    md += `## Structural Gaps\n\n`;
    md += `Lessons missing a \`url\` field or with invalid JSON.\n\n`;
    md += `| Lesson (File) | Issue |\n| :--- | :--- |\n`;
    structuralGaps.forEach(r => {
      md += `| **${r.lesson}**<br>(\`${r.file}\`) | ${r.details} |\n`;
    });
    md += '\n';
  }

  // Failures grouped by domain
  if (failures.length > 0) {
    md += `## Reachability Failures\n\n`;
    md += `Verify each link and update or remove the lesson URL as appropriate.\n\n`;

    for (const [domain, domainFailures] of Object.entries(failuresByDomain)) {
      md += `### ${domain} (${domainFailures.length})\n\n`;
      md += `| Status | Code | Lesson | URL | Details |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      domainFailures.forEach(r => {
        md += `| ${r.status} | ${r.code} | **${r.lesson}**<br>(\`${r.file}\`) | [Link](${r.url}) | ${r.details || ''} |\n`;
      });
      md += '\n';
    }
  }

  // Collapsible full results
  md += `<details>\n<summary>All results (${ok.length} ✅ OK, ${failures.length} ❌ Failed)</summary>\n\n`;
  md += `| Status | Code | Lesson | URL |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  [...failures, ...ok].forEach(r => {
    md += `| ${r.status} | ${r.code} | **${r.lesson}**<br>(\`${r.file}\`) | [Link](${r.url}) |\n`;
  });
  md += `\n</details>\n`;

  await fs.writeFile(REPORT_FILE, md, 'utf-8');

  // Write machine-readable results for next run's delta comparison
  const resultsJson = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: jsonFiles.length,
      dropped: dropCount,
      structuralGaps: structuralGaps.length,
      checked: candidates.length,
      ok: ok.length,
      failures: failures.length,
    },
    failures: failures.map(r => ({ lesson: r.lesson, file: r.file, url: r.url, status: r.status, code: r.code, details: r.details || null })),
    ok: ok.map(r => ({ lesson: r.lesson, file: r.file, url: r.url })),
  };
  await fs.writeFile(RESULTS_FILE, JSON.stringify(resultsJson, null, 2) + '\n', 'utf-8');

  console.log('='.repeat(50));
  console.log(`✅ Audit complete! Checked ${checkedCount} URLs.`);
  if (failures.length > 0) console.log(`❌ ${failures.length} dead/error link(s) found.`);
  if (structuralGaps.length > 0) console.log(`⚠️  ${structuralGaps.length} structural gap(s).`);
  if (delta?.newFailures.length > 0) console.log(`🆕 ${delta.newFailures.length} new failure(s) since last run.`);
  if (delta?.fixed.length > 0) console.log(`✔️  ${delta.fixed.length} link(s) fixed since last run.`);
  console.log(`📄 Report:  ${REPORT_FILE}`);
  console.log(`📄 Results: ${RESULTS_FILE}`);
  console.log('='.repeat(50));
}

runAudit();
