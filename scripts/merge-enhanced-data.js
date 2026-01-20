#!/usr/bin/env node
/**
 * Merge Enhanced Metadata into Single Update CSV
 *
 * This script:
 * 1. Reads all enhanced CSV files from scripts/output/
 * 2. Merges them by lesson name
 * 3. Outputs a single CSV ready for Google Sheets update
 *
 * SAFE UPDATE PROCESS:
 * 1. Open the canonical Google Sheet
 * 2. Create a new tab called "ENHANCED_DATA"
 * 3. Import this merged CSV into that tab
 * 4. Use VLOOKUP to update specific columns in the main sheet
 * 5. Once verified, delete the ENHANCED_DATA tab
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'output');

// Fields that should be updated (enhanced by scripts)
const ENHANCED_FIELDS = {
  'metadata-2025-12-28.csv': [
    'author', 'license', 'dateCreated', 'dateModified',
    'datePublished', 'contributor', 'abstract', 'about',
    'accessibilitySummary', 'mentions', 'recordedAt', 'version'
  ],
  'languages-2025-12-28.csv': ['inLanguage'],
  'time-estimates-2025-12-28.csv': ['timeRequired'],
  'slugs-2025-12-28.csv': ['identifier'] // slug field
};

function readCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    console.warn(`⚠️  Warnings parsing ${path.basename(filepath)}:`);
    parsed.errors.forEach(err => console.warn(`   ${err.message}`));
  }

  return parsed.data;
}

function mergeData() {
  console.log('🔄 Merging enhanced metadata files...\n');

  // Read all CSV files
  const files = {};
  const allFiles = fs.readdirSync(OUTPUT_DIR);

  for (const filename of Object.keys(ENHANCED_FIELDS)) {
    const filepath = path.join(OUTPUT_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  Missing file: ${filename}`);
      continue;
    }

    console.log(`📖 Reading: ${filename}`);
    files[filename] = readCSV(filepath);
    console.log(`   Loaded ${files[filename].length} rows`);
  }

  // Use metadata file as the base (it has all fields)
  const baseFile = 'metadata-2025-12-28.csv';

  if (!files[baseFile]) {
    console.error('❌ Base metadata file not found!');
    process.exit(1);
  }

  const baseData = files[baseFile];
  const mergedData = baseData.map(lesson => ({ ...lesson }));

  console.log(`\n📊 Base data: ${mergedData.length} lessons`);

  // Merge additional fields from other files
  for (const [filename, fields] of Object.entries(ENHANCED_FIELDS)) {
    if (filename === baseFile) continue; // Skip base file
    if (!files[filename]) continue; // Skip missing files

    console.log(`\n🔗 Merging: ${filename}`);
    console.log(`   Fields: ${fields.join(', ')}`);

    const sourceData = files[filename];
    let mergeCount = 0;

    // Create a map for quick lookup
    const sourceMap = new Map(
      sourceData.map(lesson => [lesson.name, lesson])
    );

    // Merge by lesson name
    for (const lesson of mergedData) {
      const source = sourceMap.get(lesson.name);

      if (source) {
        for (const field of fields) {
          if (source[field]) {
            lesson[field] = source[field];
            mergeCount++;
          }
        }
      }
    }

    console.log(`   ✅ Merged ${mergeCount} field values`);
  }

  return mergedData;
}

function writeCSV(data, filename) {
  const filepath = path.join(OUTPUT_DIR, filename);

  // Generate CSV with proper escaping
  const csv = Papa.unparse(data, {
    quotes: true, // Quote all fields to preserve commas, newlines
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    header: true,
    newline: '\n'
  });

  fs.writeFileSync(filepath, csv, 'utf8');
  console.log(`\n✅ Merged CSV saved to: ${filepath}`);

  return filepath;
}

function generateInstructions(filepath) {
  console.log('\n' + '═'.repeat(70));
  console.log('📋 HOW TO UPDATE GOOGLE SHEETS SAFELY');
  console.log('═'.repeat(70));
  console.log('');
  console.log('✅ This preserves ALL formatting, colors, and conditional formatting!');
  console.log('');
  console.log('STEP 1: Open your canonical Google Sheet');
  console.log('   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID');
  console.log('');
  console.log('STEP 2: Create a new tab for the enhanced data');
  console.log('   • Click + at bottom to add new sheet');
  console.log('   • Name it: "TEMP_ENHANCED"');
  console.log('');
  console.log('STEP 3: Import the merged CSV into TEMP_ENHANCED tab');
  console.log('   • File → Import → Upload');
  console.log(`   • Select: ${path.basename(filepath)}`);
  console.log('   • Import location: "Insert new sheet(s)"');
  console.log('   • Separator: Comma');
  console.log('   • Convert text to numbers: NO (uncheck this!)');
  console.log('');
  console.log('STEP 4: Update specific columns using formulas');
  console.log('   In your main sheet, for each enhanced column:');
  console.log('');
  console.log('   Example for "author" column (assuming column Q):');
  console.log('   =IFERROR(VLOOKUP($A2,TEMP_ENHANCED!$A:$Q,17,FALSE),$Q2)');
  console.log('');
  console.log('   This formula:');
  console.log('   • Looks up the lesson by name ($A2)');
  console.log('   • Gets the enhanced value from TEMP_ENHANCED');
  console.log('   • Keeps the original value if no match found');
  console.log('');
  console.log('STEP 5: Copy formulas down for all rows');
  console.log('');
  console.log('STEP 6: Convert formulas to values');
  console.log('   • Select the updated columns');
  console.log('   • Copy (Ctrl+C or Cmd+C)');
  console.log('   • Paste Special → Values only');
  console.log('');
  console.log('STEP 7: Delete the TEMP_ENHANCED tab');
  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  console.log('💡 TIP: Test with 1-2 columns first before updating all!');
  console.log('');
  console.log('📝 Enhanced fields in this CSV:');

  const allFields = Object.values(ENHANCED_FIELDS).flat();
  const uniqueFields = [...new Set(allFields)].sort();
  uniqueFields.forEach(field => console.log(`   • ${field}`));

  console.log('');
}

// Main execution
async function main() {
  try {
    const mergedData = mergeData();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `merged-enhanced-data-${timestamp}.csv`;
    const filepath = writeCSV(mergedData, filename);

    generateInstructions(filepath);

    console.log('✅ Merge complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
