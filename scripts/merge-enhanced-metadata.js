/**
 * Merges all enhanced metadata CSVs into a single master CSV for Google Sheets review/update.
 * The merged artifact preserves stable identifiers such as slug, name, and Sorting ID so
 * downstream tooling can match rows without relying on lesson names alone.
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { generateCSVUpdate } from './lib/spreadsheet.js';

const OUTPUT_DIR = './scripts/output';
const LOCAL_LESSONS_DIR = './src/content/lessons';

const LOCAL_TO_SHEET_FIELD_MAP = {
    topic: 'Topic',
    subTopic: 'subTopic',
    learnerCategory: 'learnerCategory',
    educationalLevel: 'educationalLevel',
    learningResourceType: 'learningResourceType',
    dependsOn: 'Depends On',
    learningObjectives: 'Learning Objectives',
    ospoRelevance: 'OSPO Relevance',
    about: 'about',
    abstract: 'abstract',
    accessibilitySummary: 'accessibilitySummary',
    url: 'url',
    ossRole: 'oss_role',
    oss_role: 'oss_role',
    audience: 'audience',
    author: 'author',
    competencyRequired: 'competencyRequired',
    contributor: 'contributor',
    creativeWorkStatus: 'creativeWorkStatus',
    dateCreated: 'dateCreated',
    dateModified: 'dateModified',
    datePublished: 'datePublished',
    description: 'description',
    hasPart: 'hasPart',
    identifier: 'identifier',
    inLanguage: 'inLanguage',
    isPartOf: 'isPartOf',
    keywords: 'keywords',
    license: 'license',
    mentions: 'mentions',
    recordedAt: 'recordedAt',
    teaches: 'teaches',
    timeRequired: 'timeRequired',
    version: 'version',
    workTranslation: 'workTranslation',
    prerequisiteNotes: 'prerequisiteNotes',
    sortingId: 'Sorting ID',
    notes: 'Notes',
};

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

function normalizeKey(value) {
    return String(value ?? '').trim().toLowerCase();
}

function normalizeListValue(value) {
    if (!Array.isArray(value)) return value;
    return value
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
        .join(', ');
}

function readLocalLessons() {
    if (!fs.existsSync(LOCAL_LESSONS_DIR)) {
        return [];
    }

    return fs.readdirSync(LOCAL_LESSONS_DIR)
        .filter((file) => file.endsWith('.json'))
        .map((file) => {
            const filePath = path.join(LOCAL_LESSONS_DIR, file);
            const lesson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return {
                ...lesson,
                slug: lesson.slug || file.replace(/\.json$/, ''),
            };
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

    const localLessons = readLocalLessons();
    const localBySlug = new Map();
    const localByName = new Map();
    const localBySortingId = new Map();

    localLessons.forEach((lesson) => {
        if (lesson.slug) {
            localBySlug.set(normalizeKey(lesson.slug), lesson);
        }
        if (lesson.name) {
            localByName.set(normalizeKey(lesson.name), lesson);
        }
        if (lesson.sortingId) {
            localBySortingId.set(normalizeKey(lesson.sortingId), lesson);
        }
    });

    const mergedData = Array.from(mergedMap.values()).map((row) => {
        const localLesson =
            localBySlug.get(normalizeKey(row.slug)) ||
            localBySortingId.get(normalizeKey(row['Sorting ID'])) ||
            localByName.get(normalizeKey(row.name));

        if (!localLesson) {
            return row;
        }

        const mergedRow = { ...row };

        Object.entries(LOCAL_TO_SHEET_FIELD_MAP).forEach(([localKey, sheetKey]) => {
            const localValue = normalizeListValue(localLesson[localKey]);
            if (localValue === undefined || localValue === null) return;
            const normalized = String(localValue).trim();
            if (!normalized) return;
            mergedRow[sheetKey] = normalized;
        });

        // Keep the mirrored slug and generated @id stable for sheet matching and review.
        mergedRow.slug = localLesson.slug || mergedRow.slug;
        if (!mergedRow.name && localLesson.name) {
            mergedRow.name = localLesson.name;
        }

        return mergedRow;
    });
    const missingSlug = mergedData.filter((row) => !row.slug || !String(row.slug).trim()).length;
    const missingName = mergedData.filter((row) => !row.name || !String(row.name).trim()).length;
    const missingSortingId = mergedData.filter((row) => !row['Sorting ID'] || !String(row['Sorting ID']).trim()).length;
    const dateStr = new Date().toISOString().split('T')[0];
    const outputFilePath = path.join(OUTPUT_DIR, `MERGED-enhanced-metadata-${dateStr}.csv`);

    await generateCSVUpdate(mergedData, outputFilePath);

    console.log(`\n✅ Successfully merged ${mergedData.length} lessons.`);
    console.log(`📂 Output: ${outputFilePath}`);
    console.log(`🔑 Stable keys present: slug (${mergedData.length - missingSlug}/${mergedData.length}), name (${mergedData.length - missingName}/${mergedData.length}), Sorting ID (${mergedData.length - missingSortingId}/${mergedData.length})`);
}

mergeMetadata().catch(err => {
    console.error('❌ Error merging metadata:', err);
    process.exit(1);
});
