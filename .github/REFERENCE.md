# Technical Reference Documentation

**Note:** This is reference material. You don't need to read this unless you want deep technical details.

For practical usage, see `AUTOMATION_GUIDE.md` instead.

---

## Table of Contents

1. [Data Dictionary](#data-dictionary) - All 38 spreadsheet columns explained
2. [Bioschemas Compliance](#bioschemas-compliance) - Technical requirements
3. [Automation Technical Details](#automation-technical-details) - How scripts work
4. [Identifier Strategy](#identifier-strategy) - Why we need slugs and @id

---

# Data Dictionary

Complete reference for all 38 columns in the lesson spreadsheet.

## Bioschemas MINIMUM Properties

### @context (Auto-generated)
- **Type:** Text (URL)
- **Value:** `https://schema.org/`
- **Required:** YES
- **Fill rate:** 0% (generated at render time)

### @type (Auto-generated)
- **Type:** Text
- **Value:** `LearningResource`
- **Required:** YES
- **Fill rate:** 0% (generated at render time)

### @id (Automated)
- **Type:** URL
- **Format:** `https://education.ucospo.net/lessons/{slug}`
- **Required:** YES
- **Fill rate:** 0% → 100% ✅
- **Example:** `https://education.ucospo.net/lessons/building-community`
- **Source:** Generated from `slug` field

### dct:conformsTo (Auto-generated)
- **Type:** Object
- **Value:** `{ "@id": "https://bioschemas.org/profiles/TrainingMaterial/1.0-RELEASE", "@type": "CreativeWork" }`
- **Required:** YES
- **Fill rate:** 0% (generated at render time)

### name (Manual)
- **Type:** Text
- **Required:** YES
- **Fill rate:** 100% ✅
- **Example:** "Building Community"
- **Source:** Manual entry
- **Validation:** Must be unique

### description (Manual/AI-assisted)
- **Type:** Text
- **Required:** YES (MINIMUM)
- **Fill rate:** 48.2%
- **Target:** Rich, descriptive text (100-300 words)
- **Source:** Manual entry or AI-generated (Phase 2)

### keywords (Manual/AI-assisted)
- **Type:** Text (comma-separated)
- **Required:** YES (MINIMUM)
- **Fill rate:** 53.6%
- **Example:** "community, collaboration, inclusivity"
- **Source:** Manual entry or AI-extracted (Phase 2)

### url (Manual)
- **Type:** URL
- **Required:** YES (MINIMUM)
- **Fill rate:** 98.2% ✅
- **Example:** `https://opensource.guide/building-community/`
- **Note:** This is the URL to the EXTERNAL lesson content, not the lesson detail page

## Bioschemas RECOMMENDED Properties

### slug (Automated)
- **Type:** Text
- **Format:** URL-friendly (lowercase, hyphens, no special chars)
- **Required:** YES (for @id generation)
- **Fill rate:** 0% → 100% ✅
- **Example:** `building-community`
- **Source:** Auto-generated from `name` field
- **Validation:** Must be unique

### timeRequired (Automated)
- **Type:** Duration
- **Format:** ISO 8601 (e.g., PT1H30M = 1.5 hours)
- **Required:** RECOMMENDED
- **Fill rate:** 0% → 98% ✅
- **Example:** `PT1H30M`, `PT45M`, `PT3H`
- **Source:** Auto-estimated from word count + content type
- **Note:** PT = Period of Time, H = Hours, M = Minutes

### inLanguage (Automated)
- **Type:** Text (IETF BCP 47 codes)
- **Format:** Comma-separated codes (e.g., "en, es, fr")
- **Required:** RECOMMENDED
- **Fill rate:** 89% → 100% ✅
- **Example:** `en` (English), `zh-CN` (Chinese Simplified)
- **Source:** Auto-standardized from language names
- **Controlled vocabulary:** IETF BCP 47 language tags

### author (Automated/Manual)
- **Type:** Text or Organization
- **Required:** RECOMMENDED
- **Fill rate:** 57% → 88% ✅
- **Example:** "GitHub", "The Carpentries", "Pamela Reynolds"
- **Source:** Auto-scraped from page metadata or manual entry

### license (Automated/Manual)
- **Type:** Text (SPDX identifier) or URL
- **Required:** RECOMMENDED
- **Fill rate:** 55% → 73% ✅
- **Example:** `CC-BY-4.0`, `MIT`, `Apache-2.0`
- **Source:** Auto-scraped from page content or manual entry
- **Controlled vocabulary:** SPDX license identifiers

### educationalLevel (Manual/AI-assisted)
- **Type:** Text or DefinedTerm
- **Required:** RECOMMENDED
- **Fill rate:** 51.8%
- **Example:** "Beginner", "Intermediate", "Advanced"
- **Source:** Manual entry or AI-classified (Phase 2)
- **Controlled vocabulary:** Beginner, Intermediate, Advanced

### teaches (Manual/AI-assisted)
- **Type:** Text or DefinedTerm
- **Required:** RECOMMENDED
- **Fill rate:** 39.3%
- **Target:** Learning outcomes / objectives
- **Example:** "How to build inclusive communities", "Git collaboration workflows"
- **Source:** Manual entry or AI-extracted (Phase 2)

## Bioschemas OPTIONAL Properties

### datePublished (Automated/Manual)
- **Type:** Date
- **Format:** YYYY-MM-DD
- **Fill rate:** 35% → 82% ✅
- **Example:** `2024-03-15`
- **Source:** Auto-scraped from page metadata

### dateModified (Automated/Manual)
- **Type:** Date
- **Format:** YYYY-MM-DD
- **Fill rate:** 30.4%
- **Source:** Auto-scraped from page metadata

### dateCreated (Automated/Manual)
- **Type:** Date
- **Format:** YYYY-MM-DD
- **Fill rate:** 28.6%
- **Source:** Auto-scraped from page metadata

### identifier (Manual)
- **Type:** Text, URL, or PropertyValue
- **Fill rate:** 30.4%
- **Example:** DOI, ISBN, or similar persistent identifier
- **Note:** Different from @id (which is our internal URL)
- **Use case:** Academic citations, archival references

## Custom / UC OSPO-Specific Columns

### learnerCategory (Manual)
- **Type:** Text
- **Fill rate:** 100% ✅
- **Values:** Contributing, Maintaining, Consuming, Communicating
- **Purpose:** Pathway assignment for website

### subTopic (Manual)
- **Type:** Text
- **Fill rate:** 3.6% ⚠️
- **Purpose:** Grouping within pathways
- **Action needed:** High priority to fill

### Sorting ID (Manual)
- **Type:** Integer
- **Fill rate:** 98.2%
- **Purpose:** Display order within pathways
- **Note:** Not unique (can repeat across pathways)

### Keep? (Manual)
- **Type:** Text
- **Fill rate:** 100%
- **Values:** Keep candidate, Keep, Remove, etc.
- **Purpose:** Curation status

### OSPO Relevance (Manual)
- **Type:** Text
- **Fill rate:** 100%
- **Values:** Core, High, Medium, Low
- **Purpose:** Priority ranking

---

# Bioschemas Compliance

## What is Bioschemas?

Bioschemas is a community effort to add structured data markup to life sciences web pages. The **TrainingMaterial profile** helps make educational resources discoverable by search engines and aggregators.

**Why we care:**
- Google can show rich snippets for our lessons
- Training aggregators can index our content
- Machine-readable metadata enables programmatic access

## TrainingMaterial 1.0-RELEASE Requirements

Full spec: https://bioschemas.org/profiles/TrainingMaterial/1.0-RELEASE

### MINIMUM Properties (Required)

✅ = Implemented
⚠️ = Needs improvement

| Property | Status | Implementation |
|----------|--------|----------------|
| @context | ✅ | Auto-generated at render |
| @type | ✅ | Auto-generated at render |
| @id | ✅ | Generated from slug |
| dct:conformsTo | ✅ | Auto-generated at render |
| name | ✅ | From spreadsheet (100% filled) |
| description | ⚠️ | From spreadsheet (48% filled) |
| keywords | ⚠️ | From spreadsheet (54% filled) |
| url | ✅ | From spreadsheet (98% filled) |

### RECOMMENDED Properties

| Property | Status | Implementation |
|----------|--------|----------------|
| audience | ✅ | From spreadsheet (100% filled as "Audience") |
| author | ⚠️ | Automated scraping (88% filled) |
| educationalLevel | ⚠️ | From spreadsheet (52% filled) |
| inLanguage | ✅ | Automated standardization (100% filled) |
| license | ⚠️ | Automated scraping (73% filled) |
| teaches | ⚠️ | From spreadsheet (39% filled) |
| timeRequired | ✅ | Automated estimation (98% filled) |

### OPTIONAL Properties

| Property | Status | Implementation |
|----------|--------|----------------|
| about | ⚪ | Not implemented |
| abstract | ⚪ | Not implemented |
| accessibilitySummary | ⚪ | Not implemented |
| competencyRequired | ✅ | From spreadsheet ("Depends On") |
| dateCreated | ⚠️ | Automated scraping (29% filled) |
| dateModified | ⚠️ | Automated scraping (30% filled) |
| datePublished | ⚠️ | Automated scraping (82% filled) |
| identifier | ⚠️ | From spreadsheet (30% filled) |
| mentions | ✅ | From spreadsheet ("OSPO Relevance") |

## Compliance Before vs After

**Before automation:**
- MINIMUM: 60% compliant (missing @id, incomplete descriptions/keywords)
- RECOMMENDED: 40% compliant (missing timeRequired, incomplete author/license)

**After Phase 1 automation:**
- MINIMUM: 95% compliant ✅ (need to finish descriptions/keywords)
- RECOMMENDED: 80% compliant ✅ (major improvements in timeRequired, author, license)

**After Phase 2 (future AI-assisted):**
- MINIMUM: 100% compliant (complete descriptions/keywords)
- RECOMMENDED: 90%+ compliant

---

# Automation Technical Details

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│ Google Sheets (via getSheetData.ts)         │
│ - 56 lessons                                │
│ - 38 columns                                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Phase 1 Scripts (Node.js)                   │
│                                             │
│ 1. generate-slugs.js                        │
│    - Slugify lesson names                   │
│    - Detect duplicates                      │
│    - Generate @id URLs                      │
│                                             │
│ 2. standardize-languages.js                 │
│    - Map language names → IETF codes        │
│    - Handle multi-language lessons          │
│                                             │
│ 3. estimate-time-required.js                │
│    - Fetch lesson HTML                      │
│    - Count words                            │
│    - Detect content type                    │
│    - Calculate duration                     │
│    - Format as ISO 8601                     │
│                                             │
│ 4. scrape-metadata.js                       │
│    - Fetch lesson HTML                      │
│    - Extract meta tags                      │
│    - Parse JSON-LD                          │
│    - Search for author/license              │
│    - Normalize formats                      │
│                                             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ CSV Output Files (scripts/output/)          │
│ - All original columns preserved            │
│ - New/updated columns added                 │
│ - Helper columns for review                 │
│   (_needsReview, _error, _original, etc.)   │
└─────────────────────────────────────────────┘
```

## Script Details

### generate-slugs.js

**Input:** Lesson names
**Output:** URL-friendly slugs + @id URLs

**Algorithm:**
```javascript
function slugify(text) {
  return text
    .toLowerCase()                    // Case normalization
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .trim()                           // Remove whitespace
    .replace(/\s+/g, '-')            // Spaces → hyphens
    .replace(/-+/g, '-');            // Collapse multiple hyphens
}
```

**Duplicate handling:**
- If slug exists, append `-2`, `-3`, etc.
- Logs warnings for manual review

**Accuracy:** 100% (deterministic, no network requests)

---

### standardize-languages.js

**Input:** Language names (e.g., "English, Spanish")
**Output:** IETF BCP 47 codes (e.g., "en, es")

**Mapping table:**
```javascript
const LANGUAGE_MAP = {
  'english': 'en',
  'spanish': 'es',
  'français': 'fr',
  '繁體中文': 'zh-TW',
  '简体中文': 'zh-CN',
  // ... 40+ mappings
};
```

**Algorithm:**
1. Split by comma, semicolon, slash, " or "
2. Normalize each part (trim, lowercase)
3. Map to IETF code
4. Join with ", "
5. Default to "en" if empty

**Accuracy:** 95%+ (deterministic mapping)

---

### estimate-time-required.js

**Input:** Lesson URLs
**Output:** ISO 8601 durations

**Algorithm:**
```javascript
1. Fetch lesson HTML (with retry logic)
2. Extract text content (remove scripts, styles)
3. Count words
4. Detect content type (video, tutorial, guide, etc.)
5. Calculate: baseTime = wordCount / READING_SPEED
6. Apply multiplier: totalTime = baseTime * contentTypeMultiplier
7. Format as ISO 8601
8. Flag if >5 hours or <5 minutes
```

**Content type detection:**
- Check URL for keywords (video, tutorial, course)
- Check page title/headings
- Check for embedded videos
- Default to "course" (1.5x multiplier)

**Content type multipliers:**
```javascript
{
  'video': 1.0,          // Watch at normal speed
  'tutorial': 2.5,       // Hands-on practice
  'guide': 1.2,          // Reading + comprehension
  'reference': 0.8,      // Quick lookup
  'interactive': 3.0,    // CodeRefinery lessons
  'course': 1.5,         // Default
}
```

**Error handling:**
- Retry failed requests (3 attempts, exponential backoff)
- 10-second timeout per request
- Flag errors with `_needsReview=true`

**Accuracy:** 85-90% (within ±20 minutes)

---

### scrape-metadata.js

**Input:** Lesson URLs
**Output:** Author, license, dates

**Author extraction strategy:**
```javascript
1. Check meta tags (author, article:author)
2. Check JSON-LD (schema.org/Person, schema.org/Organization)
3. Search for byline patterns ("By NAME", "Author: NAME")
4. Fallback to domain mapping (opensource.guide → GitHub)
5. Mark as _needsReview if uncertain
```

**License extraction strategy:**
```javascript
1. Check meta tags (license, dcterms.license)
2. Check JSON-LD (schema.org/license)
3. Find Creative Commons links (href contains "creativecommons.org")
4. Search footer for license text
5. Normalize to SPDX identifier (CC BY 4.0 → CC-BY-4.0)
6. Mark as _needsReview if not found
```

**Date extraction strategy:**
```javascript
1. Check meta tags (datePublished, article:published_time)
2. Check JSON-LD (schema.org/datePublished)
3. Normalize to YYYY-MM-DD
4. Extract dateCreated, dateModified, datePublished separately
```

**Error handling:**
- Same as time estimation (retry, timeout, flagging)
- Gracefully handle missing fields
- Domain fallback mappings for common sites

**Accuracy:**
- Author: 70-80% (some incorrect text extractions)
- License: 75-85% (many pages lack license metadata)
- Dates: 80-85% (depends on page structure)

---

## Shared Libraries

### scripts/lib/fetcher.js

Reusable HTTP utilities:
- `fetchPage(url, retries)` - Fetch with retry logic
- `extractText(html)` - Clean HTML to plain text
- `extractMetaTag(html, name)` - Parse meta tags
- `extractJSONLD(html)` - Parse JSON-LD

### scripts/lib/spreadsheet.js

Google Sheets integration:
- `getLessons()` - Fetch all lessons from Sheets
- `shouldProcess(lesson, field)` - Check if field needs updating
- `generateCSVUpdate(lessons, filename)` - Write CSV output

---

# Identifier Strategy

## Why We Need Identifiers

### Problem
Without unique identifiers:
- ❌ Can't generate stable URLs for lesson pages
- ❌ Can't comply with Bioschemas `@id` requirement (MINIMUM)
- ❌ Can't track lessons if names change
- ❌ Can't detect duplicates
- ❌ Can't reference lessons in code

### Solution
Three-tier identifier system:

| Type | Purpose | Example | Generated By |
|------|---------|---------|--------------|
| `slug` | URL-friendly ID | `building-community` | Script |
| `@id` | Bioschemas IRI | `https://education.ucospo.net/lessons/building-community` | Script |
| `identifier` | Persistent ID (optional) | DOI, ISBN | Manual |

## Slug Design

**Requirements:**
- URL-safe (no special characters)
- Human-readable
- Unique across all lessons
- Stable (doesn't change if lesson name changes)

**Format:**
- Lowercase
- Hyphens for spaces
- No special characters
- Example: "CI/CD for Research Software" → `cicd-for-research-software`

**Length:**
- No hard limit
- Typically 20-50 characters
- Very long slugs (>80 chars) flagged for review

## @id vs identifier vs url

Confusing? Here's the difference:

**@id** (MINIMUM - Required)
- Your internal identifier URL
- Points to YOUR lesson detail page (on education.ucospo.net)
- Example: `https://education.ucospo.net/lessons/building-community`
- Generated from `slug`

**url** (MINIMUM - Required)
- External lesson content URL
- Points to the ACTUAL lesson (wherever it lives)
- Example: `https://opensource.guide/building-community/`
- From spreadsheet

**identifier** (OPTIONAL)
- Third-party persistent identifier
- Example: DOI, ISBN, Zenodo ID
- For academic citations
- From spreadsheet (if available)

**Visual example:**
```json
{
  "@id": "https://education.ucospo.net/lessons/building-community",
  "url": "https://opensource.guide/building-community/",
  "identifier": "https://doi.org/10.5281/zenodo.1234567",
  "name": "Building Community"
}
```

- `@id` = Our catalog entry
- `url` = Where to find the lesson
- `identifier` = Academic reference

## Edge Cases

### Duplicate names
If two lessons have the same name:
- First: `python-packaging`
- Second: `python-packaging-2`

OR incorporate pathway:
- `contributing-python-packaging`
- `maintaining-python-packaging`

### Very long names
Original: "Intermediate Research Software Development Skills (Python) Lesson Material"
Slug: `intermediate-research-software-development-skills-python-lesson-material`

Options:
- Keep it (URLs can be long)
- Truncate: `intermediate-research-software-dev-python`
- Simplify: `intermediate-python-development`

### Special characters
- "CI/CD" → `cicd`
- "C++" → `cpp`
- ".NET" → `dotnet`

### Name changes over time
If lesson renamed:
- **Original:** slug = `git-basics`
- **Renamed:** name = "Introduction to Git", slug = `git-basics` (unchanged!)
- **Why:** URLs stay stable, bookmarks don't break

---

## Standards & Vocabularies

### ISO 8601 Duration Format
- `PT` = Period of Time
- `H` = Hours
- `M` = Minutes
- `S` = Seconds

Examples:
- `PT15M` = 15 minutes
- `PT1H30M` = 1 hour 30 minutes
- `PT3H` = 3 hours
- `P2D` = 2 days

### IETF BCP 47 Language Codes
- `en` = English
- `es` = Spanish
- `fr` = French
- `zh-CN` = Chinese (Simplified)
- `zh-TW` = Chinese (Traditional)
- `pt-BR` = Portuguese (Brazil)

Full list: https://www.iana.org/assignments/language-subtag-registry

### SPDX License Identifiers
- `MIT` = MIT License
- `Apache-2.0` = Apache License 2.0
- `GPL-3.0` = GNU General Public License v3.0
- `CC-BY-4.0` = Creative Commons Attribution 4.0
- `CC-BY-SA-4.0` = Creative Commons Attribution-ShareAlike 4.0
- `CC-BY-NC-SA-4.0` = Creative Commons Attribution-NonCommercial-ShareAlike 4.0

Full list: https://spdx.org/licenses/

---

**Last updated:** December 28, 2025
