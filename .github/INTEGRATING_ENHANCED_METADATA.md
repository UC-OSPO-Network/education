# Integrating Enhanced Metadata into Google Sheets

**Status**: Ready to integrate
**Generated**: 2026-01-20
**File**: `scripts/output/MERGED-enhanced-metadata-2026-01-20.csv`

## What's Been Enhanced

The merged CSV contains **5 major enhancements** to your lesson metadata:

| Enhancement | Status | Coverage |
|-------------|--------|----------|
| **Slugs** | ✅ Complete | 198/198 lessons (100%) |
| **Language codes** | ⚠️ Partial | 6/198 lessons (3%) |
| **Curated subtopics** | ⚠️ Partial | 30/198 lessons (15%) |
| **Slug-based dependencies** | ⚠️ Partial | 24/198 lessons (12%) |
| **Time estimates** | ⚠️ Partial | 53/198 lessons (27%) |

### 1. Slugs (100% complete) ✅
**What**: URL-friendly identifiers like `building-community`, `leadership-and-governance`
**Why**: Essential for routing, SEO, and Keystatic migration
**Column**: `slug`

### 2. Standardized Language Codes (3% complete) ⚠️
**What**: ISO 639-1 codes like `en, es, fr, de` instead of full names
**Why**: Standard format for i18n, smaller data footprint
**Column**: `inLanguage`
**Note**: Only 6 lessons from opensource.guide have been standardized

### 3. Curated Subtopics (15% complete) ⚠️
**What**: Controlled vocabulary like "Grow & Support Your Community", "Practice Core Skills"
**Why**: Better organization, filtering, and navigation
**Column**: `subTopic`
**Reference**: See `.github/SUBTOPIC_ASSIGNMENTS.md` for full list

### 4. Slug-Based Dependencies (12% complete) ⚠️
**What**: References like `building-community` instead of `2`
**Why**: Survives sorting/reordering, works with Keystatic
**Column**: `dependsOn`

### 5. Time Estimates (27% complete) ⚠️
**What**: Duration estimates like "45 minutes", "2 hours"
**Why**: Helps students plan their learning
**Column**: `timeRequired`

## Integration Options

### Option A: Upload to Google Sheets (Quick)

1. Open your Google Sheet
2. **File → Import → Upload**
3. Select `scripts/output/MERGED-enhanced-metadata-2026-01-20.csv`
4. Choose "Replace current sheet"
5. Verify the data looks correct
6. Test the site still works

**Pros**: Fast, keeps existing workflow
**Cons**: Doesn't fix data quality issues (197 rows with problems)

### Option B: Clean Data First, Then Upload (Recommended)

The data still has significant quality issues from `.github/DATA_QUALITY_ANALYSIS.md`:
- 177 lessons missing descriptions (90%)
- 147 lessons missing URLs (75%)
- Many rows are learning objectives, not lessons

**Recommended steps**:
1. Fix the hierarchical structure (merge learning objectives into parent lessons)
2. Fill in missing descriptions and URLs
3. Then upload the cleaned + enhanced data

### Option C: Migrate to Keystatic (Best Long-Term)

Skip the Google Sheets upload entirely and migrate directly to Keystatic:
- Keystatic will validate data structure automatically
- Version control tracks all changes
- Better for collaboration with students
- See `.github/MIGRATION_TO_KEYSTATIC.md` for details

## Testing After Integration

After uploading, verify these work:

```bash
# 1. Data validation passes
node .github/scripts/validate-data.mjs

# 2. Site builds successfully
npm run build

# 3. Check links aren't broken
node .github/scripts/check-links.mjs

# 4. Verify slugs work
# Visit: https://your-site.com/lessons/building-community
```

## Regenerating the Merged File

If you need to re-merge after making changes:

```bash
# Run individual enhancement scripts first (if needed):
node scripts/generate-slugs.js
node scripts/standardize-languages.js
node scripts/migrate-depends-on.js

# Then merge everything:
node scripts/merge-enhanced-metadata.js
```

## What's Still Missing

These enhancements are only partially complete:

1. **Language standardization**: Only 6/198 done
   - Run: `node scripts/standardize-languages.js` on remaining lessons

2. **Subtopic assignments**: Only 30/198 done
   - See: `.github/SUBTOPIC_ASSIGNMENTS.md` for the remaining 26 lessons

3. **Dependencies**: Only 24/198 done
   - Many lessons don't have prerequisites defined

4. **Time estimates**: Only 53/198 done
   - Run: `node scripts/estimate-time-required.js` for remaining lessons

## Data Quality Issues

⚠️ **Important**: The merged CSV still contains all 197 data quality issues from the original Google Sheet.

See:
- `.github/DATA_QUALITY_ANALYSIS.md` - Overview and recommendations
- `.github/DATA_QUALITY_ISSUES.csv` - Row-by-row breakdown

**Root cause**: Hierarchical structure where learning objectives are separate rows instead of being part of the lesson.

**Recommendation**: Clean the data structure before or during Keystatic migration.

---

**Questions?** Check:
- `.github/MIGRATION_TO_KEYSTATIC.md` for migration guidance
- `.github/SUBTOPIC_ASSIGNMENTS.md` for subtopic vocabulary
- `.github/DATA_QUALITY_ANALYSIS.md` for quality issues
