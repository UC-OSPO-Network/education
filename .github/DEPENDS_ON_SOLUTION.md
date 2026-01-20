# "Depends On" Column - Standardization Proposal

**Problem**: The "Depends On" column uses sorting ID numbers (like "13—Intro to Git") which are unreliable and not machine-readable.

**Bioschemas Property**: `competencyRequired` - accepts text, defined terms, or URLs

---

## Current Problems

### 1. Inconsistent Formats

```
✗ "13—Intro to Git" (en dash)
✗ "13 - Introduction to Git" (hyphen)
✗ "13 – Introduction to Git" (different dash)
✗ "13 - Introduction to Git | 39 - Python Basics" (pipe separator)
✗ "Readers should already be familiar with OSS as a concept" (prose)
✗ Mix of lesson names vs. notes
```

### 2. Sorting IDs Are Unstable

- Sorting ID 13 could change if lessons are reordered
- Sorting IDs are not unique across pathways
- Numbers are not meaningful identifiers

### 3. Not Machine-Readable

Current format can't be:
- Parsed reliably
- Used to generate links
- Validated automatically
- Used for dependency graphs

---

## Bioschemas-Compliant Solutions

### Option 1: Use Slugs (Recommended)

**Format**: `slug:lesson-slug`

**Examples**:
```
introduction-to-git
python-basics
introduction-to-git, python-basics
```

**Pros**:
- ✅ Stable (won't change if reordered)
- ✅ URL-friendly
- ✅ Human-readable
- ✅ Machine-parseable
- ✅ Can generate links: `/lessons/introduction-to-git`

**Cons**:
- Need to generate slugs first (already done in issue #42)
- Need to maintain slug uniqueness (already planned)

---

### Option 2: Use @id URLs (Most Proper)

**Format**: Full Bioschemas @id URLs

**Examples**:
```
https://education.ucospo.net/lessons/introduction-to-git
https://education.ucospo.net/lessons/python-basics
```

**Pros**:
- ✅ Most Bioschemas-compliant
- ✅ Globally unique
- ✅ Can be clicked/resolved
- ✅ Unambiguous

**Cons**:
- ❌ Verbose (long URLs in spreadsheet)
- ❌ Harder to read/edit manually
- ❌ Domain dependency (if domain changes)

---

### Option 3: Use Lesson Names (Not Recommended)

**Format**: Exact lesson name

**Examples**:
```
Introduction to Git
Python Basics
```

**Pros**:
- ✅ Human-readable
- ✅ Matches existing partial usage

**Cons**:
- ❌ Names can change
- ❌ Names can be long
- ❌ Not guaranteed unique
- ❌ Harder to match programmatically (typos, case sensitivity)

---

## Recommended Approach: Slug-Based

### Use compact slug format with prefix for clarity:

**Format**:
```
lesson:slug-name
lesson:slug-1, lesson:slug-2
```

**Or simpler**:
```
slug-name
slug-1, slug-2
```

### Migration Examples

| Current | New (Slug-Based) |
|---------|------------------|
| `13—Intro to Git` | `introduction-to-git` |
| `13 - Introduction to Git \| 39 - Python Basics` | `introduction-to-git, python-basics` |
| `Strongly recommended: 2—Building Community` | `building-community` (move note elsewhere) |

---

## Implementation Plan

### Step 1: Generate Slug Reference Table

Create a mapping of Sorting ID → Slug → Lesson Name:

| Sorting ID | Slug | Lesson Name |
|------------|------|-------------|
| 1 | `building-community` | Building Community |
| 2 | `leadership-and-governance` | Leadership and Governance |
| 13 | `introduction-to-git` | Introduction to Git |
| 39 | `python-basics` | Python Basics |

### Step 2: Parse Current Dependencies

Extract all numeric references from "Depends On" column:
```
"13—Intro to Git" → [13]
"13 - Introduction to Git | 39 - Python Basics" → [13, 39]
```

### Step 3: Convert to Slugs

Replace numeric IDs with slugs:
```
[13] → ["introduction-to-git"]
[13, 39] → ["introduction-to-git", "python-basics"]
```

### Step 4: Handle Non-Numeric Dependencies

Current entries like:
- `"Readers should already be familiar with OSS as a concept"`
- `"Requires Python!"`
- `"This covers literally all of the same content..."`

**Solution**: Move these to a new column:

| Column | Purpose | Example |
|--------|---------|---------|
| `competencyRequired` | Formal prerequisites (lesson slugs) | `introduction-to-git, python-basics` |
| `Notes` or `Depends On Notes` | Informal requirements/recommendations | `Readers should be familiar with OSS concepts` |

---

## Proposed Schema Changes

### Current Columns
```
- Depends On: Mixed (IDs, names, notes, recommendations)
- competencyRequired: Mapped from "Depends On"
```

### Proposed Columns
```
- dependsOn: Lesson prerequisites (slugs only)
  Format: "slug-1, slug-2, slug-3"

- competencyRequired: Bioschemas property (generated from dependsOn)
  Format: URLs or text as needed

- prerequisiteNotes: Optional human-readable notes
  Example: "Intermediate Python experience helpful"
```

---

## Migration Script Pseudocode

```javascript
// 1. Build slug lookup table
const slugMap = {
  '1': 'building-community',
  '2': 'leadership-and-governance',
  '13': 'introduction-to-git',
  '39': 'python-basics',
  // ... all 56 lessons
};

// 2. Parse "Depends On" column
function parseDependsOn(dependsOn) {
  const numericRefs = [];
  const notes = [];

  // Extract patterns like "13—Intro" or "13 - Introduction"
  const pattern = /(\d+)\s*[—–-]\s*[^|,]+/g;
  const matches = dependsOn.matchAll(pattern);

  for (const match of matches) {
    numericRefs.push(match[1]);
  }

  // If no numbers found, treat as note
  if (numericRefs.length === 0) {
    notes.push(dependsOn);
  }

  // Convert numbers to slugs
  const slugs = numericRefs.map(id => slugMap[id]).filter(Boolean);

  return { slugs, notes };
}

// 3. Generate new format
for (const lesson of lessons) {
  const { slugs, notes } = parseDependsOn(lesson['Depends On']);

  lesson.dependsOn = slugs.join(', ');
  lesson.prerequisiteNotes = notes.join('; ');

  // For Bioschemas
  lesson.competencyRequired = slugs.map(slug =>
    `https://education.ucospo.net/lessons/${slug}`
  ).join(', ');
}
```

---

## Example Conversions

### Example 1: Simple Reference
**Before**:
```
Depends On: 13—Intro to Git
```

**After**:
```
dependsOn: introduction-to-git
competencyRequired: https://education.ucospo.net/lessons/introduction-to-git
prerequisiteNotes: (empty)
```

---

### Example 2: Multiple Dependencies
**Before**:
```
Depends On: 13 - Introduction to Git | 39 - Python Basics
```

**After**:
```
dependsOn: introduction-to-git, python-basics
competencyRequired: https://education.ucospo.net/lessons/introduction-to-git,
                   https://education.ucospo.net/lessons/python-basics
