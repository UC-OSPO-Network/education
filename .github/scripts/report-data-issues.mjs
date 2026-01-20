#!/usr/bin/env node
// Detailed data quality report generator
// Outputs CSV file with all validation issues for review

import https from 'https';
import fs from 'fs';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

const REQUIRED_FIELDS = ['name', 'description', 'url'];
const EXPECTED_FIELDS = ['educationalLevel', 'learnerCategory', 'subTopic', 'slug'];

function fetchCSV(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    https.get(url, (res) => {
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
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    if (Object.values(row).some(v => v !== '')) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

function analyzeData(data) {
  const issues = [];

  data.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const rowIssues = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        rowIssues.push(`missing_${field}`);
      }
    });

    // Check URL format
    if (row.url && !row.url.match(/^https?:\/\/.+/)) {
      rowIssues.push('invalid_url_format');
    }

    // Check expected fields
    EXPECTED_FIELDS.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        rowIssues.push(`missing_${field}`);
      }
    });

    if (rowIssues.length > 0) {
      issues.push({
        row_number: rowNumber,
        name: row.name || '(unnamed)',
        url: row.url || '(no url)',
        issues: rowIssues.join('; '),
        issue_count: rowIssues.length,
        has_name: row.name ? 'yes' : 'no',
        has_description: row.description ? 'yes' : 'no',
        has_url: row.url ? 'yes' : 'no',
        has_educational_level: row.educationalLevel ? 'yes' : 'no',
        has_slug: row.slug ? 'yes' : 'no'
      });
    }
  });

  return issues;
}

function generateCSVReport(issues) {
  const headers = [
    'row_number',
    'name',
    'url',
    'issue_count',
    'issues',
    'has_name',
    'has_description',
    'has_url',
    'has_educational_level',
    'has_slug'
  ];

  let csv = headers.join(',') + '\n';

  issues.forEach(issue => {
    const row = headers.map(header => {
      const value = issue[header] || '';
      // Escape commas and quotes
      if (value.toString().includes(',') || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += row.join(',') + '\n';
  });

  return csv;
}

async function main() {
  console.log('📊 Generating data quality report...\n');

  try {
    const csvText = await fetchCSV(CSV_URL);
    const data = parseCSV(csvText);

    console.log(`Total rows: ${data.rows.length}`);

    const issues = analyzeData(data);

    console.log(`Rows with issues: ${issues.length}`);
    console.log(`Fully valid rows: ${data.rows.length - issues.length}\n`);

    // Generate report
    const reportCSV = generateCSVReport(issues);
    const outputPath = '.github/DATA_QUALITY_ISSUES.csv';

    fs.writeFileSync(outputPath, reportCSV);

    console.log(`✅ Report saved to: ${outputPath}`);

    // Show summary stats
    const missingName = issues.filter(i => i.has_name === 'no').length;
    const missingDescription = issues.filter(i => i.has_description === 'no').length;
    const missingUrl = issues.filter(i => i.has_url === 'no').length;
    const missingSlug = issues.filter(i => i.has_slug === 'no').length;

    console.log('\n📈 Summary Statistics:');
    console.log(`   Missing name: ${missingName}`);
    console.log(`   Missing description: ${missingDescription}`);
    console.log(`   Missing URL: ${missingUrl}`);
    console.log(`   Missing slug: ${missingSlug}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
