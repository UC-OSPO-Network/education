# Google Sheets Update Instructions

## Overview

This guide explains how to update the UC OSPO Education Google Sheets with the newly generated Learning Objectives.

## Files Generated

1. **`learning-objectives-complete.csv`** - Complete CSV with all lessons and their Learning Objectives
2. **`learning-objectives-summary.md`** - Human-readable summary organized by topic

## Update Process

### Step 1: Open the Generated CSV

1. Navigate to `F:\education\scripts\output\learning-objectives-complete.csv`
2. Open the file in Excel or Google Sheets
3. Review the "New Learning Objectives" column

### Step 2: Access the Google Sheet

1. Open the [UC OSPO Education Lesson Inventory](https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/edit?gid=1792935546#gid=1792935546)
2. Ensure you have edit permissions

### Step 3: Update Learning Objectives Column

**Option A: Copy-Paste Individual Entries (Recommended for Review)**

1. In the CSV file, locate a lesson by name
2. Copy the content from the "New Learning Objectives" column
3. In Google Sheets, find the same lesson row
4. Paste into the "Learning Objectives" column
5. Repeat for all 56 lessons

**Option B: Bulk Update (Faster, but requires careful alignment)**

1. In the CSV file, select all cells in the "New Learning Objectives" column (rows 2-57)
2. Copy the selection (Ctrl+C / Cmd+C)
3. In Google Sheets, click on the first cell of the "Learning Objectives" column (row 2)
4. Paste (Ctrl+V / Cmd+V)
5. **IMPORTANT**: Verify that lesson names align correctly between CSV and Google Sheets

### Step 4: Verify the Update

1. Scroll through the Google Sheet to ensure all Learning Objectives are populated
2. Check that the format is preserved:
   ```
   After this lesson, the learner should be able to:
   - [Outcome 1]
   - [Outcome 2]
   - [Outcome 3]
   ```
3. Pay special attention to these lessons that need manual review:
   - "Introduction to Version Control with Git." (row with this exact name)
   - "TESTING again" (test entry)

### Step 5: Handle Lessons Needing Review

Two lessons are marked as "Needs Review":

1. **Introduction to Version Control with Git.**
   - URL: https://ucdavisdatalab.github.io/workshop_introduction_to_version_control/chapters/index.html
   - Action: Review the lesson content and create 3-5 specific Learning Objectives
   - Suggested LOs:
     ```
     After this lesson, the learner should be able to:
     - Explain the concept of version control and its importance
     - Demonstrate how to initialize and manage Git repositories
     - Apply basic Git commands to track changes and manage history
     - Identify best practices for commit messages and repository organization
     - Recognize the benefits of version control for collaboration
     ```

2. **TESTING again**
   - This appears to be a test entry
   - Action: Delete this row or update with actual lesson information

### Step 6: Validate Data Quality

Run the validation script to confirm data integrity:

```bash
cd F:\education
node .github/scripts/validate-data.mjs
```

Expected output: CSV should fetch successfully with all 56 lessons.

## Statistics

- **Total Lessons**: 56
- **Learning Objectives Generated**: 52 (92.9%)
- **Existing LOs Kept**: 2 (3.6%)
- **Needs Manual Review**: 2 (3.6%)
- **Overall Completion**: 96.4%

## Quality Checklist

After updating, verify:

- ✅ All Learning Objectives follow the format: "After this lesson, the learner should be able to..."
- ✅ Each lesson has 3-5 specific, measurable outcomes
- ✅ Bloom's taxonomy verbs are used (explain, demonstrate, apply, identify, etc.)
- ✅ Outcomes are learner-focused (what they can DO, not what content is covered)
- ✅ No formatting issues (line breaks preserved, bullets intact)

## Troubleshooting

**Issue**: Line breaks are not preserved when pasting
- **Solution**: Use "Paste special" → "Paste values only" in Google Sheets

**Issue**: Bullets (•) don't display correctly
- **Solution**: The CSV uses hyphens (-) for bullets, which should work in Google Sheets

**Issue**: Some Learning Objectives are cut off
- **Solution**: Expand the column width or enable text wrapping in Google Sheets

## Next Steps

After updating the Google Sheet:

1. Share the updated sheet with the repository owner for review
2. Reference this work in your GitHub issue comment
3. Consider creating a pull request if any code changes are needed
4. Update the issue with completion status

## Contact

If you encounter any issues during the update process, refer to:
- Implementation Plan: `C:\Users\Hp\.gemini\antigravity\brain\6bf4a853-9750-4166-83b3-46766c7e94a9\implementation_plan.md`
- Summary Document: `F:\education\scripts\output\learning-objectives-summary.md`
