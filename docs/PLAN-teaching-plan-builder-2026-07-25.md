# Plan: Learner-Centered Teaching Plan Builder

Status: planning only, no application code changed. Written 2026-07-25.

**Location note:** this repo has no dedicated `plans/` or `design/` folder. It has `docs/` for reference/implementation guides (`schema.md`, `UI_UX_GUIDE.md`, `ACCESSIBILITY_GUIDE.md`) and a `docs/validation-prompt-*.md` convention this session already established for external-model cross-validation records. This document follows that same `docs/` location, named to sort near the two homepage validation prompts it's adjacent to in spirit.

---

## 1. Executive recommendation and confidence score

**Recommend Option 3: pilot a static learner-centered planning template first, then conditionally build a lightweight interactive builder only if the pilot shows the planning model earns its keep.**

Do not rebuild the existing Workshop Planning Worksheet into a full pedagogy-first interactive tool yet. The current worksheet is a real, tested, working feature (has its own Playwright a11y test, ships a valid Markdown export) that already does more than its own originating GitHub issue asked for. The gap between "content-selection tool" and "learner-centered planner" is a real gap, but it's a content and prompting gap, not an architecture gap, and it should be tested on paper before it's built into more React state.

**Confidence: 7/10.** High confidence that piloting-before-building is the right sequencing (this matches how every other build in this repo's recent history has gone, including the pathways retirement earlier today, which was itself validated externally before being built). Lower confidence on some specifics, most importantly, whether the audience of already-busy instructors will actually adopt a 5-8 person pilot process at all, and whether the current worksheet's existing users (if any exist yet, see §3) will feel it's being taken away from them mid-improvement.

---

## 2. Verified description of the current implementation

Everything below was confirmed by reading the actual files, not inferred.

### What it is
A feature on `/lessons`, no separate route. Called the **Workshop Planning Worksheet** in code and copy (issue #117 called it "Curriculum plan builder"; the shipped feature renamed it).

### Files
| File | Role |
|---|---|
| `src/components/LessonFilter.tsx` | Owns all selection state (`selectedSlugs`, `workshopTitle`, `trayAnnouncement`), renders the checkbox-bearing lesson grid and the sticky tray |
| `src/components/LessonCard.jsx` | Each card takes `isSelected` + `onToggle` props; renders a checkbox in the top corner |
| `src/lib/exportPlan.ts` | `buildPlanMarkdown()` (pure function, lesson array → Markdown string) and `downloadPlan()` (Blob + `URL.createObjectURL`, triggers browser download) |
| `src/lib/lessonDisplay.ts` | `formatDuration`, `SELF_STUDY_TYPES`, `teachingTime` — dependency-free helpers shared by `LessonCard`, `LessonFilter`, and `exportPlan` so client bundles don't pull in `astro:content` |
| `src/pages/lessons.astro` | Passes `pathwayNames` into `LessonFilter` purely so the export can label a lesson's pathway by name instead of slug |
| `tests/a11y/flows.spec.ts` (line 149) | `"workshop plan tray: keyboard selection, reorder focus, and download"` — existing Playwright coverage |

### What it currently asks users to do
1. Check a box on any lesson card in the `/lessons` grid (works with the active filters, selections persist across filter changes, verified in `LessonFilter.tsx`'s `lessonsBySlug` comment: *"Built from the full lesson set, not filteredLessons... a selection made under one facet state must not disappear from the tray"*).
2. Once ≥1 lesson is selected, a `role="region"` tray appears (`aria-labelledby="workshop-tray-heading"`), showing a live count, an optional workshop/course title field, and Clear/Download buttons.
3. Reorder selected lessons via up/down buttons (not drag-and-drop), with explicit focus management after a reorder (`pendingFocusKeyRef`) so keyboard focus doesn't drop to `<body>`.
4. Click Download, triggers `downloadPlan()`, filename `workshop-planning-worksheet-YYYY-MM-DD.md`.

### What the Markdown export actually contains (verified against `exportPlan.ts`)
```
# Workshop Planning Worksheet
_Generated: {date} | Source: {url}_

Workshop / course title: {input or blank}
Intended learners: (blank, instructor fills in)
Workshop goal: (blank)
Delivery mode: (blank)
Date or sessions: (blank)

## Lessons (N)

### 1. {lesson name}
- Pathway: {pathwayNames[p] joined, or "_not supplied_"}
- Sub-topic: {subTopic or "_not supplied_"}
- Level: {educationalLevel} · Duration: {teachingTime(lesson)}
- URL: {url}

Description: {description}
Learning Objectives: {learningObjectives, verbatim multi-line}

#### Local use
- Planned duration:
- What we'll omit or adapt:
- Setup:
- Instructor notes:
[repeat per lesson]

## Total Listed Duration
{sum of teachingTime, excluding SELF_STUDY_TYPES} across N lessons (source-estimated; excludes self-paced material...)

## Setup Requirements
_List any software, accounts, or data files learners need before the workshop._
```

Two things worth flagging precisely here:
- **The shipped export already exceeds issue #117's spec.** #117 asked for one "Teaching Notes" and one "Setup Requirements" section at the *end* of the whole document. What's actually built adds a **per-lesson** `#### Local use` block (Planned duration / What we'll omit or adapt / Setup / Instructor notes) for every single lesson, not just once at the end. This is closer to instructor-preparation scaffolding than #117 described, worth knowing before assuming the brief's "content-first tool" framing is the full story.
- **`Pathway:` is still a field in the export**, sourced from `lesson.pathways` + the `pathwayNames` lookup, even though the Pathway *facet* was retired from the `/lessons` browsing UI earlier today (see the two `docs/validation-prompt-homepage-rebuild-*.md` files from this same session). The underlying `pathways[]` data still exists on every lesson record and is still exported into the plan. This is a live inconsistency worth a decision (see §17).

### What it does NOT do (verified absence)
- No persistence across page loads or sessions, state lives in React `useState`, refreshing the page clears the selection. This matches issue #117's explicit "no persistence needed for v1" acceptance criterion.
- No accounts, no server, no analytics/instrumentation of any kind, so §12's "5-8 instructor pilot" cannot currently be measured through the product itself; it would need to be a moderated/observed pilot, not a telemetry-driven one.
- No outcomes, activities, or "learners will..." fields anywhere in the data model or the export. It is, factually, a content-selection-and-sequencing tool, the brief's framing of the problem is accurate for what exists today.

### Issue tracker note
GitHub issue **#117**, "FEATURE: Curriculum plan builder — select lessons and download a teaching plan," is still **open** (`state: OPEN`), labeled `priority: medium`, `student-ready`, `type: feature`. The feature it describes has already shipped (confirmed via `HANDOFF.md` from the 2026-07-14 session: *"Workshop Planning Worksheet shipped (rebuild of stale issue #117)"*), so the issue itself is stale bookkeeping, not an open gap. Worth closing regardless of what this plan recommends.

---

## 3. Research synthesis and evidence limitations

Reproducing the framing supplied in the brief, since it's the load-bearing input to this plan, not re-deriving it independently:

- Learners and teaching context should come before content selection; catalog personas (the `audiences[]` facet) are a starting point, not a complete description of learners.
- Outcomes → evidence of learning → activities/resources is the intended sequence (backward design / constructive alignment), presented as a *design framework*, not an experimentally-proven pipeline.
- Learner activity (predict, explain, practice, diagnose, create, compare, apply) should be foregrounded over a list of lesson titles.
- Active practice and formative feedback are well-supported; specific techniques are options conditional on learners/material, not mandatory per lesson.
- Cognitive load, setup risk, safe cut points, and "don't just speed up when behind" are named constraints on the schedule representation.
- Worked-example fading is a plausible novice-sequencing tool, not a universal requirement.
- Transfer to the learner's own context should be planned for explicitly; BYOD is one method, not the only one.
- A single workshop can't provide real spaced practice; the planner can optionally *point at* pre/post-work, it shouldn't promise automated follow-up (no email infrastructure exists in this repo, and none should be implied).
- Accessibility is a requirement independent of whether every technique has a matching effect-size study.
- AI-assisted performance ≠ learning; if AI is relevant to a session, the plan should record a stance (not used / permitted-incidental / intentionally integrated with visible learner reasoning), not assume a policy is unnecessary or that one size fits all.
- Language matters: "learner-centered," "informed by learning science," "designed to support thoughtful planning," never "evidence-based" or "validated" for a generated document.

**Evidence limitations to carry into the plan, verbatim from the brief, since they directly bound what this catalog can honestly claim:**
- Most underlying research is K-12/undergraduate, not adult professional short workshops.
- Open-source/research-software/librarian-training-specific evidence is thin.
- Backward design and constructive alignment are design frameworks, not simple validated interventions.
- AI-learning evidence is emerging and context-dependent.
- Specific numeric thresholds in the brief's own recommended sequence (20% optional content, 15-30 min BYOD, checkpoint every 45 minutes, follow-up at exactly 7 days) are explicitly **product hypotheses**, not findings, and must not be presented as such anywhere in UI copy or documentation this plan produces.

This synthesis is treated as a given input per the task brief; it was not independently re-verified against primary literature as part of this repository-focused pass.

---

## 4. User problem and intended outcomes

**Problem, restated against what's actually in the repo:** the worksheet lets an instructor assemble a sequence of externally-hosted lesson *links* with some auto-filled metadata and blank spaces to fill in later. It does not ask who the learners are, what they should be able to do afterward, or how the instructor will know it worked. For a catalog that explicitly (per `docs/validation-prompt-instructor-context-2026-07-14.md`) cannot author new per-lesson pedagogical content, the risk is producing something that *looks* like a lesson plan but is actually still just an annotated reading list.

**Intended outcome of this feature, if built out further:** an instructor can produce a first-draft, learner-centered session plan in ~15-20 minutes that starts from "who are they / what will they be able to do" and treats the 43 catalog lessons as *resources in service of* that plan, not the plan itself.

---

## 5. Options comparison

| Option | Benefits | Costs / risks | Maintenance | Accessibility | Reusable code | Validation needed | Reversibility |
|---|---|---|---|---|---|---|---|
| **1. Retain worksheet, modest improvements** (e.g., add 2-3 optional prompt fields to the existing export, no new UI) | Lowest effort; existing a11y test coverage stays valid; no new surface area | Doesn't address the core critique (still content-first); "modest" additions to a Markdown template are cheap to try but easy to under-deliver | Minimal, same file set | No new risk | 100% of `exportPlan.ts`, `LessonFilter.tsx` tray logic | Could still benefit from a quick 2-3 instructor check | Fully reversible, it's a text-template edit |
| **2. Static/downloadable learner-centered template only** (no code changes at all, a document + a guidance page) | Fastest way to test the *planning model* itself, independent of tooling; zero engineering risk; directly answers the brief's own recommended Phase 1 | Doesn't leverage any catalog metadata automatically (instructor copies fields by hand); may feel like a step backward from the existing worksheet's auto-population | None (content-only) | Must still meet the site's own accessibility bar if delivered as a page (this site already holds a WCAG 2.1 AA badge per the footer) | None required; can reuse the existing metadata *field names* as a reference | Yes, exactly the pilot in §12 | Trivial, it's a document |
| **3. Pilot the static template, then conditionally build a lightweight interactive builder** | Tests the actual hypothesis (does starting from learners/outcomes change what gets produced) before spending build time; matches this repo's established pattern of external-validation-before-build (see the homepage rebuild earlier today) | Two-phase means slower time-to-any-visible-change; requires actually running a 5-8 person pilot, which needs someone to recruit and moderate it | Low until/unless Phase 2 triggers | Same as Option 2 for Phase 1; Phase 2 accessibility risk described in §10 | Phase 2 could reuse ~80% of current `LessonFilter.tsx` selection/tray/export plumbing if the data model is extended rather than replaced | The pilot itself IS the validation step | Fully reversible at every gate |
| **4. Discontinue planning feature, guidance only** | Simplest possible surface; no maintenance; consistent with the org's stated "we don't author pedagogical content" constraint taken to its logical extreme | Removes something that's already shipped, has passing a11y tests, and (per issue #117's `student-ready` label) was explicitly built as a good first feature; no evidence currently exists that anyone dislikes it, so removing it isn't obviously validated either | None | N/A | Would delete rather than reuse existing code | Should validate that nobody's using it before deleting it, which the repo cannot currently measure (no analytics) | Reversible via git, but a real product regression if anyone's using it today |

**Recommendation: Option 3.** Option 4 removes a working feature with no evidence it's unwanted. Option 1 doesn't test the actual hypothesis. Option 2 is the right first move but stops short of the conditional builder path the brief itself asks to evaluate. Option 3 is Option 2 plus an honest decision gate.

---

## 6. Recommended information architecture and user flow

Evaluate, not build, the following:

**New instructor-facing route:** `/teaching` or a "Teaching with these resources" section, placement TBD, but note that the homepage rebuilt earlier today already reserves a route-card labeled *"Planning instruction? Select lessons on the catalog page and build a teaching plan with the Workshop Planning Worksheet"* (`src/pages/index.astro`, current commit `76c595c`). Any new IA here should either replace that card's destination or keep it pointed at `/lessons` if the builder stays embedded there, this is a real, immediate decision, not a hypothetical (see §17, open question 1).

**Phase 1 (static template) flow:**
1. Instructor reads a short "Teaching with these resources" page: what this is, what it isn't ("not evidence-based," "not a substitute for your judgment"), a downloadable pilot template, 1-2 sample plans.
2. Instructor fills out the template offline (in whatever tool they already use).
3. No selection UI, no export code, nothing to build.

**Phase 2 (conditional builder) flow**, only if Phase 1 clears the gate in §12:
1. Same entry point to `/lessons` (or wherever selection lives today).
2. Selection/tray mechanism is retained largely as-is.
3. Before or alongside the lesson grid, a short, mostly-optional set of prompts per the required/optional split in §7.
4. Export produces the same kind of Markdown, restructured to lead with learners/outcomes rather than a lesson list.

---

## 7. Required vs. optional fields

**Required (kept genuinely minimal, per the brief's own instruction):**
- Who the learners are / what they need to accomplish (free text, 1-2 sentences)
- Session format and available time
- 2-4 intended outcomes
- What learners will do to practice or demonstrate each outcome
- Selected catalog lessons (the part that already exists)
- Setup/accessibility considerations (a checklist prompt, not a form)

**Optional, progressive disclosure:**
- Prior-knowledge diagnostic
- Likely misconceptions/difficulties
- Worked-example/fading note
- Retrieval/prediction activity
- Transfer-to-own-context prompt
- Post-workshop practice pointer
- AI-use stance (not used / permitted-incidental / intentionally integrated)
- Post-teaching reflection

This matches the brief's proposed split; nothing in the repository contradicts it, since none of it exists yet.

---

## 8. Candidate teaching-plan data model

If Phase 2 proceeds, extend rather than replace what exists. Current shape (inferred from `exportPlan.ts`'s `PlanOptions` and the per-lesson block, not a formal schema today since there is no persisted teaching-plan record, only a generated string):

```ts
// Current (implicit, not a real type today):
{ workshopTitle?: string; selectedLessons: Lesson[] }

// Proposed, additive:
{
  workshopTitle?: string;
  learners?: string;              // required in Phase 2 UI, optional in the type (draft-friendly)
  format?: string;
  outcomes?: string[];             // 2-4
  activitiesByOutcome?: Record<string, string>;
  selectedLessons: Lesson[];       // unchanged
  priorKnowledge?: string;
  misconceptions?: string;
  transferPrompt?: string;
  aiStance?: 'not-used' | 'permitted-incidental' | 'intentionally-integrated';
  aiStanceNote?: string;
  postWorkshopPractice?: string;
}
```

Keep this **client-side only** (no server, no schema versioning burden) unless Phase 3 explicitly requires resuming/importing a saved plan, which is out of scope per the brief's non-goals.

---

## 9. Mapping from existing lesson metadata

Per `docs/schema.md`, fields that can auto-populate a plan today, verified against the schema, not assumed:

| Plan field | Source lesson field | Coverage (of 43 live lessons) |
|---|---|---|
| Lesson title | `name` | 43/43 |
| Canonical URL | `url` | 43/43 (required field) |
| Attribution | `author` / `provider` | 43/43 (required fields) |
| Duration | `timeRequired` via `teachingTime()` | 43/43, but self-study types (guide) intentionally omit a duration badge |
| Prerequisites | `prerequisites[]` | 38/43 have at least one |
| Learning objectives | `learningObjectives` | 43/43 |
| "Teaches" one-liner | `teaches` | recommended, not required, not spot-checked here |

Fields the brief's candidate teaching-readiness list names that **do not exist in the schema today**: setup requirements, included exercises/assessments, instructor notes, accessibility information, last-reviewed date (a `dateModified` field exists but isn't surfaced on the lesson detail page; the visible "Last updated" on `/lessons/[slug]` is actually GitHub repo push date from health-check data, a different signal). Any UI copy referencing these must say **"Not specified by the source"** rather than inferring, exactly as the brief instructs, and this is a schema-change question, not a UI question, if pursued.

---

## 10. Accessibility and privacy considerations

**Already covered:** the existing tray/checkbox/reorder flow has a passing Playwright a11y test (`tests/a11y/flows.spec.ts:149`) exercising keyboard selection, reorder focus management, and download. This is real, working coverage to build on, not from scratch.

**New risk surface if Phase 2 proceeds:** a multi-step form with progressive disclosure, more fields, more validation states, and (per the brief) tooltips linking to "why this helps" guidance. Concretely:
- Progressive-disclosure sections need the same heading-order and `aria-expanded` discipline already documented in `docs/UI_UX_GUIDE.md`'s Interaction Rules and Accessibility Rules sections.
- Any new export format changes need the same "missing metadata fields are omitted gracefully" rule issue #117 already specified and the current `exportPlan.ts` already implements (`ns()` helper, `_not supplied_` fallback).
- No new authentication or personal-data collection is in scope (matches the brief's non-goals and this repo's current no-accounts posture).

**Privacy:** nothing here proposes collecting instructor names, emails, or any learner data. If a future pilot needs to contact 5-8 instructors, that's an email/recruitment activity outside the codebase, not a data-model concern.

---

## 11. Pilot template outline (Phase 1 deliverable if this plan is approved)

A single downloadable document (Markdown or plain text, matching the existing export's format so it's a visually consistent step down, not a jarring format change) with sections in the sequence from §6:
1. Learners and context
2. Outcomes (2-4)
3. Evidence of learning / checkpoints
4. Learner activities + selected catalog lessons (instructor manually copies title/URL/duration from `/lessons`, since Phase 1 has no auto-population)
5. Timing, prerequisites, transitions, breaks, setup, accessibility, safe cut points
6. AI-use stance (only if relevant)
7. Transfer / follow-up / reflection

Accompanied by 1-2 realistic sample plans filled out using real catalog lessons (e.g., an Intro-to-Git + Software-Licensing half-day session), and the guidance-page copy described in §6.

---

## 12. Evaluation and decision gates

**Pilot: 5-8 instructors**, tests (per the brief, reproduced here as the actual measurable protocol):
- Completion/abandonment
- Time required
- Friction points
- Whether instructors start from learners/outcomes rather than content
- Alignment between outcomes, activities, and checks for understanding
- Whether safe cut points preserve the sequence
- Whether accessibility/setup risk gets considered
- Whether auto-populated metadata (Phase 2 only) helps or clutters
- Preferred format (Markdown vs. doc vs. form)
- What instructors changed after actually teaching
- Whether an interactive tool would earn its maintenance cost

**Decision criteria** (practical, not arbitrary thresholds presented as research):
- Proceed to Phase 2 only if a majority of pilot instructors both (a) completed a usable first draft, and (b) can articulate learner outcomes before naming lesson titles when asked to walk through their plan out loud. This is a judgment call to make with actual pilot transcripts, not a number to hit.
- If instructors reliably still start from "which lessons do I want" regardless of field ordering, that's a signal the intervention needs a different shape, not more fields.

---

## 13. Conditional technical architecture for a later builder

Only relevant if Phase 2 is triggered:
- Stay entirely client-side; no server, no new backend dependency, matching this static-site (GitHub Pages) deployment model documented in `astro.config.mjs`.
- Extend `LessonFilter.tsx`'s existing state shape (§8) rather than introducing a separate component tree; the tray, reorder, and download mechanics are already built, tested, and don't need replacing.
- `exportPlan.ts`'s `buildPlanMarkdown()` gets new optional sections, following its existing `ns()` "not supplied" pattern for anything left blank.
- No schema versioning needed if the plan stays a generated, non-persisted document. If Phase 3 ever adds save/resume, that's a new decision point, not a default to build toward now.

---

## 14. Testing strategy

- Extend `tests/a11y/flows.spec.ts`'s existing worksheet test rather than writing a parallel suite, add assertions for any new required fields, progressive-disclosure toggle behavior, and that the export still degrades gracefully when optional fields are empty.
- Any Phase 1 pilot is a moderated/observed test, not an automatable one, plan for a human note-taker, not instrumentation (none exists).

---

## 15. Migration or coexistence plan for the current worksheet

Phase 1 requires no migration, it's an additive page, the existing worksheet is untouched. If Phase 2 proceeds, the existing tray/checkbox/reorder/download UI is extended in place, not replaced, so there's no coexistence problem to solve: it's the same feature, richer.

---

## 16. Explicit non-goals

Reproducing the brief's list, since it is already correct and grounded in this repo's actual constraints (no server, no hosting, no LMS, explicit "we don't author lesson content" org decision documented in `docs/validation-prompt-instructor-context-2026-07-14.md`):
- Not an LMS; no enrollment, grades, or completion records.
- Does not auto-generate a curriculum or claim selected lessons form a coherent course.
- Does not assign pedagogical-quality scores to catalog resources.
- Does not infer missing teaching-readiness metadata (says "Not specified by the source" instead).
- Does not force a large pedagogy questionnaire; required fields stay minimal.
- Does not require AI use or generate instructional content that substitutes for instructor judgment.
- No automated learner-email collection during the pilot.
- No new authentication or server-side persistence.
- Never describes a generated plan as "evidence-based."
- Does not rebuild or mirror source lessons.

---

## 17. Risks, unresolved questions, and assumptions

**Risks:**
- Building Phase 2 features on top of the existing `LessonFilter.tsx` risks growing an already-large client component further (it's currently ~600 lines handling filters, search, tray, reorder, and export together). A refactor-before-extend pass may be warranted before Phase 2, not during it.
- No current way to measure whether the existing worksheet is used at all today, so both "improve it" and "replace it" decisions are somewhat evidence-free until a pilot happens.

**Open questions requiring a decision, not research:**
1. ~~The `Pathway:` field in the export.~~ **Resolved 2026-07-25** (commit `3e94b6e`): switched to `topics[]`, no lookup table needed since it's already readable term names. The now-fully-dead `pathwayNames` threading (`LessonFilter.tsx` prop, `lessons.astro`'s id→name map) was removed too; the `pathways` collection fetch itself stays, still needed for Getting Started's intro copy.
2. **The homepage's existing "Planning instruction?" route card** (`src/pages/index.astro`) already points at `/lessons` with worksheet-specific copy. **Recommendation: leave it as-is.** Phase 1 of this plan (the static template pilot) doesn't touch `/lessons` or introduce a new route, so there's nothing to reconcile yet. Revisit this card's copy and destination only if/when Phase 2 actually ships something at a different URL, don't build routing for a future state that may not happen.
3. ~~Should GitHub issue #117 be closed now~~ **Resolved 2026-07-25**: closed, with a comment pointing at the shipped worksheet and this plan.

**Assumptions this plan makes, flagged as such:**
- Assumes the existing worksheet has real (if unmeasured) usage worth preserving, based on it being a deliberately built, tested feature rather than an accident, not on any usage data (none exists).
- Assumes a 5-8 instructor pilot is recruitable through the same UC OSPO Network channels used for CLDT recruitment earlier this session; that channel's actual availability wasn't verified as part of this task.

---

## 18. Phased implementation sequence

```
Phase 0 (this document) — repository + content audit — COMPLETE
  ↓
Phase 1 — static template + guidance page + 1-2 sample plans + pilot protocol
  requires: sign-off on this plan, resolution of open question 1 (Pathway field)
  ↓
Phase 1 pilot — 5-8 instructors, moderated
  ↓
Decision gate (§12) — go/no-go on Phase 2, based on pilot transcripts, not a fixed score
  ↓
Phase 2 (conditional) — extend LessonFilter.tsx + exportPlan.ts per §7-9, §13
  requires: Phase 1 pilot showing the planning model earns its keep
  ↓
Phase 3 (conditional, later, not assumed) — import/resume, more export formats,
  follow-up prompts, cross-instructor sharing, richer metadata integration
  requires: demonstrated Phase 2 use, none of which exists yet to justify pre-building
```

---

## 19. Confidence categorization of recommendations in this plan

**Supported by stronger evidence** (per the brief's own synthesis, not independently re-verified here): active learner practice and formative feedback matter more than content coverage; cognitive load / setup risk / safe cut points are real planning constraints; AI-assisted performance is not the same as learning.

**Established instructional-design practice, not experimentally proven per-element:** backward design / constructive alignment as the overall sequencing frame; worked-example fading for novices; explicit transfer planning.

**Accessibility/ethical requirements, non-negotiable regardless of evidence strength:** accessibility and inclusive participation prompts; never describing a generated plan as "evidence-based"; graceful handling of missing metadata ("Not specified by the source").

**Product hypotheses requiring instructor testing, not to be treated as settled:** the entire Phase 2 go/no-go; the specific required/optional field split in §7; whether Markdown remains the right export format for this audience; whether any interactive builder is worth its maintenance cost at all, which is the central question this whole plan exists to avoid begging.
