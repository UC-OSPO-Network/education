# Lesson Record Schema Reference

Internal reference for curators and contributors. Describes every field in the lesson JSON schema, including purpose, controlled vocabulary, and fill-in guidance.

## Quick reference

| Field | Required | Type | Controlled vocab? |
|---|---|---|---|
| `name` | yes | string | no |
| `slug` | yes | string | no |
| `keepStatus` | yes | enum | yes |
| `description` | yes | string | no |
| `url` | yes | URL | no |
| `repoUrl` | recommended | URL | no |
| `domain` | yes | enum | yes |
| `topic` | yes | string | loose |
| `subTopic` | recommended | string | loose |
| `pathways` | yes | string[] | yes (pathway slugs) |
| `educationalLevel` | yes | enum | yes |
| `learningResourceType` | yes | enum | yes |
| `author` | yes | string | no |
| `provider` | yes | string | no |
| `license` | yes | URL | no |
| `roles` | yes | string[] | loose |
| `timeRequired` | yes | ISO 8601 duration | no |
| `inLanguage` | yes | string[] | BCP 47 |
| `keywords` | yes | string[] | no |
| `prerequisites` | yes | object[] | see below |
| `prerequisiteNotes` | optional | string | no |
| `sortingId` | yes | string | no |
| `learningObjectives` | yes | string | no |
| `ospoRelevance` | yes | string | no |
| `abstract` | yes | string | no |
| `dateCreated` | yes | date | no |
| `dateModified` | yes | date | no |
| `datePublished` | yes | date | no |
| `creativeWorkStatus` | yes | enum | yes |
| `audience` | recommended | string | no |
| `competencyRequired` | recommended | string | no |
| `teaches` | recommended | string | no |

---

## Fields

### Identity

**`name`** (string, required)
Full title of the lesson as published. Copy verbatim from the lesson page — do not normalize capitalization.

**`slug`** (string, required)
URL-safe identifier, auto-derived from the filename. Must match the JSON filename (without `.json`). Use lowercase kebab-case. Example: `introduction-to-git`.

**`keepStatus`** (enum, required)
Inventory decision. Values:
* `keep` — confirmed inclusion in the published catalog
* `keepCandidate` — under review; may be promoted or dropped
* `drop` — excluded; record retained for back-compat but not surfaced to users

All published lessons are `keep`. Do not change this field without a committee decision.

---

### Access

**`url`** (URL, required)
Learner-facing URL — the page a learner visits to start the lesson. Must be a working HTTPS URL. For Carpentries Workbench lessons, this is the rendered site, not the GitHub source.

**`repoUrl`** (URL, recommended)
Source repository URL (GitHub/GitLab). Used for health signals and linking to the edit history. Leave empty if no public repo exists.

---

### Classification

**`domain`** (enum, required)
Broad subject area. Values:
* `Research Software` — software development practices in research contexts
* `Data Science` — data analysis, visualization, statistical methods
* `Institutional Policy` — policy, compliance, governance
* `GIS` — geospatial methods and tools
* `General Open Source` — open source practices not specific to research

**`topic`** (string, required)
More specific subject within the domain. Not a controlled vocabulary — use consistent strings across related lessons (e.g., "Version Control", "Licensing", "Community Management"). Check existing records before coining a new value.

**`subTopic`** (string, recommended)
Further refinement within the topic. Follow the same consistency rule as `topic`.

**`pathways`** (string[], required)
Which learning pathways this lesson belongs to. Must match pathway slugs exactly. Current values:
* `getting-started` — Getting Started with Open Source
* `contributing` — Contributing to a Project
* `maintaining` — Maintaining & Sustaining Software
* `building-communities` — Building Inclusive Communities
* `licensing` — Understanding Licensing & Compliance
* `strategic` — Strategic Practices & Career Development

A lesson may appear in more than one pathway. Most lessons belong to one.

**`educationalLevel`** (enum, required)
Assumed prior knowledge level. Values:
* `Beginner` — no prior experience with the topic required
* `Intermediate` — some familiarity with the domain assumed (e.g., has used Git before)
* `Advanced` — requires substantial prior knowledge or experience

Calibrate against the lesson's actual prerequisites, not the provider's self-reported level, which is often optimistic.

