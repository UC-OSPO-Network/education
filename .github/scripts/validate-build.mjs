#!/usr/bin/env node

/**
 * Validate Build Output Script
 * 
 * This script validates that the Astro build output contains all critical pages
 * and that the build was successful.
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Critical pages that must exist after build
const CRITICAL_PAGES = [
    'index.html',           // Home page
    'lessons/index.html',   // Lessons page
    'pathways/index.html',  // Pathways page
];

// Build output directory
const BUILD_DIR = join(__dirname, '..', '..', 'dist');

console.log('🔍 Validating build output...\n');

function validateBuild() {
    try {
        // Check if dist directory exists
        if (!existsSync(BUILD_DIR)) {
            throw new Error(`Build directory not found: ${BUILD_DIR}`);
        }
        console.log(`✅ Build directory exists: ${BUILD_DIR}`);

        // Check if dist directory is not empty
        const stats = statSync(BUILD_DIR);
        if (!stats.isDirectory()) {
            throw new Error(`Build path is not a directory: ${BUILD_DIR}`);
        }

        // Validate critical pages
        console.log('\n📄 Checking critical pages...');
        const missingPages = [];

        for (const page of CRITICAL_PAGES) {
            const pagePath = join(BUILD_DIR, page);
            if (existsSync(pagePath)) {
                const pageStats = statSync(pagePath);
                console.log(`  ✅ ${page} (${pageStats.size} bytes)`);
            } else {
                console.log(`  ❌ ${page} - NOT FOUND`);
                missingPages.push(page);
            }
        }

        if (missingPages.length > 0) {
            throw new Error(`Missing critical pages: ${missingPages.join(', ')}`);
        }

        console.log('\n✅ Build validation passed!\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Build validation failed!');
        console.error(`Error: ${error.message}\n`);
        process.exit(1);
    }
}

validateBuild();
