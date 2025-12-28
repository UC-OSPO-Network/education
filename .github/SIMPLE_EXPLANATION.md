# Simple Explanation: Metadata Automation

## The 30-Second Version

**What we built:** Scripts that fill in missing metadata fields automatically.

**How it works:** Scripts read the Google Sheet, suggest values, save them to CSV files. You review the CSV files and copy the good suggestions back into the Google Sheet.

**Key point:** Scripts NEVER touch the Google Sheet directly. You're always in control.

---

## For Your Own Mental Model

Think of it like **spell-check for spreadsheets**:

```
Your Google Sheet (the document)
         ↓
   Scripts READ it
         ↓
   Scripts suggest corrections
         ↓
   You review suggestions
         ↓
   You accept or reject
         ↓
Your Google Sheet (updated)
```

**The scripts are assistants, not decision-makers.**

---

## What Actually Happened

You had 56 lessons with lots of missing metadata:
- No time estimates (0/56 filled)
- No unique IDs (0/56 filled)
- Inconsistent language codes (50/56 filled)
- Missing authors, licenses, dates (30-60% filled)

I built 4 scripts that:
1. **Generate unique IDs** - Every lesson gets a slug like "building-community"
2. **Standardize languages** - "English, Spanish" → "en, es"
3. **Estimate time** - Count words, guess how long lesson takes
4. **Scrape metadata** - Visit lesson URLs, extract author/license/dates

Each script creates a CSV file with its suggestions. You review them, fix mistakes, then copy the good columns into your Google Sheet.

---

## For Your Students

**Email template you can send:**

```
Subject: Lesson Spreadsheet - Small Updates Coming

Hi everyone,

I'm adding some missing metadata to our lesson spreadsheet to make
the lessons more discoverable on the web. This won't affect your work.

What's changing:
- Adding unique IDs for each lesson (new columns: slug, @id)
- Standardizing language codes (en, es, fr instead of English, Spanish, French)
- Adding time estimates (how long each lesson takes)
- Filling in missing authors and licenses

What you should know:
✅ Keep editing the spreadsheet normally
✅ Most columns are unchanged
✅ If you see something weird, let me know

Questions? Reply to this email.

Tim
```

---

## For Your Teammates (Collaborators)

**Slack/Teams message you can send:**

```
Hey team! 👋

I'm using some automation to fill in missing lesson metadata
(for Bioschemas compliance - makes our lessons show up better
in search results).

Here's how it works:
1. Scripts read our Google Sheet
2. Generate CSV files with suggestions
3. I review and fix errors
4. I copy-paste the good stuff back into the Sheet

Your workflow doesn't change. I'll update you when I import
new columns (probably one column per week to keep it simple).

Let me know if you have questions!
```

---

## For Technical Collaborators

**If someone asks "how does this work?":**

```
We have 4 Node.js scripts that:

1. Fetch lesson data from Google Sheets API (read-only)
2. Process/analyze/enhance the data
3. Output CSV files for human review
4. Human imports approved data back to Google Sheets

Scripts are in scripts/ directory:
- generate-slugs.js - Creates URL-friendly IDs
- standardize-languages.js - Converts to IETF codes
- estimate-time-required.js - Estimates duration via word count
- scrape-metadata.js - Extracts author/license/dates from URLs

All scripts have retry logic, error handling, and rate limiting.
CSV outputs include _needsReview flags for uncertain values.

Run all: npm run enhance:phase1
Run individually: npm run enhance:slugs, etc.

See scripts/README.md for details.
```

---

## What You Actually Need to Do

**Right now, your to-do list is simple:**

### Option A: Review and Import (2-3 hours)

1. Open `scripts/output/slugs-2025-12-28.csv`
   - Scan the slugs, make sure they look reasonable
   - Copy the `slug` and `@id` columns
   - Paste into Google Sheet as new columns

2. Open `scripts/output/languages-2025-12-28.csv`
   - Quick scan (this is very accurate)
   - Copy `inLanguage` column
   - Paste into Google Sheet

3. Open `scripts/output/time-estimates-2025-12-28.csv`
   - Fix 2 lessons with errors
   - Spot-check 10 random estimates
   - Copy `timeRequired` column
   - Paste into Google Sheet

4. Open `scripts/output/metadata-2025-12-28.csv`
   - Fix 17 lessons with missing data
   - Copy `author`, `license`, `datePublished` columns
   - Paste into Google Sheet

**Done!** You just saved 30-40 hours of manual work.

---

### Option B: Do Nothing Right Now (Totally Fine!)

The CSV files will sit in `scripts/output/` until you're ready.

You can:
- Review them next week
- Review them next month
- Ask someone else to review them
- Decide not to use them at all

**No pressure. No deadlines.**

---

## Common Questions

### "What if the automation is wrong?"

You review everything before it goes into the Google Sheet. If something looks wrong, you just don't import it. Or you fix it in the CSV first.

### "Will this confuse my team?"

Only if they see changes they don't understand. That's why I recommend:
- Communicate before making changes
- Update one column at a time
- Add a "Changelog" tab to explain what changed

### "Can I run the scripts again if I need to?"

Yes! The scripts read fresh data from Google Sheets each time. If you update the sheet and want to re-run automation, just run the scripts again.

### "What if I mess up the import?"

Google Sheets has version history (File → Version history). You can always undo and go back to a previous version.

### "Do I need to understand how the scripts work?"

No! You just need to understand:
1. Scripts suggest values → CSV files
2. You review CSV files
3. You import what you like

That's it.

---

## What to Ignore (For Now)

You have a lot of documentation in `.github/`:
- BIOSCHEMAS_COMPLIANCE_ANALYSIS.md
- DATA_DICTIONARY.md
- METADATA_AUTOMATION_ANALYSIS.md
- TEAM_COLLABORATION_WORKFLOW.md
- LESSON_IDENTIFIERS_ANALYSIS.md
- HUMAN_REVIEW_WORKFLOW.md
- PHASE1_AUTOMATION_RESULTS.md

**You don't need to read all of this right now.**

These are reference docs if you want deep details. But the simple explanation above is all you really need.

---

## The Simplest Possible Next Step

**Just open one CSV file and look at it:**

```bash
open scripts/output/slugs-2025-12-28.csv
```

Scroll through it. Does it make sense? Do the slugs look reasonable?

If yes → Copy the `slug` column, paste it into Google Sheets.
If no → Tell me what looks wrong and I'll help fix it.

**Start with just one field. Get comfortable. Then do the next one.**

---

## Bottom Line

**You asked:** "How do I understand and communicate this?"

**Answer:**

**For yourself:** Scripts suggest → You review → You import

**For students:** "I'm adding some missing data, won't affect your work"

**For teammates:** "Using automation to fill gaps, I'll update you when I import changes"

**For technical folks:** "Node scripts that read Sheets API, output CSVs for review, human imports back"

---

## Want Me to Simplify Further?

Tell me:
1. **What part is confusing?** (The workflow? The scripts? The review process?)
2. **Who do you need to explain this to?** (Students? Colleagues? Your boss?)
3. **What's the scariest part?** (Breaking the spreadsheet? Team confusion? Technical complexity?)

I can create even simpler explanations or diagrams if this is still too much.
