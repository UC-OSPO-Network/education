/**
 * Merges all enhanced metadata CSVs into a single master CSV for Google Sheets update.
 * This script looks for the latest files in scripts/output/ and merges them by lesson name.
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { generateCSVUpdate } from './lib/spreadsheet.js';

const OUTPUT_DIR = './scripts/output';

function getLatestFile(prefix) {
    const files = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.startsWith(prefix) && f.endsWith('.csv'))
        .sort()
        .reverse();
    return files.length > 0 ? path.join(OUTPUT_DIR, files[0]) : null;
}

async function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data)
        });
    });
}

async function mergeMetadata() {
    console.log('🚀 Starting metadata merge...');

    const files = {
        metadata: getLatestFile('metadata-'),
        slugs: getLatestFile('slugs-'),
        time: getLatestFile('time-estimates-'),
        languages: getLatestFile('languages-')
    };

    for (const [key, file] of Object.entries(files)) {
        if (!file) {
            console.error(`❌ Missing file for ${key}. Please run the respective enhancement scripts first.`);
            process.exit(1);
        }
        console.log(`- Found ${key}: ${path.basename(file)}`);
    }

    const [metadata, slugs, time, languages] = await Promise.all([
        parseCSV(files.metadata),
        parseCSV(files.slugs),
        parseCSV(files.time),
        parseCSV(files.languages)
    ]);

    // Use a Map to merge by name
    const mergedMap = new Map();

    // 1. Process Metadata (Base)
    metadata.forEach(row => {
        mergedMap.set(row.name, { ...row });
    });

    // 2. Process Slugs
    slugs.forEach(row => {
        if (mergedMap.has(row.name)) {
            const existing = mergedMap.get(row.name);
            existing.slug = row.slug;
            existing['@id'] = row['@id'];
        }
    });

    // 3. Process Time Estimates
    time.forEach(row => {
        if (mergedMap.has(row.name)) {
            const existing = mergedMap.get(row.name);
            existing.timeRequired = row.timeRequired;
            existing._wordCount = row._wordCount;
            existing._contentType = row._contentType;
        }
    });

    // 4. Process Languages
    languages.forEach(row => {
        if (mergedMap.has(row.name)) {
            const existing = mergedMap.get(row.name);
            existing.inLanguage = row.inLanguage;
        }
    });

    const mergedData = Array.from(mergedMap.values());
    const dateStr = new Date().toISOString().split('T')[0];
    const outputFilePath = path.join(OUTPUT_DIR, `MERGED-enhanced-metadata-${dateStr}.csv`);

    await generateCSVUpdate(mergedData, outputFilePath);

    console.log(`\n✅ Successfully merged ${mergedData.length} lessons.`);
    console.log(`📂 Output: ${outputFilePath}`);
}

mergeMetadata().catch(err => {
    console.error('❌ Error merging metadata:', err);
    process.exit(1);
});