**`learningResourceType`** (enum, required)
Format and scope of the resource. Active vocabulary (three values):
* `workshop` — instructor-led, structured, self-contained, up to 4 hours. Has exercises and clear learning objectives. Typical Carpentries or INTERSECT lesson. This is the default.
* `course` — multi-day or multi-module sequence, more than 4 hours total. Often has its own syllabus. Examples: full Software Carpentry curriculum, 8-module certificate programs.
* `guide` — reference material, handbook chapters, or curated reading. Not instructor-led. Learner navigates at their own pace. Examples: The Turing Way chapters, OSG Open Source Guides.

Legacy values (`tutorial`, `handout`, `presentation`, `video lecture`, etc.) remain in the schema for back-compat with drop-status records. Do not assign them to new or promoted lessons.

**Threshold rule**: if `timeRequired` exceeds PT4H0M and the lesson is a structured sequence, use `course`. Otherwise use `workshop`. If there is no instructor-led structure, use `guide`.

**`roles`** (string[], required)
OSS roles this lesson is relevant to. Loose controlled vocabulary — use consistent capitalization. Common values: `Contributor`, `Maintainer`, `Community Manager`, `Research Software Engineer`, `Researcher`, `Librarian`. A lesson may list multiple roles.

---

### Authorship

**`author`** (string, required)
Name(s) of the lesson author(s). Use the form shown on the lesson page. For organizations, use the organization name. Multiple authors: comma-separated.

**`provider`** (string, required)
Organization that hosts or publishes the lesson. Examples: `The Carpentries`, `INTERSECT`, `CodeRefinery`, `The Turing Way`, `UC OSPO Network`. Different from `author` — a university researcher can author a lesson hosted by The Carpentries.

**`license`** (URL, required)
Full URL to the license. For Creative Commons: use canonical HTTPS URLs (e.g., `https://creativecommons.org/licenses/by/4.0/`). For code licenses: link to the LICENSE file in the repo or spdx.org. Do not leave blank for keep-status lessons.

---

### Instructional metadata

**`timeRequired`** (ISO 8601 duration, required)
How long the lesson takes. Format: `PT` followed by hours and minutes, e.g., `PT2H30M`, `PT45M`, `PT1H`. For durations under one hour, omit the H component: `PT45M` not `PT0H45M`.

Sources of truth by provider:
* **Carpentries Workbench** — check `/instructor/index.html` on the rendered lesson site (timing callouts at top)
* **CodeRefinery** — check `/guide/` page (summary table)
* **INTERSECT** — check `/instructor/index.html` on the rendered lesson site
* **Turing Way** — set `PT1H` as a representative sub-chapter read time; add sub-chapter breakdown to `notes`
* **OSG Guides** — word count ÷ 200 wpm (round up); annotate in `notes`
* **MolSSI** — no published schedule; estimate from module count; annotate uncertainty in `notes`

**`inLanguage`** (string[], required)
BCP 47 language codes. Most lessons: `["en"]`. For multilingual lessons, list all languages.

**`learningObjectives`** (string, required)
Structured objectives in the form "After this lesson, the learner should be able to: [bulleted list of verb-noun outcomes]". Use Bloom's taxonomy verbs. Pull from the lesson's own stated objectives when available.

**`abstract`** (string, required)
2–4 sentence summary of the lesson content and target audience. Distinct from `description` — `abstract` is longer and more detailed; `description` is the short card text shown in the UI.

**`description`** (string, required)
1–2 sentence summary shown on lesson cards. Keep under 200 characters. This is what learners see before clicking through.

**`teaches`** (string, recommended)
One sentence completing "After this lesson you will be able to…". This is the headline skill — more specific than `learningObjectives`, less detailed. Maps to schema.org `teaches`.

**`competencyRequired`** (string, recommended)
Comma-separated list of assumed competencies. Plain English — not formal ontology. Example: `"Git, Python basics, command line"`. Complements `prerequisites` (which links to specific lessons); this field names skills that may have been acquired outside the catalog.

**`audience`** (string, recommended)
Comma-separated list of intended audiences. Example: `"Graduate Students, Research Software Engineers, Librarians"`.

**`keywords`** (string[], required)
3–8 terms used for search and discovery. Include technology names, method names, and topic names. No duplicates of `name` or `teaches`.

---

### Prerequisites

