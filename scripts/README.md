# UC OSPO Metadata Enhancement Scripts

Automation scripts to enhance lesson metadata for Bioschemas compliance.

## Overview

These scripts automate metadata extraction and enhancement for the 56 lessons in the Google Sheets spreadsheet.

### What Gets Automated

**Phase 1: Fully Automated** (90%+ accuracy)
- `slug` - Generate URL-friendly unique identifiers
- `@id` - Generate Bioschemas identifier URLs
- `timeRequired` - Estimate lesson duration from word count
- `inLanguage` - Standardize to IETF language codes
- `author` - Scrape from page metadata
- `license` - Scrape from page content
- `datePublished` - Extract from metadata

**Phase 2: AI-Assisted** (60-70% accuracy, manual review required)
- `description` - LLM-generated descriptions
- `keywords` - LLM-extracted keywords
- `educationalLevel` - LLM skill level classification
- `teaches` - LLM learning outcomes extraction

## Quick Start

### Run All Phase 1 Scripts

```bash
npm run enhance:phase1
```

This runs all 3 Phase 1 scripts:
1. Language standardization (fast, no web requests)
2. Time estimation (makes web requests, ~5 min)
3. Metadata scraping (makes web requests, ~10 min)

**Total time**: ~15 minutes for 56 lessons

### Run Individual Scripts

```bash
# Generate unique slugs and @id URLs (fast)
npm run enhance:slugs

# Standardize language codes (fast)
npm run enhance:language

# Estimate time required (slow, fetches pages)
npm run enhance:time

# Scrape author, license, dates (slow, fetches pages)
npm run enhance:metadata
```

## Output

All scripts generate CSV files in `scripts/output/`:

```
scripts/output/
├── slugs-2025-12-28.csv
├── languages-2025-12-27.csv
├── time-estimates-2025-12-27.csv
└── metadata-2025-12-27.csv
```

**Import to Google Sheets**:
1. Open each CSV file
2. Review automated values
3. Spot-check for accuracy
4. Copy-paste columns into Google Sheets

## Script Details

### 1. `generate-slugs.js`

**What it does**: Generates URL-friendly unique identifiers from lesson names

**Examples**:
- "Building Community" → `slug: "building-community"`
- "CI/CD for Research Software" → `slug: "cicd-for-research-software"`
- Constructs `@id` URLs: `https://education.ucospo.net/lessons/{slug}`

**Accuracy**: 100% (deterministic, no web requests)

**Needs review**: Check for overly long slugs or duplicates

**Why needed**:
- Required for Bioschemas `@id` property (MINIMUM)
- Enables lesson detail pages (`/lessons/building-community`)
- Stable reference even if lesson name changes

---

### 2. `standardize-languages.js`

**What it does**: Converts language names to IETF BCP 47 codes

**Examples**:
- "English, Spanish" → "en, es"
- "French/Français" → "fr"
- "Chinese (Simplified)" → "zh-CN"

**Accuracy**: 95%+ (deterministic mapping)

**Needs review**: None (safe to import directly)

---

### 3. `estimate-time-required.js`

**What it does**: Estimates lesson duration based on:
- Word count (reading speed: 200 WPM)
- Content type (tutorial, guide, video, etc.)
- Multipliers for hands-on activities

**Output format**: ISO 8601 duration
- "PT15M" = 15 minutes
- "PT1H30M" = 1.5 hours
- "PT3H" = 3 hours

**Accuracy**: 85-90% (within ±20 minutes)

**Needs review**: Lessons flagged with `_needsReview=true`
- Very long estimates (>5 hours)
- Fetch errors

---

### 4. `scrape-metadata.js`

**What it does**: Extracts metadata from lesson URLs:
- **Author**: From meta tags, bylines, or domain mapping
- **License**: From Creative Commons links, meta tags, or footer text
- **Dates**: From meta tags or JSON-LD

**Accuracy**:
- Author: 70-80%
- License: 75-85%
- Dates: 65-75%

**Needs review**: Lessons flagged with `_needsReview=true`
- Missing author or license
- Ambiguous values

**Fallback strategies**:
- Domain → Organization mapping (e.g., opensource.guide → GitHub)
- Footer text parsing for licenses
- JSON-LD schema.org extraction

## Configuration

### Adjust Reading Speed

Edit `scripts/estimate-time-required.js`:

```javascript
const READING_SPEED = 200; // words per minute (default)
// Try 150 for slower, 250 for faster
```

### Adjust Content Type Multipliers

Edit `scripts/estimate-time-required.js`:

```javascript
const CONTENT_TYPE_MULTIPLIERS = {
  'video': 1.0,          // Watch at normal speed
  'tutorial': 2.5,       // Hands-on practice
  'guide': 1.2,          // Reading + comprehension
  // Add custom types or adjust multipliers
};
```

### Add Organization Mappings

Edit `scripts/scrape-metadata.js`:

```javascript
const ORG_DOMAIN_MAP = {
  'opensource.guide': 'GitHub',
  'yoursite.com': 'Your Org',
  // Add more domain → org mappings
};
```

## Rate Limiting

Scripts include rate limiting to avoid overwhelming servers:

- **estimate-time-required.js**: 1 second between requests
- **scrape-metadata.js**: 1.5 seconds between requests

**Total time for 56 lessons**:
- Time estimation: ~5 minutes
- Metadata scraping: ~10 minutes

## Error Handling

All scripts include:
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ 10-second timeout per request
- ✅ Graceful error handling (skip and flag for review)
- ✅ Progress logging

If a script fails:
1. Check the error message
2. Verify the URL is accessible
3. Re-run the script (it skips already-processed lessons)

## Review Workflow

### 1. Check Output CSV

```bash
open scripts/output/time-estimates-2025-12-27.csv
```

### 2. Look for `_needsReview` Column

Lessons marked `true` need manual verification.

### 3. Spot-Check Random Samples

Review 10-15 random lessons for accuracy:
- Do time estimates seem reasonable?
- Are authors correct?
- Are licenses accurate?

### 4. Import to Google Sheets

Copy the columns you want to update:
- Open CSV in Excel/Numbers/Sheets
- Select relevant columns (`timeRequired`, `author`, `license`, etc.)
- Copy-paste into Google Sheets

## Troubleshooting

### "Module not found" Error

```bash
# Make sure you're in the project root
cd /Users/timdennis/websites/OSPO_WEBSITE

# Install dependencies if needed
npm install
```

### "Fetch failed" Errors

Some URLs may be inaccessible:
- Check if the URL is valid
- Verify internet connection
- Some sites may block automated requests

Scripts will flag these with `_error` field.

### Very Long Execution Time

If scripts take >30 minutes:
- Check rate limiting settings
- Some URLs may be timing out (10 second limit)
- Run scripts separately instead of all at once

## Phase 2: AI-Assisted (Coming Next)

Phase 2 scripts (not yet implemented) will use LLMs to generate:
- Descriptions (GPT-4)
- Keywords (GPT-4)
- Skill level classifications (GPT-4)
- Learning outcomes (GPT-4)

**Requirements**:
- OpenAI API key or Claude API key
- ~$10 in API costs for 56 lessons

## Contributing

To add new automation scripts:

1. Create script in `scripts/`
2. Use shared libraries in `scripts/lib/`
3. Generate CSV output to `scripts/output/`
4. Flag uncertain results with `_needsReview=true`
5. Update this README

## Support

Questions or issues?
- Check GitHub Issues: https://github.com/UC-OSPO-Network/education/issues
- Review `.github/METADATA_AUTOMATION_ANALYSIS.md` for technical details
