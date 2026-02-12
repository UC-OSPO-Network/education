# PR Validation Scripts

These scripts are used by the `pr-check.yml` workflow to validate PRs before merging.

## Scripts

### `validate-data.mjs`
Validates the Google Sheets data source that powers the lessons.

**Checks:**
- CSV is accessible and fetchable
- CSV parses correctly
- At least some lessons have required fields (name, description, url)
- URL formats are valid

**Exit codes:**
- 0: Success (CSV accessible, data usable)
- 1: Failure (CSV unreachable, no valid lessons)

**Usage:**
```bash
node .github/scripts/validate-data.mjs
```

### `validate-build.mjs`
Validates the build output to ensure critical pages and assets exist.

**Checks:**
- dist/ directory exists
- Critical pages exist (index, lessons, pathways, etc.)
- Critical assets exist (CSS, logo)
- Reasonable number of HTML pages generated
- Files are not suspiciously small (empty or error pages)

**Exit codes:**
- 0: Success
- 1: Failure (missing critical files)

**Usage:**
```bash
npm run build
node .github/scripts/validate-build.mjs
```

### `check-links.mjs`
Checks for broken internal links in the built site.

**Checks:**
- All internal href links resolve to real files
- Handles relative and absolute paths
- Handles directory index.html files

**Exit codes:**
- 0: Success (all links valid)
- 1: Failure (broken links found)

**Usage:**
```bash
npm run build
node .github/scripts/check-links.mjs
```

## Running All Checks Locally

To run all PR checks locally before pushing:

```bash
# 1. Validate data source
node .github/scripts/validate-data.mjs

# 2. Type check
npx astro check

# 3. Build
npm run build

# 4. Validate build
node .github/scripts/validate-build.mjs

# 5. Check links
node .github/scripts/check-links.mjs
```

## Adding New Checks

When adding new validation scripts:

1. Create the script in `.github/scripts/`
2. Make it executable: `chmod +x .github/scripts/your-script.mjs`
3. Add it to `.github/workflows/pr-check.yml`
4. Document it in this README
5. Test locally before committing