prerequisiteNotes: (empty)
```

---

### Example 3: Mixed Format with Notes
**Before**:
```
Depends On: Strongly recommended: 2—Building Community
```

**After**:
```
dependsOn: building-community
competencyRequired: https://education.ucospo.net/lessons/building-community
prerequisiteNotes: Strongly recommended
```

---

### Example 4: Prose Only
**Before**:
```
Depends On: Readers should already be familiar with OSS as a concept
```

**After**:
```
dependsOn: (empty)
competencyRequired: (empty) or "Familiarity with open source concepts"
prerequisiteNotes: Readers should already be familiar with OSS as a concept
```

---

## Validation Rules

After migration, validate:

1. **All slugs exist**: Each slug in `dependsOn` matches an actual lesson
2. **No circular dependencies**: Lesson A can't depend on B if B depends on A
3. **Consistent format**: All entries use comma-separated slugs
4. **No orphans**: Referenced lessons are in "Keep" status

---

## Benefits of Slug-Based System

### 1. Stable References
```
✅ Slugs don't change when lessons reordered
✅ Can reference lessons before they're assigned Sorting IDs
✅ Works across different pathways
```

### 2. Machine-Readable
```javascript
// Can generate dependency graph
const prerequisites = lesson.dependsOn.split(', ');
prerequisites.forEach(slug => {
  const prereqLesson = getLessonBySlug(slug);
  // Generate link, check completion, etc.
});
```

### 3. User-Friendly
```
✅ Can show "Prerequisites" section on lesson pages
✅ Can auto-link to prerequisite lessons
✅ Can show dependency graph visualization
✅ Can check if user has completed prerequisites
```

### 4. Bioschemas Compliant
```json
{
  "@type": "LearningResource",
  "name": "Making Good Pull Requests",
  "competencyRequired": [
    {
      "@type": "DefinedTerm",
      "name": "Introduction to Git",
      "@id": "https://education.ucospo.net/lessons/introduction-to-git"
    }
  ]
}
```

---

## Next Steps

1. **Create slug mapping table** (all 56 lessons)
2. **Write migration script** to convert current format
3. **Review converted data** for accuracy
4. **Update Google Sheet** with new `dependsOn` column
5. **Update content collections schema** to include `dependsOn`
6. **Implement UI** to show prerequisites on lesson pages

---

## Questions for Tim

1. **Approve slug-based approach?** Or prefer full URLs?
2. **Should we keep "Depends On Notes" separate?** Or merge into description?
3. **What about "Sorting ID"?** Still needed or can we rely on slugs?
4. **Timing**: Should this be part of Milestone 1 or 2?

---

**Recommendation**: Implement slug-based system in Milestone 1 (during migration to content collections) so the schema includes proper prerequisites from the start.
