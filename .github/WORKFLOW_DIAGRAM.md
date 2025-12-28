# Visual Workflow Diagram

## The Complete Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE SHEETS                               │
│                  (Your source of truth)                         │
│                                                                 │
│  56 lessons with metadata                                      │
│  - Some fields filled ✓                                        │
│  - Some fields empty ✗                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Scripts READ (never write)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATION SCRIPTS                           │
│                                                                 │
│  4 scripts process the data:                                   │
│  1. generate-slugs.js        → Create unique IDs               │
│  2. standardize-languages.js → Convert to codes                │
│  3. estimate-time-required.js → Calculate durations            │
│  4. scrape-metadata.js       → Extract author/license          │
│                                                                 │
│  Runtime: ~15 minutes total                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Scripts OUTPUT
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CSV FILES                                 │
│                  (In scripts/output/)                           │
│                                                                 │
│  📄 slugs-2025-12-28.csv                                       │
│  📄 languages-2025-12-28.csv                                   │
│  📄 time-estimates-2025-12-28.csv                              │
│  📄 metadata-2025-12-28.csv                                    │
│                                                                 │
│  Contains: Original data + New suggestions + Review flags      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ YOU open in Excel/Numbers/Sheets
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HUMAN REVIEW                                 │
│                    (That's you!)                                │
│                                                                 │
│  ✓ Check suggestions look reasonable                           │
│  ✓ Fix errors or weird values                                  │
│  ✓ Delete helper columns (_needsReview, etc.)                  │
│  ✓ Decide what to keep                                         │
│                                                                 │
│  Time: ~1.5-2 hours                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ YOU copy-paste approved columns
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE SHEETS                               │
│                 (Updated with new data)                         │
│                                                                 │
│  56 lessons with MORE metadata ✓✓✓                            │
│  - slug, @id, timeRequired now filled                          │
│  - languages standardized                                      │
│  - author/license/dates improved                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Your Team Sees

**Before you import:**
```
Google Sheet (Team's view)
┌─────────────────────────┐
│ Lesson Name | Language  │
│─────────────────────────│
│ Git Basics  | English   │
│ Python 101  | (empty)   │
└─────────────────────────┘

Your team keeps editing normally ✓
```

**After you import (one column at a time):**
```
Google Sheet (Team's view)
┌───────────────────────────────────┐
│ Lesson Name | Language  | slug    │ ← New column appeared
│───────────────────────────────────│
│ Git Basics  | en        | git-... │ ← Standardized + added ID
│ Python 101  | en        | pyth... │ ← Filled empty + added ID
└───────────────────────────────────┘

Team sees: 1 new column, 1 changed column
Impact: Minimal, easy to understand
```

---

## The Safety Net

```
┌─────────────────────────────────────────────┐
│  What if something goes wrong?              │
├─────────────────────────────────────────────┤
│                                             │
│  Option 1: Don't import that CSV            │
│  → Just delete the file, ignore it          │
│                                             │
│  Option 2: Fix in CSV before importing      │
│  → Edit the CSV, then import                │
│                                             │
│  Option 3: Undo in Google Sheets            │
│  → File → Version history → Restore         │
│                                             │
│  Option 4: Re-run the scripts               │
│  → Start over with fresh data               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Single Column Workflow (Recommended)

Instead of importing all at once, do one column per week:

```
Week 1: Import just "slug"
┌──────────────────────┬─────────┐
│ Lesson Name          │ slug    │ ← Only this changed
├──────────────────────┼─────────┤
│ Building Community   │ buildi..│
└──────────────────────┴─────────┘

Team notification: "Added unique IDs"
Team impact: Low (1 new column)

---

Week 2: Import just "inLanguage"
┌──────────────────────┬─────────┬─────────┐
│ Lesson Name          │ slug    │ inLang  │ ← Only this changed
├──────────────────────┼─────────┼─────────┤
│ Building Community   │ buildi..│ en, es  │
└──────────────────────┴─────────┴─────────┘

Team notification: "Standardized language codes"
Team impact: Low (1 changed column)

---

Week 3: Import just "timeRequired"
┌──────────────────────┬─────────┬─────────┬──────────┐
│ Lesson Name          │ slug    │ inLang  │ timeReq  │ ← Only this changed
├──────────────────────┼─────────┼─────────┼──────────┤
│ Building Community   │ buildi..│ en, es  │ PT15M    │
└──────────────────────┴─────────┴─────────┴──────────┘

Team notification: "Added time estimates"
Team impact: Low (1 new column)
```

**Why this is better:**
- Team sees small, understandable changes
- Easy to explain each week
- If something goes wrong, only 1 column affected
- Builds trust gradually

---

## Data Flow: Scripts Never Touch Google Sheets

```
                     ╔══════════════════╗
                     ║  Google Sheets   ║
                     ║  (Sacred Source) ║
                     ╚══════════════════╝
                            ▲
                            │
                    READ ONLY│  ← Scripts can only read
                            │
                     ┌──────┴──────┐
                     │   Scripts   │
                     └──────┬──────┘
                            │
                    WRITE ONLY to CSV files
                            │
                            ▼
                     ╔══════════════════╗
                     ║    CSV Files     ║
                     ║   (Suggestions)  ║
                     ╚══════════════════╝
                            ▲
                            │
                       You review
                            │
                            ▼
                       You decide
                            │
                            ▼
                     Manual copy-paste
                            │
                            ▼
                     ╔══════════════════╗
                     ║  Google Sheets   ║
                     ║    (Updated)     ║
                     ╚══════════════════╝
```

**Key insight:** Google Sheets is a one-way door for scripts (read-only).
Only YOU can write to Google Sheets.

---

## The Human-in-the-Loop

```
  Script suggests:                You decide:

  timeRequired: PT2H30M    →     ✓ Keep it
  timeRequired: PT15M      →     ✓ Keep it
  timeRequired: PT6H45M    →     ✗ Too long! Change to PT3H
  timeRequired: ERROR      →     ✗ Manual entry: PT1H
  timeRequired: PT45M      →     ✓ Keep it
```

**You are the quality control.** Scripts are helpers, not replacements.

---

## Comparison: What Changed?

### Before Automation
```
You: Manually visit 56 lesson URLs
     Count words
     Estimate time
     Look for author
     Find license
     Copy-paste into spreadsheet

Time: 30-40 hours
Error rate: Medium (human fatigue)
```

### After Automation
```
Scripts: Visit 56 lesson URLs
         Count words
         Estimate time
         Look for author
         Find license
         Save to CSV

You: Review CSV for 1.5-2 hours
     Fix obvious errors
     Import to spreadsheet

Time: 2 hours
Error rate: Low (you catch script mistakes)
```

**Net result:** 95% time savings, better accuracy (double-checking)

---

## Mental Model Summary

**Think of scripts as:**
- ✓ Research assistants who gather information
- ✓ Spell-checkers that suggest corrections
- ✓ Calculators that crunch numbers

**NOT as:**
- ✗ Automatic updaters that change your data
- ✗ AI that makes decisions for you
- ✗ Black boxes you can't understand

---

## If You Only Remember One Thing

```
╔════════════════════════════════════════════════╗
║                                                ║
║  Scripts suggest → You review → You import     ║
║                                                ║
║  You are always in control.                    ║
║                                                ║
╔════════════════════════════════════════════════╝
```

That's the whole system.
