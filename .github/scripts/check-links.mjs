#!/usr/bin/env node

/**
 * Check Internal Links Script
 * 
 * This script checks for broken internal links in the built HTML files.
 * It validates that all internal links point to existing files.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_DIR = join(__dirname, '..', '..', 'dist');

console.log('🔍 Checking internal links...\n');

// Simple regex to find href attributes in HTML
const HREF_REGEX = /href=["']([^"']+)["']/g;

function getAllHtmlFiles(dir, fileList = []) {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            getAllHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function extractInternalLinks(htmlContent) {
    const links = [];
    let match;

    while ((match = HREF_REGEX.exec(htmlContent)) !== null) {
        const href = match[1];

        // Only check internal links (not external URLs, anchors, or mailto)
        if (!href.startsWith('http://') &&
            !href.startsWith('https://') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !href.startsWith('#') &&
            !href.startsWith('javascript:')) {
            // Remove hash fragments for file checking
            const cleanHref = href.split('#')[0];
            if (cleanHref) {
                links.push(cleanHref);
            }
        }
    }

    return links;
}

function checkLinks() {
    try {
        // Check if dist directory exists
        if (!existsSync(BUILD_DIR)) {
            throw new Error(`Build directory not found: ${BUILD_DIR}`);
        }

        console.log(`📂 Scanning HTML files in: ${BUILD_DIR}\n`);

        // Get all HTML files
        const htmlFiles = getAllHtmlFiles(BUILD_DIR);
        console.log(`Found ${htmlFiles.length} HTML files\n`);

        let totalLinks = 0;
        let brokenLinks = 0;
        const brokenLinkDetails = [];

        // Check each HTML file
        for (const htmlFile of htmlFiles) {
            const htmlContent = readFileSync(htmlFile, 'utf-8');
            const links = extractInternalLinks(htmlContent);

            totalLinks += links.length;

            for (const link of links) {
                // Resolve the link relative to the HTML file's directory
                const htmlDir = dirname(htmlFile);
                let targetPath;

                if (link.startsWith('/')) {
                    // Absolute path from root
                    // Remove /education/ base path if present (used in production)
                    let cleanLink = link;
                    if (cleanLink.startsWith('/education/')) {
                        cleanLink = cleanLink.replace('/education/', '/');
                    } else if (cleanLink === '/education') {
                        cleanLink = '/';
                    }
                    targetPath = join(BUILD_DIR, cleanLink);
                } else {
                    // Relative path
                    targetPath = resolve(htmlDir, link);
                }

                // If link doesn't end with .html, try adding index.html
                if (!targetPath.endsWith('.html') && !targetPath.endsWith('.css') && !targetPath.endsWith('.js')) {
                    if (targetPath.endsWith('/')) {
                        targetPath = join(targetPath, 'index.html');
                    } else {
                        // Try both with and without index.html
                        const withIndex = join(targetPath, 'index.html');
                        if (!existsSync(targetPath) && existsSync(withIndex)) {
                            targetPath = withIndex;
                        }
                    }
                }

                // Check if target exists
                if (!existsSync(targetPath)) {
                    brokenLinks++;
                    const relativePath = htmlFile.replace(BUILD_DIR, '');
                    brokenLinkDetails.push({
                        file: relativePath,
                        link: link,
                        target: targetPath.replace(BUILD_DIR, '')
                    });
                }
            }
        }

        console.log(`📊 Link Check Summary:`);
        console.log(`   Total internal links checked: ${totalLinks}`);
        console.log(`   Broken links found: ${brokenLinks}\n`);

        if (brokenLinks > 0) {
            console.log('❌ Broken links detected:\n');
            brokenLinkDetails.forEach(({ file, link, target }) => {
                console.log(`   File: ${file}`);
                console.log(`   Link: ${link}`);
                console.log(`   Target: ${target}`);
                console.log('');
            });
            throw new Error(`Found ${brokenLinks} broken internal link(s)`);
        }

        console.log('✅ Link check passed! No broken internal links found.\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Link check failed!');
        console.error(`Error: ${error.message}\n`);
        process.exit(1);
    }
}

checkLinks();
