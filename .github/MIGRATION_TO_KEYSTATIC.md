# Migration Plan: Google Sheets → Keystatic + Content Collections

## Current Architecture (Problems)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT WORKFLOW                             │
└─────────────────────────────────────────────────────────────────┘

   1. Edit Content                    2. Publish                3. Build
┌─────────────────┐              ┌──────────────┐         ┌──────────────┐
│  Google Sheets  │              │   CSV URL    │         │ Astro Build  │
│                 │──Manually──▶ │  (Public)    │────────▶│              │
│  56 lessons     │   Publish    │              │  Fetch  │ getSheetData │
│  Metadata       │              │              │         │              │
└─────────────────┘              └──────────────┘         └──────────────┘
        │                                                         │
        │                                                         ▼
        │                                                  ┌──────────────┐
        │                                                  │   Website    │
        │                                                  │  Deployed    │
        │                                                  └──────────────┘
        │
        └──────▶ Round-trip edits (manual sync)
```

## Problems with Current Architecture

### 1. **No Version Control**
- ❌ Changes to lesson metadata are not tracked in Git
- ❌ No ability to review changes before they go live
- ❌ Can't roll back to previous versions
- ❌ No audit trail of who changed what

### 2. **No Code Review Process**
- ❌ Students/contributors can't submit pull requests for lesson updates
- ❌ No collaborative editing workflow
- ❌ Changes go live immediately without review

### 3. **Build-Time Data Fetching Issues**
- ❌ Website rebuilds require fetching from Google Sheets API
- ❌ Build failures if Google Sheets is slow/down
- ❌ No local development without internet
- ❌ Adds latency to build process

### 4. **Round-Tripping Problems**
- ❌ Automated scripts output CSVs that must be manually imported back to Sheets
- ❌ Risk of data loss during copy-paste operations
- ❌ No single source of truth (is it Sheets or the CSV outputs?)

### 5. **Limited Content Editing Experience**
- ❌ Google Sheets is not designed for content editing
- ❌ No rich text support
- ❌ No preview of how content will look on site
- ❌ Difficult to manage long-form content

### 6. **Schema Validation**
- ❌ No automated validation that lessons have required fields
- ❌ Easy to introduce data quality issues
- ❌ TypeScript types don't match data structure

---

## Proposed Architecture (Keystatic + Singletons)

```
┌─────────────────────────────────────────────────────────────────┐
│                   NEW WORKFLOW (KEYSTATIC)                       │
└─────────────────────────────────────────────────────────────────┘

   1. Edit Content                2. Commit to Git           3. Build
┌─────────────────┐          ┌──────────────────┐      ┌──────────────┐
│   Keystatic     │          │   Git Repository │      │ Astro Build  │
│   CMS UI        │          │                  │      │              │
│  /keystatic     │─────────▶│  src/content/    │─────▶│ Content      │
│                 │   Save   │    lessons/      │      │ Collections  │
│  Rich editor    │          │    lesson-1.json │      │              │
└─────────────────┘          │    lesson-2.json │      └──────────────┘
        │                    │    ...           │             │
        │                    └──────────────────┘             │
        │                            │                        ▼
        ▼                            │                 ┌──────────────┐
┌─────────────────┐                 │                 │   Website    │
│  Local Preview  │                 │                 │  Deployed    │
│  See changes    │                 │                 └──────────────┘
└─────────────────┘                 │
                                    │
                                    ▼
                            ┌──────────────────┐
                            │  Pull Requests   │
                            │  Code Review     │
                            │  CI/CD Checks    │
                            └──────────────────┘
```

### Content Structure: Singleton Pattern

```
src/content/
├── config.ts                    # Define lesson schema
└── lessons/                     # Each lesson = 1 file
    ├── building-community.json
    ├── leadership-governance.json
    ├── social-coding.json
    ├── writing-documentation.json
    └── ... (56 total)