**`prerequisites`** (object[], required)
Structured list of prerequisites. Each item has:
* `type`: `"lesson"` (link to a lesson in this catalog by slug) | `"url"` (external link) | `"text"` (free-text description)
* `value`: the slug, URL, or text string
* `label`: (optional) display text for `url` and `text` types

Example:
```json
"prerequisites": [
  { "type": "lesson", "value": "introduction-to-git" },
  { "type": "text", "value": "Basic familiarity with the command line" }
]
```

**`prerequisiteNotes`** (string, optional)
Free-text context about prerequisites — for curators, not displayed to learners. Use to note soft vs. hard requirements, or to flag uncertainty about what's truly needed.

---

### Dates and status

**`dateCreated`** (date string, required)
Date the lesson was first created in ISO 8601 format: `YYYY-MM-DD`. Use the earliest date from the lesson's git history or metadata if available.

**`dateModified`** (date string, required)
Date of the most recent substantial update. Check the repo commit history.

**`datePublished`** (date string, required)
Date the lesson was first publicly released.

**`creativeWorkStatus`** (enum, required)
Development status. Values:
* `Active` — current, maintained, recommended for use
* `Under development` — draft or pre-release; content may change
* `Archived` — no longer maintained; kept for historical reference

**`sortingId`** (string, required)
Numeric string used to order lessons within a pathway. Lower numbers appear first. Assigned by curators. Does not need to be globally unique — only within a pathway group. Example: `"12"`.

---

### Provenance and back-compat

**`isPartOf`** (string, optional)
Name of the series, curriculum, or collection this lesson belongs to. Examples: `"The Turing Way"`, `"Software Carpentry"`, `"INTERSECT Training"`. Used in metadata displays and schema.org markup.

**`version`** (string, optional)
Lesson version string if published by the provider. Semver preferred (`1.1.0`), but use whatever the provider uses.

**`contributor`** (string, optional)
Named contributors beyond the primary author. Comma-separated.

**`notes`** (string, optional — not in schema, passthrough)
Curator notes not intended for display. Use for timing methodology, known issues, ambiguities about scope. This field passes through Zod validation via `.passthrough()`.

**`ospoRelevance`** (string, required)
Relevance tier from a UC OSPO perspective. Values used: `Core`, `High`, `Medium`. Core lessons are most directly relevant to the UC OSPO mission; High and Medium are supplementary.

---

### Back-compat fields (do not use for new records)

These fields exist for compatibility with older JSON records. Use the canonical fields instead.

| Legacy field | Canonical replacement |
|---|---|
| `learnerCategory` | `pathways` |
| `ossRole` | `roles` |
| `dependsOn` | `prerequisites` |

---

## Worked example

```json
{
  "name": "Introduction to Git",
  "slug": "introduction-to-git",
  "keepStatus": "keep",
  "description": "A hands-on introduction to version control with Git, covering the core commands and mental models for tracking changes in research software.",
  "url": "https://swcarpentry.github.io/git-novice/",
  "repoUrl": "https://github.com/swcarpentry/git-novice",
  "domain": "Research Software",
  "topic": "Version Control",
  "subTopic": "Git Basics",
  "pathways": ["getting-started", "contributing"],
  "educationalLevel": "Beginner",
  "learningResourceType": "workshop",
  "author": "The Carpentries",
  "provider": "The Carpentries",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "roles": ["Contributor", "Researcher"],
  "timeRequired": "PT4H",
  "inLanguage": ["en"],
  "keywords": ["git", "version control", "bash", "research software"],
  "prerequisites": [],
  "sortingId": "1",
  "learningObjectives": "After this lesson, the learner should be able to:\n- Explain what version control is and why it matters\n- Initialize and configure a local Git repository\n- Track changes with commit, diff, and log\n- Collaborate using remote repositories on GitHub",
  "ospoRelevance": "Core",
  "abstract": "This lesson introduces version control with Git to researchers with no prior experience. It covers creating repositories, tracking changes, branching, and pushing code to GitHub. Designed for a half-day workshop format.",
  "teaches": "Track, share, and collaborate on research software using Git.",
  "competencyRequired": "Basic command line",
  "audience": "Researchers, Graduate Students, Research Software Engineers",
  "dateCreated": "2014-01-01",
  "dateModified": "2024-06-01",
  "datePublished": "2014-06-01",
  "creativeWorkStatus": "Active",
  "isPartOf": "Software Carpentry"
}
```
