const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');

async function runAccessibilityAudit() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const baseUrl = 'http://localhost:4321/education';
    const pages = [
        { name: 'Home', url: baseUrl },
        { name: 'Browse Pathways', url: `${baseUrl}/pathways` },
        { name: 'Lessons Library', url: `${baseUrl}/lessons` }
    ];

    const results = [];

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
        }
    }

    await browser.close();

    // Save results
    fs.writeFileSync(
        'scripts/accessibility/audit-results.json',
        JSON.stringify(results, null, 2)
    );

    // Generate summary
    console.log('\n=== AUDIT SUMMARY ===\n');
    results.forEach(result => {
        console.log(`${result.page}:`);
        console.log(`  Violations: ${result.violations.length}`);
        console.log(`  Passes: ${result.passes}`);
        console.log(`  Incomplete: ${result.incomplete.length}`);
        console.log('');
    });

    return results;
}

runAccessibilityAudit().catch(console.error);
