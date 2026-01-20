# Data Quality Analysis

**Date:** 2026-01-19
**Source:** Google Sheets CSV (197 rows analyzed)
**Status:** 0 fully valid lessons out of 197 rows

## Critical Issues Summary

| Issue | Count | % of Total |
|-------|-------|------------|
| Missing slug | 197 | 100% |
| Missing description | 177 | 90% |
| Missing URL | 147 | 75% |
| Missing name | 3 | 2% |

## Root Cause: Structural Problems

The Google Sheet appears to have a **hierarchical structure** that doesn't match the expected flat structure:

### Pattern 1: Lesson Titles with Fragmented Data
**Example (Row 2):**
- Name: "Building Community"
- URL field contains: "Discover how to foster a strong and inclusive community..." (description text, not a URL)
- Description field: Empty

### Pattern 2: Learning Objectives as Separate Rows
**Example (Rows 6-11):**
- Row 5: "Writing Documentation for Software Projects" (lesson title)
- Row 6: "Describe different types of documentation (e.g." (learning objective)
- Row 7: "Recognize best practices for writing clear" (learning objective)
- Row 8: "List tools and formats commonly used..." (learning objective)

These learning objectives should be **part of the lesson content**, not separate rows.

### Pattern 3: Invalid URL Formats
Many rows have text fragments in the URL field instead of actual URLs:
- "decision-making processes" (Row 3)
- "PhD Students" (Row 11, 18)
- "Developers" (Row 25)

## Impact on Site

Despite these data quality issues, the site appears to function because:
1. The code handles missing fields with fallbacks (`|| 'Untitled Lesson'`, `|| 'No description available'`)
2. Only 2 rows have complete, valid data, but the site displays something for all rows
3. Link validation passes because broken data doesn't create broken HTML links

## Recommended Fixes

### High Priority (Breaks Functionality)
1. **Add slugs** for all lessons (100% missing) - Required for proper routing
2. **Fix URLs** - Replace text fragments with actual lesson URLs (147 missing)
3. **Add descriptions** - Currently using fallback text (177 missing)

### Medium Priority (Improves Quality)
4. **Consolidate learning objectives** - Merge sub-rows into parent lesson rows
5. **Standardize structure** - One row per lesson with all metadata

### Low Priority (Nice to Have)
6. Add educational levels for all lessons
7. Add learner categories
8. Add subtopics

## Data Structure Recommendation

Each lesson should be **one row** with this structure:

```csv
name,description,url,slug,educationalLevel,learnerCategory,subTopic,learningObjectives
"Building Community","Learn to foster inclusive open source communities","https://example.com/lesson","building-community","Intermediate","Maintainer","Community","Describe communication strategies; Recognize governance models"
```

Learning objectives should be stored as:
- Separate field (semicolon-separated)
- OR as separate table/sheet with foreign key reference
- NOT as separate rows in the main lessons table

## Full Report

Detailed row-by-row analysis: `.github/DATA_QUALITY_ISSUES.csv`

---

**Action Items:**
1. Review the Google Sheet structure with the data owner
2. Determine if the hierarchical structure is intentional
3. If intentional, update the data parsing logic to handle parent/child relationships
4. If not intentional, flatten the data structure (recommended)
