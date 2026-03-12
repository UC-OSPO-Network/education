const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runAccessibilityAudit() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const baseUrl = (process.env.A11Y_BASE_URL || 'http://localhost:4321/education').replace(/\/$/, '');
    const outputPath = process.env.A11Y_OUTPUT_FILE || 'scripts/accessibility/audit-results.json';
    const failErrorsCount = Number.parseInt(process.env.A11Y_FAIL_ERRORS_COUNT || '0', 10);
    const pages = [
        { name: 'Home', url: baseUrl },
        { name: 'Browse Pathways', url: `${baseUrl}/pathways` },
        { name: 'Lessons Library', url: `${baseUrl}/lessons` }
    ];

    const results = [];
    const pageErrors = [];

    for (const testPage of pages) {
        console.log(`Testing: ${testPage.name}`);
        try {
            await page.goto(testPage.url, { waitUntil: 'networkidle0' });

            const axeResults = await new AxePuppeteer(page).analyze();

            results.push({
                page: testPage.name,
                url: testPage.url,
                violations: axeResults.violations,
                passes: axeResults.passes.length,
                incomplete: axeResults.incomplete
            });
        } catch (e) {
            console.error(`Error testing ${testPage.name}:`, e);
            pageErrors.push({ page: testPage.name, url: testPage.url, message: e.message });
            results.push({
                page: testPage.name,
                url: testPage.url,
                error: e.message,
                violations: [],
                passes: 0,
                incomplete: []
            });
        }
    }

    await browser.close();

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(
        outputPath,
        JSON.stringify(results, null, 2)
    );

    console.log('\n=== AUDIT SUMMARY ===\n');
    results.forEach(result => {
        console.log(`${result.page}:`);
        if (result.error) {
            console.log(`  Error: ${result.error}`);
            console.log('');
            return;
        }
        console.log(`  Violations: ${result.violations.length}`);
        console.log(`  Passes: ${result.passes}`);
        console.log(`  Incomplete: ${result.incomplete.length}`);
        console.log('');
    });

    const totalViolations = results.reduce(
        (sum, result) => sum + (Array.isArray(result.violations) ? result.violations.length : 0),
        0
    );

    console.log(`Results saved to ${outputPath}`);
    console.log(`Total violations: ${totalViolations}`);

    if (pageErrors.length > 0) {
        process.exitCode = 1;
    }

    if (failErrorsCount > 0 && totalViolations > failErrorsCount) {
        console.error(
            `Accessibility audit failed: ${totalViolations} violations exceed threshold ${failErrorsCount}.`
        );
        process.exitCode = 1;
    }

    return results;
}

runAccessibilityAudit().catch(console.error);