```

Each lesson file contains full metadata:
```json
{
  "name": "Building Community",
  "slug": "building-community",
  "description": "Learn how to foster collaboration and inclusivity.",
  "url": "https://opensource.guide/building-community/",
  "learnerCategory": "Building Community",
  "educationalLevel": "Intermediate",
  "ossRole": "Community Manager",
  "subTopic": "Collaboration",
  "timeRequired": "PT2H",
  "keywords": ["community", "collaboration", "inclusivity"],
  "author": "GitHub",
  "license": "CC-BY-4.0"
}
```

---

## Benefits of New Architecture

### 1. ✅ **Full Git Version Control**
- Every lesson edit is a Git commit
- Complete history of all changes
- Easy rollback to any previous version
- Clear attribution of who changed what

### 2. ✅ **Pull Request Workflow**
- Students can submit PRs to add/edit lessons
- Instructors review changes before merge
- CI/CD runs validation on PRs
- Collaborative editing with review process

### 3. ✅ **Better Developer Experience**
- Work offline with local content
- Fast builds (no external API calls)
- TypeScript validation of lesson schema
- Better IDE support and autocomplete

### 4. ✅ **Content Editor Friendly**
- Keystatic provides user-friendly CMS UI
- Rich text editing support
- Preview content changes before committing
- No need to touch JSON directly (for non-technical users)

### 5. ✅ **Single Source of Truth**
- Git repository is the authoritative source
- No round-tripping between systems
- Automated scripts can directly edit lesson files
- No manual copy-paste operations

### 6. ✅ **Schema Validation**
- Astro content collections enforce schema
- TypeScript types match actual data structure
- Build fails if lesson data is invalid
- Catch errors before deployment

### 7. ✅ **CI/CD Integration**
- PR checks run automatically
- Validate lesson metadata
- Check for required fields
- Test builds before merge

---

## Migration Steps

### Phase 1: Setup Infrastructure (Week 1)
1. Install and configure Keystatic
2. Set up Astro content collections
3. Define lesson schema in `src/content/config.ts`
4. Configure Keystatic to use singletons

### Phase 2: Data Migration (Week 1-2)
1. Export current Google Sheets data
2. Write migration script to convert CSV → JSON singletons
3. Create individual lesson files in `src/content/lessons/`
4. Validate all migrated data

### Phase 3: Update Application Code (Week 2)
1. Replace `getSheetData()` with Astro content collections
2. Update `lessons.astro` to query from content collections
3. Update pathway pages to use new data source
4. Test all pages and functionality

### Phase 4: Deployment & Documentation (Week 2)
1. Update STUDENT_README with new workflow
2. Document Keystatic usage
3. Deploy to production
4. Archive Google Sheets (keep as backup)

---

## Technical Implementation

### 1. Install Dependencies

```bash
npm install @keystatic/core @keystatic/astro
npm install @astrojs/markdoc  # For rich content if needed
```

### 2. Create Content Schema

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const lessons = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    url: z.string().url(),
    learnerCategory: z.string(),
    educationalLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    ossRole: z.string().optional(),
    subTopic: z.string().optional(),
    timeRequired: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    author: z.string().optional(),
    license: z.string().optional(),
    inLanguage: z.array(z.string()).optional(),
  }),
});

export const collections = { lessons };
```

### 3. Configure Keystatic

```typescript
// keystatic.config.ts
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'UC-OSPO-Network/education',
  },
  collections: {
    lessons: collection({
      label: 'Lessons',
      slugField: 'slug',
      path: 'src/content/lessons/*',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Lesson Name' }),
        slug: fields.text({ label: 'URL Slug' }),
        description: fields.text({ label: 'Description', multiline: true }),
        url: fields.url({ label: 'External Lesson URL' }),
        learnerCategory: fields.select({
          label: 'Pathway',
          options: [
            { label: 'Getting Started', value: 'Getting Started with Open Source' },
            { label: 'Contributing', value: 'Contributing to a Project' },
            // ... other pathways
          ],
        }),
        educationalLevel: fields.select({
          label: 'Skill Level',
          options: [
            { label: 'Beginner', value: 'Beginner' },
            { label: 'Intermediate', value: 'Intermediate' },
            { label: 'Advanced', value: 'Advanced' },
          ],
        }),
        // ... other fields
      },
    }),
  },
});
```

### 4. Update Data Fetching

```typescript
// Before: src/pages/lessons.astro
import { getSheetData } from '../lib/getSheetData.js';
const lessons = await getSheetData();

// After: src/pages/lessons.astro
import { getCollection } from 'astro:content';
const lessonEntries = await getCollection('lessons');
const lessons = lessonEntries.map(entry => ({
  slug: entry.id,
  ...entry.data
}));
```

---

## Student Tasks

Once infrastructure is set up, students can:

1. **Add new lessons** via Keystatic UI or by creating JSON files
2. **Edit lesson metadata** through pull requests
3. **Improve data quality** by filling in missing fields
4. **Build new features** using content collections API
5. **Validate data** by adding schema constraints

---

## References

- [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/)
- [Keystatic Documentation](https://keystatic.com/docs)
- [Content Collections Guide](https://docs.astro.build/en/guides/content-collections/)
- UCLA IMLS Open Science project (reference implementation)
