# Validation prompt: instructor-facing pedagogical context on a metadata-only catalog

Paste this whole document into an external model (ChatGPT, Gemini) with no other context and ask it to respond in full.

---

## The project

UC OSPO Education (`ucospo.net/education`) is a static site run by the University of California's Open Source Program Office network. It is **not** a lesson-authoring platform. It is a curated index/catalog: each entry is a metadata record pointing to an open source lesson hosted elsewhere (Carpentries lessons, CodeRefinery material, GitHub Pages sites, university course pages, etc.). The site does not host, mirror, or control the actual teaching content — it links out.

Current inventory: **43 live lesson records**. Each record carries structured metadata: `name`, `description`, `url` (external), `repoUrl`, `educationalLevel` (Beginner/Intermediate/Advanced), `learningResourceType` (workshop/course/guide/tutorial/...), `timeRequired` (ISO 8601 duration), `learningObjectives`, `topics[]` (13-term controlled vocabulary), `audiences[]` (8 personas: Researcher, Research Software Engineer/Developer, Open Source Contributor, Open Source Maintainer, Project/Program Lead, Community Manager, Librarian/Information Professional, Educator), `roles[]` (Contributor/Maintainer/Community Manager/Project Lead), and a `pathways[]` journey-stage tag (Getting Started/Contributing/Maintaining/Strategic).

Real distribution across those 43 records (a lesson can carry multiple tags in each dimension, so totals per dimension exceed 43):

- **Pathway:** Contributing 21, Strategic 9, Getting Started 8, Maintaining 5
- **Topic (13 terms):** ranges from Version Control & Collaborative Development (12) down to Security & Supply Chain (1) and Accessibility & Inclusive Design (1) — 3 of the 13 topic terms have 1-2 lessons each
- **Audience:** Research Software Engineer/Developer 34, Researcher 26, Project/Program Lead 11, Open Source Maintainer 10, Open Source Contributor 6, Community Manager 3, Librarian/Information Professional 2, **Educator 0** (this value was just added to the schema and nothing is tagged with it yet)

## Hard constraint — already decided, do not relitigate

The organization has explicitly decided it **cannot commit to developing or maintaining lesson content**. This was just formalized in a new lesson-submission process: people may suggest or contribute an *existing, externally-hosted* lesson to be *listed* (linked + credited to its original author), but the org will not author new lessons, host content, or take on a maintenance obligation for lesson material itself. Any proposed solution that amounts to "have the org write real teaching guides / lesson plans per lesson" is out of scope — assume that door is closed for the foreseeable future (it may reopen if the program grows, but plan as if it won't).

## The specific problem

There's a page ("For Educators") aimed at instructors who want to use catalog lessons in their own teaching. The stated desire from the team: give instructors **more informational context** — something in the spirit of the site's own glossary — beyond bare metadata.

The tension: what instructors actually seem to want resembles what **Carpentries Workbench** lessons natively provide — instructor notes, timed exercises with solutions, discussion prompts, callout-boxed guidance for running a session. But most of the 43 linked lessons are *not* Workbench-format, aren't under this org's control, and the org has ruled out authoring that material itself (see constraint above). So there's a structural mismatch: the ask is for pedagogical-authoring-grade content, but the site is fundamentally a metadata index over content it doesn't own.

There is one existing, unbuilt GitHub issue that's the closest attempt at a resolution — **issue #117, "Curriculum plan builder — select lessons and download a teaching plan"**:

> Let instructors select a subset of lessons from the lesson browser and download a structured Markdown teaching plan. Explicitly **not a content mirror** — modeled on Carpentries' own *instructor preparation* workflow (not their lesson-*authoring* format). The generated document assembles only fields that already exist in the metadata (name, level, duration, learning objectives, description, URL) into a per-lesson block, and includes two sections left deliberately **blank** for the instructor to fill in themselves: "Teaching Notes" and "Setup Requirements." No new content is authored by the org — it's a re-composition/export of existing metadata into a workshop-prep scaffold.

## Our current read (please stress-test this, don't just agree with it)

Our working theory is that "For Educators," the Curriculum Plan Builder (#117), and the Glossary aren't three separate content problems needing three different authoring efforts — they're three different **views/exports of the same 43 metadata records**: browse-by-role, sequence-into-a-workshop, and orient-on-terminology. None of them require the org to author new per-lesson pedagogical content, so none of them violate the constraint above. Concretely we're leaning toward: link glossary terms contextually from lesson topic/description text (so unfamiliar terminology resolves inline) rather than trying to write "how to teach this" guidance per lesson.

## What we want from you

1. **Is the "perspectival, not new content type" framing actually sound**, or is there a real, distinct informational need here that role-filtering + a metadata export + glossary links can't substitute for? Where specifically would that framing break down?
2. **Name existing treatments/precedents** that solve "curated index of externally-hosted educational content + genuine instructor usability" *without* the indexer authoring original pedagogical content per item. Look at analogues like: OER Commons, MERLOT, Carpentries Incubator's own discovery/browse layer, ACM CCS-linked resource hubs, academic library research guides (LibGuides pattern), other OSPO or open-source-education catalogs, curated "awesome-list"-style repos with annotations. Be specific — link the pattern to a named real-world example where you can, not a generic category.
3. **Does the Curriculum Plan Builder (#117) design actually close the gap**, or does it just repackage metadata under a "teaching plan" label without adding real pedagogical value? What's the actual boundary between "helpful export" and "instructors will notice this is empty scaffolding"?
4. **Is glossary-term-linking sufficient**, or does it underdeliver relative to what an instructor is actually asking for when they say "more informational context"? If underdelivering, what's the smallest addition that would close the gap without becoming a content-authoring commitment?

Give a confidence score (0-100) on our current framing, and concrete corrections — not general encouragement. If you think we're solving the wrong problem, say so plainly.
