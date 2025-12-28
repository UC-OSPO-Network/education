# START HERE: Metadata Automation Quick Start

## What Happened?

I built scripts that filled in missing metadata for your 56 lessons. The results are in CSV files ready for your review.

---

## Your Options

### Option 1: Use It (Recommended - Saves ~35 hours)

**Time investment:** 1.5-2 hours of review

1. **Open the first CSV file**
   ```bash
   open scripts/output/slugs-2025-12-28.csv
   ```

2. **Look at it** - Does it make sense?

3. **Copy the columns you like** → Paste into Google Sheets

4. **Repeat for other CSV files** (4 total)

**Result:** Your spreadsheet now has all the missing metadata filled in.

---

### Option 2: Wait

The CSV files will be there when you're ready. No rush.

---

### Option 3: Don't Use It

That's totally fine! Just ignore the CSV files.

---

## If You Choose Option 1

### Step-by-Step (1.5-2 hours total)

**File 1: Slugs** (10 minutes)
```bash
open scripts/output/slugs-2025-12-28.csv
```
- Scan the "slug" column - should look like "building-community", "git-basics"
- Copy `slug` and `@id` columns → Paste into Google Sheet

**File 2: Languages** (5 minutes)
```bash
open scripts/output/languages-2025-12-28.csv
```
- Scan "inLanguage" column - should look like "en", "en, es", "fr"
- Copy `inLanguage` column → Paste into Google Sheet

**File 3: Time Estimates** (30-45 minutes)
```bash
open scripts/output/time-estimates-2025-12-28.csv
```
- Fix 2 lessons with errors (404s)
- Spot-check 10 random time estimates
- Copy `timeRequired` column → Paste into Google Sheet

**File 4: Metadata** (45-60 minutes)
```bash
open scripts/output/metadata-2025-12-28.csv
```
- Fix ~17 lessons with missing licenses
- Verify author names look correct
- Copy `author`, `license`, `datePublished` → Paste into Google Sheet

**Done!** ✅

---

## Communication Templates

### For Students (Email)
```
Subject: Lesson Spreadsheet Updates

Hi everyone,

I'm adding some metadata to our lesson spreadsheet. This won't
affect your work - you can keep editing normally.

If you see any issues, let me know.

Tim
```

### For Teammates (Slack)
```
Hey team! Using automation to fill in missing lesson metadata.
I'll update one column at a time over the next few weeks.
Your workflow doesn't change. Questions? DM me.
```

---

## Safety Nets

**Worried about breaking something?**

- Scripts NEVER touch your Google Sheet (only read from it)
- You review everything before importing
- Google Sheets has version history (File → Version history)
- You can undo any paste operation (Ctrl+Z / Cmd+Z)

**Confused by what you see?**

- Read: `.github/SIMPLE_EXPLANATION.md` - Plain English explanation
- Look at: `.github/WORKFLOW_DIAGRAM.md` - Visual diagrams
- Ask me: I'm here to help

---

## The Simplest Mental Model

```
Scripts suggest values → You review → You import to Google Sheets
```

That's it.

---

## What Files to Ignore (For Now)

You have lots of documentation in `.github/`:
- BIOSCHEMAS_COMPLIANCE_ANALYSIS.md
- DATA_DICTIONARY.md
- METADATA_AUTOMATION_ANALYSIS.md
- TEAM_COLLABORATION_WORKFLOW.md
- LESSON_IDENTIFIERS_ANALYSIS.md
- HUMAN_REVIEW_WORKFLOW.md
- PHASE1_AUTOMATION_RESULTS.md

**You don't need to read these unless you want details.**

The three files you DO need:
1. **START_HERE.md** (this file) - Quick start
2. **SIMPLE_EXPLANATION.md** - Plain English explanation
3. **WORKFLOW_DIAGRAM.md** - Visual workflow

---

## Questions?

**"What if the automation is wrong?"**
→ You fix it in the CSV before importing (or just don't import that field)

**"Will this confuse my team?"**
→ Only if you don't communicate. Use the email templates above.

**"Can I run the scripts again?"**
→ Yes! `npm run enhance:phase1` re-runs everything

**"Do I need to understand the code?"**
→ No. You just need to review CSVs and import columns.

**"What if I mess up?"**
→ Google Sheets has Undo (Cmd+Z) and Version History

---

## Next Action

Pick ONE:

- [ ] Open `scripts/output/slugs-2025-12-28.csv` and look at it (5 min)
- [ ] Read `.github/SIMPLE_EXPLANATION.md` for more context (10 min)
- [ ] Do nothing right now (that's fine!)

**Start small. Get comfortable. Then decide.**

---

**Bottom line:** You have 4 CSV files with automated suggestions. Review them, import what you like. That's the whole system.
