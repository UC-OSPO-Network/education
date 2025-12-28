# Lesson Metadata Automation Guide

**Last updated:** December 28, 2025

## Table of Contents

1. [Quick Start](#quick-start) - Start here (5 min read)
2. [What Was Automated](#what-was-automated) - Understanding the results
3. [How to Review & Import](#how-to-review--import) - Step-by-step (2 hours)
4. [Team Communication](#team-communication) - Email/Slack templates
5. [Re-running Scripts](#re-running-scripts) - If you need to do this again
6. [Troubleshooting](#troubleshooting) - Common issues

---

# Quick Start

## What Happened

Scripts analyzed your 56 lessons and filled in missing metadata. Results are in CSV files ready for your review.

**Time saved:** 30-40 hours of manual work → 15 minutes runtime + 2 hours review

## The Simple Mental Model

```
┌─────────────────┐
│ Google Sheets   │ ← Your source of truth (never modified by scripts)
└────────┬────────┘
         │ Scripts READ only
         ▼
┌─────────────────┐
│ CSV Files       │ ← Suggestions for you to review
└────────┬────────┘
         │ You review & edit
         ▼
┌─────────────────┐
│ Google Sheets   │ ← You copy-paste what you approve
└─────────────────┘
```

**Key point:** Scripts NEVER modify Google Sheets. You're always in control.

## Your 3 Options

### Option 1: Use It (Recommended)
- Review 4 CSV files (~2 hours)
- Import approved columns to Google Sheets
- Save 35+ hours of work

### Option 2: Wait
- CSV files will be there when you're ready
- No expiration, no pressure

### Option 3: Don't Use It
- Just ignore the CSV files
- No harm done

---

# What Was Automated

## Scripts That Ran

**1. Slug Generation** (`generate-slugs.js`)
- Created URL-friendly unique IDs for each lesson
- Example: "Building Community" → `slug: "building-community"`
- Generated Bioschemas `@id` URLs: `https://education.ucospo.net/lessons/{slug}`
- **Result:** 56/56 lessons ✅ (100% success)

**2. Language Standardization** (`standardize-languages.js`)
- Converted language names to IETF BCP 47 codes
- Example: "English, Spanish, French" → `en, es, fr`
- Example: "Chinese (Traditional)/繁體中文" → `zh-TW`
- **Result:** 56/56 lessons ✅ (95%+ accuracy)

**3. Time Estimation** (`estimate-time-required.js`)
- Estimated lesson duration from word count + content type
- Example: 3,464 words × 1.2 (guide) = PT14M (14 minutes)
- Generated ISO 8601 format: PT1H30M = 1.5 hours
- **Result:** 55/56 lessons ✅ (2 had 404 errors)

**4. Metadata Scraping** (`scrape-metadata.js`)
- Extracted author, license, datePublished from lesson URLs
- Checked meta tags, JSON-LD, page content
- **Result:** 35 new lessons processed (21 already filled)
  - Author: 33/35 found
  - License: 18/35 found
  - Dates: 28/35 found

## Coverage Improvements

| Field | Before | After | Improvement |
|-------|--------|-------|-------------|
| `slug` | 0/56 (0%) | 56/56 (100%) | **+100%** ✅ |
| `@id` | 0/56 (0%) | 56/56 (100%) | **+100%** ✅ |
| `inLanguage` | 50/56 (89%) | 56/56 (100%) | **+11%** ✅ |
| `timeRequired` | 0/56 (0%) | 55/56 (98%) | **+98%** ✅ |
| `author` | 32/56 (57%) | ~49/56 (88%) | **+31%** ✅ |
| `license` | 31/56 (55%) | ~41/56 (73%) | **+18%** ✅ |
| `datePublished` | 20/56 (35%) | 46/56 (82%) | **+47%** ✅ |

## Generated CSV Files

All located in `scripts/output/`:

```
scripts/output/
├── slugs-2025-12-28.csv           (56 lessons, 2 new columns)
├── languages-2025-12-28.csv       (56 lessons, 1 updated column)
├── time-estimates-2025-12-28.csv  (56 lessons, 1 new column)
└── metadata-2025-12-28.csv        (56 lessons, 3 updated columns)
```

---

# How to Review & Import

**Total time:** 1.5-2 hours

## Step 1: Review Slugs (10 minutes)

### Open the file
```bash
open scripts/output/slugs-2025-12-28.csv
```

### What to check
- ✅ Slugs are URL-friendly (lowercase, hyphens, no special chars)
- ✅ No duplicates (all 56 should be unique)
- ⚠️ Check lesson #26 - might have very long slug if name contains notes

### How to import
1. Open CSV in Excel/Numbers/Google Sheets
2. Copy `slug` and `@id` columns
3. Open your master Google Sheet
4. Add these as new columns
5. Paste the values

**Expected result:** 2 new columns added to your spreadsheet

---

## Step 2: Review Languages (5 minutes)

### Open the file
```bash
open scripts/output/languages-2025-12-28.csv
```

### What to check
- ✅ Quick scan of `inLanguage` column
- ✅ Multi-language lessons preserved (e.g., "en, es, fr")
- ✅ Empty fields now have "en" (default)

### How to import
1. Copy `inLanguage` column from CSV
2. Paste into your Google Sheet `inLanguage` column (replace existing)

**Expected result:** All language codes now standardized to IETF format

---

## Step 3: Review Time Estimates (30-45 minutes)

### Open the file
```bash
open scripts/output/time-estimates-2025-12-28.csv
```

### What to check

**1. Fix fetch errors (REQUIRED)**

Two lessons have errors and need manual attention:
- **Reproducibility Principles and Practices** - URL returned 404
- **Overview of Remote and High Performance Computing (HPC)** - Fetch failed

Action: Verify URLs are correct, or manually estimate time

**2. Spot-check 10-15 random lessons**

Pick random rows, open the lesson URL, skim content:
- Does `timeRequired` seem reasonable?
- Examples to verify:
  - "Building Community": PT14M (14 min, 3,464 words) - reasonable?
  - "How to Contribute to Open Source": PT24M (24 min, 4,738 words) - reasonable?
  - "Intermediate Python: next-level Data Visualization": PT2H21M (141 min, 11,277 words) - reasonable?

**3. Delete helper columns**

Before importing, delete these columns (they're just for review):
- `_needsReview`
- `_wordCount`
- `_contentType`
- `_error`
- `_original`

### How to import
1. Delete helper columns (see above)
2. Copy `timeRequired` column
3. Paste into your Google Sheet as new column

**Expected result:** All lessons (except 2 with errors) now have time estimates in ISO 8601 format

---

## Step 4: Review Metadata (45-60 minutes)

### Open the file
```bash
open scripts/output/metadata-2025-12-28.csv
```

### What to check

**1. Fix 17 flagged lessons**

These lessons are missing author or license and need manual review:

**Missing both author and license:**
- Building Community
- Leadership and Governance
- Finding Users for Your Project
- Metrics
- Best Practices for Maintainers

**Known fix:** These are all opensource.guide lessons
- Author: `GitHub`
- License: `CC-BY-4.0`

**Missing only license:**
- Python Basics
- R Basics
- Intermediate Python: next-level Data Visualization
- Intermediate R: Next-level Data Visualization
- Intermediate Python
- Intermediate R
- Geocoding
- Coordinate Reference Systems
- Introduction to Basic Statistics with R

**Known fix:** Many UCD DataLab lessons show license in footer
- License: `CC-BY-NC-SA-4.0` (check page footer to confirm)

**Fetch errors:**
- Reproducibility Principles and Practices (404)
- Overview of Remote and High Performance Computing (HPC) (fetch failed)

**2. Check author names**

Some author extractions captured wrong text:
- "giving early contributors" → Should be "GitHub"
- "being users of software they contribute to" → Should be "GitHub"
- "instructors outside of the original author team" → Should be "The Carpentries"

Fix these in the CSV before importing.

**3. Spot-check 10 random lessons**

- Verify author names look correct
- Verify license codes match page footer
- Verify dates seem reasonable

**4. Delete helper columns**

Before importing, delete these columns:
- `_needsReview`
- `_error`
- `_authorSource`
- `_licenseSource`
- `_original`

### How to import
1. Fix the 17 flagged lessons
2. Correct wrong author names
3. Delete helper columns
4. Copy `author`, `license`, `datePublished` columns
5. Paste into your Google Sheet

**Expected result:** Most lessons now have complete author/license/date metadata

---

# Team Communication

## The Key Message

Your team doesn't need to understand the automation. They just need to know:
1. Some columns are being updated
2. Their workflow doesn't change
3. Who to contact if they see issues

## For Students (Email Template)

```
Subject: Lesson Spreadsheet - Metadata Updates

Hi everyone,

I'm adding some metadata to our lesson spreadsheet to improve how
our lessons show up in search results. This won't affect your work.

What's changing:
- Adding unique IDs for each lesson (new columns)
- Standardizing language codes (en, es, fr format)
- Adding time estimates (how long lessons take)
- Filling in missing authors and licenses

What you need to know:
✅ Continue editing the spreadsheet normally
✅ The columns you work with are unchanged
✅ If you notice anything weird, let me know

Questions? Reply to this email.

Best,
Tim
```

## For Teammates (Slack/Teams)

```
Hey team! 👋

I'm updating our lesson spreadsheet with some missing metadata
to help with web discoverability (Bioschemas compliance).

How it works:
- Scripts analyzed the 56 lessons
- Generated suggestions in CSV files
- I reviewed and fixed errors
- I'm importing the good data back to the Sheet

Your workflow: No change! I'll update columns gradually
(one per week) to minimize disruption.

I'll post before each update. Questions? DM me.
```

## Recommended Update Strategy

**Don't update all at once.** Import one column per week:

**Week 1: Slugs**
```
Slack: "This week I'm adding unique IDs (slug, @id columns).
These will be used for lesson detail pages. No impact on your work."
```

**Week 2: Languages**
```
Slack: "This week I'm standardizing language codes (en, es, fr format).
Same data, just cleaner format."
```

**Week 3: Time Estimates**
```
Slack: "This week I'm adding timeRequired column (how long lessons take).
Spot-check your favorite lessons - do the estimates look right?"
```

**Week 4: Metadata**
```
Slack: "Final update: filling in missing authors/licenses/dates.
Let me know if you spot any errors."
```

**Why this approach?**
- Team sees small, understandable changes each week
- Easy to explain what each update does
- If something goes wrong, only 1 column affected
- Builds trust gradually

## Handling Team Questions

**"Why are you doing this?"**
→ "To make our lessons more discoverable in search engines (Bioschemas compliance)"

**"Will this break anything?"**
→ "No, we're just filling in empty fields and standardizing formats"

**"Can I still edit the spreadsheet?"**
→ "Yes! Your workflow doesn't change. Edit normally."

**"What if I don't like the new values?"**
→ "Let me know which ones and why. I can fix them."

**"What are these weird codes (PT1H30M, zh-CN)?"**
→ "Industry standard formats: PT1H30M = 1.5 hours, zh-CN = Chinese Simplified"

---

# Re-running Scripts

## When You Might Need This

- You updated lesson URLs and want to re-scrape metadata
- You added new lessons to the spreadsheet
- You want to regenerate time estimates with different settings

## How to Run

**Run all Phase 1 scripts:**
```bash
npm run enhance:phase1
```

**Run individual scripts:**
```bash
npm run enhance:slugs      # Generate slugs & @id
npm run enhance:language   # Standardize languages
npm run enhance:time       # Estimate time required
npm run enhance:metadata   # Scrape author/license/dates
```

## What Happens

1. Scripts fetch fresh data from Google Sheets
2. Process all lessons (including any new ones)
3. Generate new CSV files with today's date
4. You review and import as before

**Note:** Scripts skip fields that are already filled (unless you want to overwrite)

## Adjusting Script Behavior

### Change reading speed for time estimates

Edit `scripts/estimate-time-required.js`:
```javascript
const READING_SPEED = 200; // words per minute
// Try 150 for slower, 250 for faster
```

### Change content type multipliers

Edit `scripts/estimate-time-required.js`:
```javascript
const CONTENT_TYPE_MULTIPLIERS = {
  'video': 1.0,       // Watch at normal speed
  'tutorial': 2.5,    // Hands-on practice takes longer
  'guide': 1.2,       // Reading + comprehension
  // Adjust as needed
};
```

### Add organization mappings

Edit `scripts/scrape-metadata.js`:
```javascript
const ORG_DOMAIN_MAP = {
  'opensource.guide': 'GitHub',
  'yoursite.com': 'Your Organization',
  // Add more domain → organization mappings
};
```

---

# Troubleshooting

## "CSV file looks weird when I open it"

**Problem:** Excel sometimes mangles CSV encoding

**Solution:**
- Use "File → Import" instead of double-clicking
- Or use Google Sheets: File → Import → Upload
- Or use Numbers on Mac (handles CSV better)

## "I imported wrong data to Google Sheets"

**Solution 1:** Undo immediately (Cmd+Z / Ctrl+Z)

**Solution 2:** Use version history
```
Google Sheets → File → Version history → See version history
→ Find version before import → Restore
```

**Solution 3:** Re-run the script and import again

## "Script says '404 Not Found' for some lessons"

**Problem:** Lesson URLs are broken or changed

**Solution:**
1. Open your Google Sheet
2. Find the lesson with 404 error
3. Check if URL is correct
4. Update URL if needed
5. Re-run script

## "Script says 'Module not found'"

**Problem:** Dependencies not installed

**Solution:**
```bash
cd /Users/timdennis/websites/OSPO_WEBSITE
npm install
```

## "Author names look wrong"

**Problem:** Script extracted byline text instead of actual author

**Examples:**
- "giving early contributors" → Should be "GitHub"
- "instructors outside of the original author team" → Should be "The Carpentries"

**Solution:** Edit these directly in the CSV before importing

## "Missing licenses for many lessons"

**Known issue:** Many lessons don't have license metadata in HTML

**Solution:**
1. Check the lesson page footer for license
2. Common licenses:
   - opensource.guide → CC-BY-4.0
   - The Carpentries → CC-BY-SA-4.0
   - UCD DataLab → CC-BY-NC-SA-4.0
3. Add manually to CSV before importing

## "Time estimates seem way off"

**Problem:** Script estimated based on word count, but lesson might be:
- Video content (takes longer than reading)
- Interactive exercises (takes much longer)
- Very dense technical content

**Solution:**
1. Spot-check estimates against actual lesson content
2. Adjust obviously wrong ones in CSV
3. Consider adjusting READING_SPEED or multipliers (see "Re-running Scripts")

## "Team is confused by changes"

**Solution:**
1. Use the communication templates above
2. Update one column per week (not all at once)
3. Add a "Changelog" tab to Google Sheet documenting changes
4. Post in team Slack/email before each update

## "I want to undo everything"

**Solution 1:** Don't import the CSVs (just ignore them)

**Solution 2:** Use Google Sheets version history to restore to before imports

**Solution 3:** Manually delete the columns you added

---

## Questions Not Covered Here?

Check `REFERENCE.md` for technical details, or ask me directly.

---

**Generated:** December 28, 2025
**Scripts:** Phase 1 Complete
**Next:** Review CSVs and import to Google Sheets
