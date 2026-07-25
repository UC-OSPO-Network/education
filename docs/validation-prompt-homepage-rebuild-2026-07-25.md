# Validation prompt: OSPO Education homepage rebuild

Paste everything below the line into ChatGPT (or another external model) as-is.

---

## What this project is

The UC OSPO Network is a consortium of six University of California campuses running a shared open source program office. I maintain their education site (`ucospo.net/education`), a curated catalog of 43 live open source / research-software lessons, each linking out to an externally-hosted resource (Carpentries lessons, Turing Way chapters, etc.) rather than hosting content ourselves. The audience is UC researchers, research software engineers, librarians, and instructors who want vetted material to learn from or teach with.

## What's already decided — do not relitigate this part

On 2026-07-14 our review committee decided: **43 lessons doesn't justify a separate curated "pathway" (sequenced-journey) browsing structure.** We had a `/pathways` section with four hand-curated sequences (Getting Started, Contributing to a Project, Maintaining & Sustaining Software, Strategic Practices & Career Development), each a dedicated page showing lessons in a suggested order. We retired it in favor of an existing, already-built **Topics facet**: a controlled vocabulary of 13 subject-matter terms (Version Control & Collaborative Development, Licensing/Copyright & Reuse, Security & Supply Chain, etc.), each grounded in an external standard (ACM, CHAOSS, FAIR4RS, OpenSSF, WCAG), with its own landing page and DefinedTermSet JSON-LD. Old `/pathways/*` URLs now 301-redirect to `/lessons`. This part is done, committed, and not up for debate here.

A second factor in that decision, not just lesson count: growing uncertainty about how LLM-driven search and answer engines are reshaping discovery. We didn't want to keep sinking curation effort into a bespoke sequencing layer while that landscape is still shifting under us.

Real numbers, current live catalog (43 lessons):
- By format: 17 workshop, 8 course, 18 guide
- By audience persona: Research Software Engineer/Developer 34, Researcher 26, Project/Program Lead 11, Open Source Maintainer 10, Open Source Contributor 6, Community Manager 3, Librarian/Information Professional 2 (lessons can carry more than one)
- Getting Started (still a first-class concept, just no longer its own page): 8 lessons, now shown as an intro-copy-plus-lesson-list section directly on `/lessons`

## The actual decision point: what happens to the homepage

The homepage (`ucospo.net/education/`) was never rebuilt after the pathway retirement above. It's a real, non-trivial piece of UI, not a stub:

- **`WelcomeHeader`**: static hero, literally titled "Welcome to the Open Source Learning Pathways." with the prompt "What are you here to learn today?"
- **`PathwayShowcase`**: an interactive stacked-accordion of exactly 4 tabs, one per (now-retired) pathway. Clicking a tab expands it to show 1-2 horizontally-scrolling "lesson rails" (subsections grouped by sub-topic, max 4 lessons each).
- **`CategoryPanel`**: the individual accordion-tab component (icon, title, description, expand/collapse).
- **`LessonRail`**: a hand-built horizontal-scroll carousel with a custom scroll-progress thumb indicator (tracks scroll position, updates a progress bar), used inside each expanded tab.
- **`CategoryIcon`**: an icon-lookup component whose type is literally `'getting-started' | 'contributing' | 'maintaining' | 'strategic'`, i.e. hardcoded to the four retired pathway IDs.
- **`BrowseAllLessonsPanel`**: a simple CTA button linking to `/lessons`.

All of it, the copy, the data structure, the icon set, is built entirely around the pathway concept we just retired elsewhere on the site.

**Two options on the table:**

- **Option A** — Keep the same interactive tabbed-showcase-with-rails UI, just re-drive it off a curated subset of the 13 Topics instead of the 4 old pathways. Preserves the homepage's current visual richness and interactivity. Cost: now there are two categorization UIs on the site (the homepage's tabs, and `/lessons`' actual filter facets), showing overlapping information through different interaction models.
- **Option B** — Simplify. Drop the tabbed showcase entirely. Replace with a lighter welcome message, a short Getting Started teaser (reusing the copy/lessons already built out on `/lessons`), and a strong single call-to-action into `/lessons`, which now owns all the real browsing and filtering (Topics facet, Audience facet, search, skill level, resource type). The homepage becomes a fast handoff, not a second browsing experience.

I'm leaning toward **Option B**, on the theory that the same "don't build curatorial structure this catalog doesn't need" reasoning that killed `/pathways` applies just as much to a 4-tab homepage showcase built around those same four categories. But this is a bigger, more visible UI change than the earlier retirement work, so I want a real second opinion, not just confirmation of my own instinct.

## A related feature I want opinions on

`/lessons` has a "Workshop Planning Worksheet" feature: users can check off lessons from the catalog into a persistent selection tray, reorder them, add a workshop/course title, and download a generated Markdown lesson-plan document (with sections, estimated durations, a setup-requirements checklist, etc.). I like this feature conceptually and want to know whether it's worth investing further in, or carrying forward into whatever the homepage becomes, given our actual environment: a small (43-lesson), externally-linked, non-hosted catalog with an audience of already-busy instructors/researchers, not a large LMS with its own content.

## Specific questions — push back on all of them, don't just validate

1. **Does Option B undersell the homepage's job for a first-time visitor** (a funder, a prospective adopting campus, an instructor evaluating whether this catalog is worth their time) who needs a fast sense of "what's actually here" before they'll click through to a filter UI? Is a bare welcome + CTA too thin for that audience, or is that audience better served by `/lessons` itself?
2. **On the SEO/LLM-search reasoning specifically**: does a stripped-down homepage help or hurt discoverability by AI answer engines and search crawlers, versus a content-richer showcase? Or does none of that matter because the actual citable/crawlable depth already lives on `/lessons`, the per-topic landing pages, and individual lesson pages (which carry their own JSON-LD), making the homepage's content depth close to irrelevant either way?
3. **Is the Workshop Planning Worksheet a solution nobody asked for**, given this is a 43-lesson externally-linked catalog rather than a full curriculum platform? Or is checkbox-select-and-export exactly the right lightweight primitive for an instructor assembling a session from a small curated list, worth investing in further?
4. **Reflective/bigger-picture**: this project's underlying assumptions (a structured, sequenced curriculum with dedicated pathway pages, an LMS-adjacent posture) are roughly three years old. Given how AI-assisted search and just-in-time learning behavior have changed since then, does today's retirement direction (Option B) go far enough, or is there a case for going further, e.g., not just simplifying the homepage but reconsidering whether a distinct "homepage showcase" concept should exist at all versus redirecting straight into `/lessons`?
5. Give a **confidence score (1-10)** on recommending A vs. B vs. a third option you'd propose instead, and if B, give 2-3 concrete, specific suggestions for what that lighter homepage should actually contain and say.
