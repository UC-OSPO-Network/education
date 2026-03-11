/**
 * HOW TO RUN:
 * Ensure you are using Node 18 or higher.
 * Run from the root of your project:
 * node scripts/check-lesson-urls.mjs
 * * Output: Generates a `url-report.md` file to ../scripts/output/.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');
const REPORT_FILE = path.join(__dirname, '../scripts/output/url-report.md');

// Configuration
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

/**
 * Validates a single URL with retries, timeout, and redirect tracking
 */
async function checkUrl(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Use redirect: 'manual' so fetch doesn't auto-follow, allowing us to catch the 3xx codes
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          // A standard User-Agent prevents basic bot-blocking (like Cloudflare 403s)
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      clearTimeout(timeoutId);

      // Handle Success
      if (response.ok) {
        return { status: '✅ OK', code: response.status };
      }
      
      // Handle Redirects (300-399)
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location') || 'Unknown location';
        return { status: '⚠️ Redirect', code: response.status, details: `→ ${location}` };
      }

      // Handle Errors (400+)
      // Note: Some servers block HEAD requests with a 405 or 403. In a highly advanced script, 
      // you might fallback to a GET request here, but for now we report the error.
      return { status: '❌ Error', code: response.status, details: response.statusText };

    } catch (error) {
      clearTimeout(timeoutId);
      
      // If it's the last attempt, report the failure
      if (attempt === retries) {
        const isTimeout = error.name === 'AbortError';
        return { 
          status: '❌ Dead', 
          code: 'N/A', 
          details: isTimeout ? `Timeout after ${TIMEOUT_MS}ms` : error.message 
        };
      }
      // Otherwise, loop continues and it retries
    }
  }
}

async function runAudit() {
  console.log('🔍 Starting Lesson URL Audit...');
  
  const files = await fs.readdir(CONTENT_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  const results = [];
  let checkedCount = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.warn(`⚠️ Skipping ${file} - Invalid JSON`);
      continue;
    }

    const url = data.url;
    const lessonName = data.title || file; // Fallback to filename if title is missing

    if (!url) {
      results.push({ lesson: lessonName, file, url: 'MISSING', status: '❌ Dead', code: 'N/A', details: 'No URL field found' });
      continue;
    }

    process.stdout.write(`Checking [${checkedCount + 1}/${jsonFiles.length}] ${file}... `);
    const result = await checkUrl(url);
    console.log(result.status);
    
    results.push({
      lesson: lessonName,
      file,
      url,
      ...result
    });
    
    checkedCount++;
    
    // Slight artificial delay to prevent rate-limiting when hitting the same domain rapidly
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Generate Markdown Report
  console.log('\n📝 Generating Markdown Report...');
  
  let mdContent = `# Lesson URL Audit Report\n\n`;
  mdContent += `*Generated on: ${new Date().toUTCString()}*\n\n`;
  mdContent += `| Status | Code | Lesson (File) | URL | Details |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;

  // Sort results: Dead/Errors first, then Redirects, then OKs
  results.sort((a, b) => {
    if (a.status.includes('❌') && !b.status.includes('❌')) return -1;
    if (!a.status.includes('❌') && b.status.includes('❌')) return 1;
    if (a.status.includes('⚠️') && !b.status.includes('⚠️')) return -1;
    if (!a.status.includes('⚠️') && b.status.includes('⚠️')) return 1;
    return 0;
  });

  results.forEach(r => {
    const detailsStr = r.details ? r.details : '';
    mdContent += `| ${r.status} | ${r.code} | **${r.lesson}**<br>(\`${r.file}\`) | [Link](${r.url}) | ${detailsStr} |\n`;
  });

  await fs.writeFile(REPORT_FILE, mdContent, 'utf-8');
  
  console.log('==================================================');
  console.log(`✅ Audit complete! Checked ${checkedCount} URLs.`);
  console.log(`📄 Report saved to: ${REPORT_FILE}`);
  console.log('==================================================');
}

runAudit();