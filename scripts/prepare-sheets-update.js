#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const STEPS = [
  ['generate-slugs.js', 'Generating stable slugs and @id values'],
  ['standardize-languages.js', 'Standardizing language codes'],
  ['estimate-time-required.js', 'Estimating lesson durations'],
  ['scrape-metadata.js', 'Scraping author, license, and date metadata'],
  ['merge-enhanced-metadata.js', 'Merging enhanced metadata into one review CSV']
];

async function runScript(scriptName, description) {
  console.log('\n' + '='.repeat(64));
  console.log(`▶️  ${description}`);
  console.log('='.repeat(64) + '\n');

  const { stdout, stderr } = await execAsync(`node scripts/${scriptName}`, {
    maxBuffer: 10 * 1024 * 1024
  });

  if (stdout) console.log(stdout.trimEnd());
  if (stderr) console.error(stderr.trimEnd());
}

async function main() {
  console.log('Preparing the Google Sheets review artifact from the current sheet snapshot.\n');
  console.log('This workflow keeps Google Sheets as a review hub only.');
  console.log('The final handoff file will be written to scripts/output/MERGED-enhanced-metadata-YYYY-MM-DD.csv.');

  const startedAt = Date.now();

  for (const [scriptName, description] of STEPS) {
    await runScript(scriptName, description);
  }

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);

  console.log('\n' + '═'.repeat(64));
  console.log('✅ SHEETS UPDATE ARTIFACT READY');
  console.log('═'.repeat(64));
  console.log(`Elapsed time: ${elapsedSeconds} seconds`);
  console.log('Next step: review the merged CSV, then use the Inventory Tools Apps Script preview/apply flow.');
}

main().catch((error) => {
  console.error('\n❌ Failed to prepare the Google Sheets update artifact.');
  console.error(error.message);
  process.exit(1);
});
