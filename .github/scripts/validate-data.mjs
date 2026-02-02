#!/usr/bin/env node

/**
 * Validate Data Source Script
 * 
 * This script validates that the Google Sheets CSV data source is accessible
 * and contains valid data for the lesson library.
 */

import https from 'https';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/export?format=csv&gid=1792935546';

console.log('🔍 Validating Google Sheets data source...\n');

function fetchCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // Follow redirects
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                if (res.headers.location) {
                    fetchCSV(res.headers.location).then(resolve).catch(reject);
                    return;
                }
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch CSV: HTTP ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function validateData() {
    try {
        // Fetch the CSV data
        console.log('📊 Fetching CSV from Google Sheets...');
        const csvData = await fetchCSV(SHEET_CSV_URL);

        // Basic validation
        if (!csvData || csvData.trim().length === 0) {
            throw new Error('CSV data is empty');
        }

        // Split into lines
        const lines = csvData.trim().split('\n');
        console.log(`✅ CSV fetched successfully (${lines.length} lines)`);

        // Validate header row exists
        if (lines.length < 2) {
            throw new Error('CSV must contain at least a header row and one data row');
        }

        const headers = lines[0].split(',');
        console.log(`✅ Header row found with ${headers.length} columns`);

        // Check for expected columns (adjust based on your actual sheet structure)
        const expectedColumns = ['Title', 'Source', 'URL'];
        const missingColumns = expectedColumns.filter(col =>
            !headers.some(header => header.toLowerCase().includes(col.toLowerCase()))
        );

        if (missingColumns.length > 0) {
            console.warn(`⚠️  Warning: Some expected columns might be missing: ${missingColumns.join(', ')}`);
        }

        // Count data rows
        const dataRows = lines.length - 1;
        console.log(`✅ Found ${dataRows} data rows`);

        if (dataRows === 0) {
            throw new Error('No data rows found in CSV');
        }

        console.log('\n✅ Data validation passed!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Data validation failed!');
        console.error(`Error: ${error.message}\n`);
        process.exit(1);
    }
}

validateData();
