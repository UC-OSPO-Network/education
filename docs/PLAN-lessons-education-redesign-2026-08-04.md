# Plan: /education + /lessons IA redesign (2026-08-04 WG meeting)

Status: Phase 0 decided, Phase 1 implemented (uncommitted). Written 2026-08-04, updated 2026-08-06.

Tracks GitHub issue [#194](https://github.com/UC-OSPO-Network/education/issues/194) and its seven sub-issues (#195-#201), filed from 2026-08-04 WG meeting feedback.

---

## 1. Why phased this way

Four of the seven issues are genuinely independent features. Three are the same underlying problem seen from different pages. Building them in issue-number order would mean redoing work: the filter facet system (#197, #201) is the one piece every other issue either renders through or links into, so it has to move first. The navigation-model decision (#198) is a prerequisite for three separate implementation issues (#196, #200, #195), not just a nice-to-have — building any of those three before the model is decided risks a second rebuild once the decision lands.

---

## 2. Phase 0 decisions — resolved 2026-08-06

Made directly with Tim rather than in a separate WG session; David's original feedback (issue #198) was the input, not a second round-trip.

1. **Getting Started facet value (#196): a value on Topic.** Not its own axis (would reopen the Pathway-vs-Topic split the 2026-07-14 committee decision already closed), not a value on Audience. "Getting Started with Open Source" becomes a 14th Topic value.
2. **Nav model (#198): one browsing mechanism, not three.** The facet system + grid *is* the catalog. Every "entry point" — homepage cards, Getting Started, the future sidebar (#199) — is a preset deep-link into facet state, not a separate static destination. Confirmed against a live bug in the current homepage (`src/pages/index.astro` lines 36-56): "Browse all lessons" and "Planning instruction?" both link to the bare `/lessons` URL — identical destinations, different copy — and "New to open source?" only anchor-scrolls to `#getting-started-heading` rather than actually filtering anything. None of the three cards currently deep-link at all; that's the concrete shape of the "parallel concepts" confusion David flagged, not a deeper philosophical split.
3. **Educator becomes a value on Audience, not a new concept.** `'Educator'` already exists in the `audiences` schema enum (`src/content/config.ts:93`), gated by a validation rule to lessons where `learningResourceType` is `workshop` or `course`. No schema change needed — just facet wiring, since `audience` is already one of the 6 `FACETS` in `LessonFilter.tsx`.
4. **Filter pattern (#197): searchable multi-select comboboxes.** Decided and **implemented** 2026-08-06 — see Phase 1 below.
5. **Sidebar population (#199): still open.** Now scoped by decision 2 above — whatever it ends up being, it should be preset facet-state links, not a second curated content list living beside the facets. Revisit once Phase 2 ships and it's clear what's left to curate toward.

### The unifying principle: static stacked sections → facet-conditional content

Diagnosed by re-reading `src/pages/lessons.astro` directly: the page stacks three static/semi-static blocks *above* the actual faceted browse UI —

1. `page-intro` (eyebrow, H1, summary, 2 note paragraphs)
2. Getting Started section (3-paragraph intro + a carousel of 8 lessons)
3. `EducatorToolkit` (a 6-item checklist) + a static "teaching one of these? start a discussion" note

*then* `LessonFilter` — search, facets, and the real 43-lesson grid.

The Getting Started carousel's 8 lessons are a subset of the main grid below — **they render twice on the page.** That's not a density problem to trim, it's duplicate content to delete, and deleting it is exactly what decision 1 does: once Getting Started is a Topic value, its intro copy and lesson set only appear when that facet is selected, inside the one real grid. No separate section, no duplicate carousel.

`EducatorToolkit`'s own header comment says it's collection-level guidance for evaluating externally-hosted lessons before teaching them — not tied to which lessons are currently visible. That description matches decision 3 almost exactly: it's guidance for the Educator audience, so it should render the same way — conditional on `audience=Educator` being selected, not permanent for every visitor regardless of what they're browsing.

Only the top `page-intro` block stays permanent; it's page-level framing, not duplicative of anything below it.

---

## 3. Phase sequence

```
Phase 0 — Decisions                                    ✅ done 2026-08-06
  ↓
Phase 1 — Facet system rebuild (#197, #201)             ✅ implemented, uncommitted
  ↓
Phase 2 — Facet-conditional entry points (#196, #198, #200, Educator/EducatorToolkit)
  ↓
Phase 3 — /lessons page density cleanup (#195)
  ↓
Phase 4 — Sidebar navigation (#199)  [can start after Phase 1, doesn't block on 2/3]
```

### Phase 1 — Facet system rebuild (#197, #201) — done

Shipped 2026-08-06 on branch `feat/facet-rebuild`. All 6 facets (`role`, `educationalLevel`, `domain`, `learningResourceType`, `audience`, `topic`) now share one presentation model: a new `FacetCombobox` component (`src/components/FacetCombobox.tsx`, built on `@radix-ui/react-popover` + `@radix-ui/react-checkbox`, no Tailwind) — a labeled trigger showing the current selection as badges, opening a searchable multi-select checkbox list. Replaces the old two-tier system (`renderPromotedFacet` button rows for Audience/Topic vs. `<details>` accordions for everything else).

Preserved: URL param sync (`FILTER_QUERY_PARAMS`), live facet counts, the `noindex` script in `lessons.astro`, Workshop Planning Worksheet tray state.

Found and fixed in the same pass: a pre-existing broken assertion in `tests/a11y/flows.spec.ts` (`getByLabel("Topic").toHaveValue(...)` never matched the old button/details markup either — stale test, not a regression). Verified via a stashed baseline comparison: 10 pre-existing Playwright failures before this change, 8 after (the 2 fixed are exactly the ones rewritten); no new failures introduced. Remaining 8 are unrelated pre-existing issues (header search/pagefind indexing in the local preview build, a documented `.page-intro__note` color-contrast bug, a stale homepage-heading assertion from the 07-28 homepage rebuild).

**Branch note:** built on `feat/concept-pages-prototype` initially, then moved to a fresh branch `feat/facet-rebuild` (created from the same commit, so nothing was lost) once it became clear the redesign work shouldn't stack onto the prototype branch's in-review scope. Since `feat/concept-pages-prototype` hasn't merged to `main` yet, a PR from `feat/facet-rebuild` will currently carry its unmerged commits too (Educator persona addition, template fixes, etc.) until that branch lands — unavoidable for now, but at least the new commits don't live on the prototype branch's own ref. **Not yet committed** — Tim is reviewing the working tree before commit.

---

### Phase 2 — Facet-conditional entry points (#196, #198, #200, Educator)

**Why bundled:** all of these are implementations of the same decision (Section 2, principle above) — a static section becomes conditional content driven by facet selection. Building them separately risks the same "half-migrated" state Phase 1 avoided by bundling #197/#201.

**Scope, in build order:**
1. Add "Getting Started with Open Source" as a Topic value; tag the 8 current getting-started lessons with it. Show the pathway's existing intro copy (`src/content/pathways/getting-started.json`) only when that Topic value is selected — inline above the (now singular) grid, not as a separate section. Remove the hardcoded Getting Started section in `lessons.astro` (~lines 103-124) once the facet path is live; don't run both simultaneously past a short overlap window.
2. Make `EducatorToolkit`'s checklist conditional on `audience=Educator` being selected, same mechanism as (1). Remove its current always-rendered placement in `lessons.astro` (~lines 126-132).
3. Rewrite the homepage's 3 route cards (`src/pages/index.astro` lines 36-56) to deep-link into real filtered `/lessons?...` states: "New to open source?" → `?topic=Getting+Started+with+Open+Source`, "Planning instruction?" → `?audience=Educator` (replacing its current duplicate-of-"Browse all" link with a genuinely distinct destination), "Browse all lessons" stays unscoped.
4. Confirm resulting copy/labels are consistent across both pages — mostly a pass once 1-3 are built, not separate engineering.

**Open implementation question, not yet decided:** where the conditional copy renders relative to the grid — above it (current Getting Started position) vs. inline within the facet panel itself (nearer the trigger that caused it to appear). Worth a quick look at both before committing.

---

### Phase 3 — /lessons page density cleanup (#195)

Re-assess *after* Phase 2 lands. Most of the original "stack" complaint was the Getting Started section and EducatorToolkit block, both gone as static content by then. What's left to look at: the `page-intro` note paragraphs, and whether the remaining page reads as a single coherent tool rather than a stack at all — may need little to no further cutting once Phase 2 ships.

---

### Phase 4 — Sidebar navigation (#199)

Can start any time after Phase 1 (needs the rebuilt facet/URL shape to link into). Population is still undecided (Section 2, decision 5) but must be preset facet-state links per the unifying principle — not a second curated list. Revisit scope once Phase 2's actual facet values (Getting Started, Educator) exist to link to.

---

## 4. Branch / PR strategy

Facet-rebuild work (Phase 1, and everything in this plan going forward) lives on `feat/facet-rebuild`, not `feat/concept-pages-prototype` — see the branch note under Phase 1. Continue phase-per-branch or fold Phase 2 onto the same branch as Phase 1 (they're tightly coupled — Phase 2 literally consumes Phase 1's facet system) — Tim's call when Phase 2 starts.

---

## 5. What this plan does not cover

- Actual visual/component design beyond what's already built (dropdown/combobox styling is done; conditional-copy placement is an open question noted under Phase 2).
- Content authoring for the sidebar (Phase 0 decision 5) if it ends up needing new curated framing beyond existing facet values.
- Committee sign-off process for the in-flight `feat/concept-pages-prototype` branch — unrelated, tracked separately in `HANDOFF.md`.

---

## 6. Resuming this work

1. Tim reviews the uncommitted Phase 1 work on `feat/facet-rebuild` (`FacetCombobox.tsx`, `LessonFilter.tsx`, `lessons.css`, `tests/a11y/flows.spec.ts`, `package.json`). Commit once approved.
2. Start Phase 2: Getting-Started-as-Topic-value and Educator-as-Audience-value, both with conditional copy rendering; remove the two hardcoded sections in `lessons.astro`; relink the homepage's 3 cards (fixes the duplicate-URL bug on "Browse all lessons" / "Planning instruction?" identified above).
3. Resolve the Phase 2 open question (conditional-copy placement) before or during implementation — quick visual comparison, not a big decision.
4. After Phase 2 ships, re-assess Phase 3 scope — likely much smaller than originally filed.
