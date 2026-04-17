#!/usr/bin/env node
// Run all Phase 1 automation scripts

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║        UC OSPO Metadata Enhancement - Phase 1            ║');
console.log('║        Fully Automated Fields                            ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

console.log('This will run 4 automation scripts:');
console.log('  1. generate-slugs.js         - Generate stable slugs and @id URLs');
console.log('  2. standardize-languages.js  - Convert to IETF language codes');
console.log('  3. estimate-time-required.js - Estimate lesson duration');
console.log('  4. scrape-metadata.js        - Extract author, license, dates');
console.log('');
console.log('⚠️  NOTE: This will make web requests to all lesson URLs.');
console.log('   It may take 5-10 minutes to complete.');
console.log('');

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runScript(scriptName, description) {
  console.log('\n' + '='.repeat(60));
  console.log(`▶️  Running: ${description}`);
  console.log('='.repeat(60) + '\n');

  try {
    const { stdout, stderr } = await execAsync(`node scripts/${scriptName}`, {
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    console.log(stdout);
    if (stderr) console.error(stderr);

    return { success: true, error: null };
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`);
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);

    return { success: false, error: error.message };
  }
}

async function main() {
  const startTime = Date.now();
  const results = [];

  // Script 1: Slug generation (fast, deterministic)
  results.push({
    name: 'Slug Generation',
    ...await runScript('generate-slugs.js', 'Generating slugs and @id URLs')
  });

  // Script 2: Language standardization (fast, no web requests)
  results.push({
    name: 'Language Standardization',
    ...await runScript('standardize-languages.js', 'Standardizing language codes')
  });

  // Script 3: Time estimation (web requests, may take time)
  results.push({
    name: 'Time Estimation',
    ...await runScript('estimate-time-required.js', 'Estimating lesson durations')
  });

  // Script 4: Metadata scraping (web requests, may take time)
  results.push({
    name: 'Metadata Scraping',
    ...await runScript('scrape-metadata.js', 'Scraping author, license, and dates')
  });

  // Summary
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 PHASE 1 COMPLETE');
  console.log('═'.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });

  console.log(`\n⏱️  Total time: ${duration} seconds`);

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ ${successCount}/${results.length} scripts completed successfully`);

  if (successCount === results.length) {
    console.log('\n📁 Output files created in scripts/output/');
    console.log('   For a merged review artifact, run: npm run enhance:merge');
    console.log('   Preferred workflow for Sheets handoff: npm run sheets:prepare-update');
    console.log('\n📝 Next steps:');
    console.log('   1. Review the generated CSV files');
    console.log('   2. Spot-check automated values for accuracy');
    console.log('   3. Merge the outputs or use npm run sheets:prepare-update');
    console.log('   4. Review/apply the merged CSV in Google Sheets');
  } else {
    console.log('\n⚠️  Some scripts failed. Check error messages above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
