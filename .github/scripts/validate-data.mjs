#!/usr/bin/env node
// Data validation script for PR checks
// Validates that the Google Sheets CSV is accessible and has valid structure

import https from 'https';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

// Required fields that must exist in each lesson
const REQUIRED_FIELDS = ['name', 'description', 'url'];

// Fields we expect to exist (warnings if missing)
const EXPECTED_FIELDS = ['educationalLevel', 'learnerCategory', 'subTopic', 'slug'];

function fetchCSV(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect without location header'));
          return;
        }
        return fetchCSV(redirectUrl, redirectCount + 1).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: Failed to fetch CSV`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSV(text) {
  // Proper CSV parsing that handles quoted multi-line fields
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // End of row
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }

  // Add last field/row if exists
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    throw new Error('CSV is empty');
  }

  const headers = rows[0];
  const dataRows = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return { headers, rows: dataRows };
}

function validateData(data) {
  const errors = [];
  const warnings = [];

  console.log('\n📊 Data Validation Report\n');
  console.log(`Total lessons found: ${data.rows.length}`);

  // Check minimum lesson count
  if (data.rows.length < 5) {
    errors.push(`Too few lessons found (${data.rows.length}). Expected at least 5.`);
  }

  // Validate each row
  let validLessons = 0;
  const issues = [];

  data.rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because of header and 1-based indexing
    const rowIssues = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        rowIssues.push(`Missing required field: ${field}`);
      }
    });

    // Check URL format
    if (row.url && !row.url.match(/^https?:\/\/.+/)) {
      rowIssues.push(`Invalid URL format: ${row.url}`);
    }

    // Check expected fields (warnings only)
    EXPECTED_FIELDS.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        warnings.push(`Row ${rowNumber} (${row.name || 'unnamed'}): Missing ${field}`);
      }
    });

    if (rowIssues.length > 0) {
      issues.push({
        row: rowNumber,
        name: row.name || 'Unnamed',
        issues: rowIssues
      });
    } else {
      validLessons++;
    }
  });

  console.log(`Valid lessons: ${validLessons}/${data.rows.length}\n`);

  // Check if we have a reasonable number of valid lessons
  // For PR checks, we want to ensure the data source is usable, not perfect
  const validPercentage = (validLessons / data.rows.length) * 100;

  if (validLessons === 0) {
    errors.push('No valid lessons found in the data source');
  } else if (validPercentage < 10) {
    warnings.push(`Only ${validPercentage.toFixed(1)}% of lessons are fully valid (${validLessons}/${data.rows.length})`);
  }

  // Report issues (as warnings for PR checks, not hard errors)
  if (issues.length > 0 && issues.length <= 5) {
    console.warn('\n⚠️  DATA QUALITY ISSUES (showing first 5):\n');
    issues.slice(0, 5).forEach(issue => {
      console.warn(`Row ${issue.row}: "${issue.name}"`);
      issue.issues.forEach(msg => console.warn(`  - ${msg}`));
    });
    console.warn(`\n... and ${issues.length - 5} more rows with issues\n`);
  } else if (issues.length > 5) {
    console.warn(`\n⚠️  Found ${issues.length} rows with data quality issues\n`);
  }

  // Report warnings
  if (warnings.length > 0 && warnings.length <= 10) {
    console.warn('\n⚠️  WARNINGS:\n');
    warnings.forEach(w => console.warn(`  ${w}`));
  } else if (warnings.length > 10) {
    console.warn(`\n⚠️  ${warnings.length} warnings (showing first 10):\n`);
    warnings.slice(0, 10).forEach(w => console.warn(`  ${w}`));
  }

  return { errors, warnings, validLessons, totalLessons: data.rows.length };
}

async function main() {
  console.log('🔍 Validating Google Sheets data source...\n');
  console.log(`Fetching: ${CSV_URL.substring(0, 80)}...`);

  try {
    // Fetch CSV
    const csvText = await fetchCSV(CSV_URL);
    console.log('✅ CSV fetch successful\n');

    // Parse CSV
    const data = parseCSV(csvText);
    console.log(`✅ CSV parsed: ${data.headers.length} columns, ${data.rows.length} rows\n`);

    // Validate data
    const result = validateData(data);

    // Exit with appropriate code
    if (result.errors.length > 0) {
      console.error('\n❌ Validation failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All validation checks passed!');
      if (result.warnings.length > 0) {
        console.log(`   (${result.warnings.length} warnings - consider fixing)`);
      }
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  }
}

main();
