# Plan: /education + /lessons IA redesign (2026-08-04 WG meeting)

Status: all 4 phases shipped in code. #195 closed on GitHub 2026-08-11; #196-#201 are implemented but still open on GitHub pending Tim's call on closing them. Written 2026-08-04, updated 2026-08-11.

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
Phase 1 — Facet system rebuild (#197, #201)             ✅ shipped 2026-08-11
  ↓
Phase 2 — Facet-conditional entry points (#196, #198, #200, Educator/EducatorToolkit)  ✅ shipped 2026-08-11
  ↓
Phase 3 — /lessons page density cleanup (#195)          ✅ shipped 2026-08-11, issue closed
  ↓
Phase 4 — Sidebar navigation (#199)                     ✅ shipped 2026-08-11
```

### Phase 1 — Facet system rebuild (#197, #201) — done

Shipped 2026-08-06 on branch `feat/facet-rebuild`. All 6 facets (`role`, `educationalLevel`, `domain`, `learningResourceType`, `audience`, `topic`) now share one presentation model: a new `FacetCombobox` component (`src/components/FacetCombobox.tsx`, built on `@radix-ui/react-popover` + `@radix-ui/react-checkbox`, no Tailwind) — a labeled trigger showing the current selection as badges, opening a searchable multi-select checkbox list. Replaces the old two-tier system (`renderPromotedFacet` button rows for Audience/Topic vs. `<details>` accordions for everything else).

Preserved: URL param sync (`FILTER_QUERY_PARAMS`), live facet counts, the `noindex` script in `lessons.astro`, Workshop Planning Worksheet tray state.

Found and fixed in the same pass: a pre-existing broken assertion in `tests/a11y/flows.spec.ts` (`getByLabel("Topic").toHaveValue(...)` never matched the old button/details markup either — stale test, not a regression). Verified via a stashed baseline comparison: 10 pre-existing Playwright failures before this change, 8 after (the 2 fixed are exactly the ones rewritten); no new failures introduced. Remaining 8 are unrelated pre-existing issues (header search/pagefind indexing in the local preview build, a documented `.page-intro__note` color-contrast bug, a stale homepage-heading assertion from the 07-28 homepage rebuild).

**Branch note:** built on `feat/concept-pages-prototype` initially, then moved to a fresh branch `feat/facet-rebuild` (created from the same commit, so nothing was lost) once it became clear the redesign work shouldn't stack onto the prototype branch's in-review scope. Since `feat/concept-pages-prototype` hasn't merged to `main` yet, a PR from `feat/facet-rebuild` will currently carry its unmerged commits too (Educator persona addition, template fixes, etc.) until that branch lands — unavoidable for now, but at least the new commits don't live on the prototype branch's own ref. Committed 2026-08-11 (3 commits) and pushed to `jt14den-fork`.

---

### Phase 2 — Facet-conditional entry points (#196, #198, #200, Educator) — done

Shipped 2026-08-11 on `feat/facet-rebuild` (same branch as Phase 1, per the "tightly coupled" call in Section 4). 4 commits: Getting Started Topic value + tagging, Educator audience tagging (see note below), the conditional-copy wiring in `LessonFilter`, and the homepage relink.

**Found during verification, not in original scope:** the Educator audience value existed in the schema (added in `57218fc`) but had never been applied to any lesson — `audience=Educator` filtered to 0 of 43. Tagged all 25 lessons that are schema-eligible (`learningResourceType` is `workshop` or `course`, the refine() rule's own definition of "delivered by an instructor") with `Educator`, per Tim's call when this was flagged live in the browser check. Without this, Phase 2's new homepage "Planning instruction?" deep link would have sent visitors to an empty grid.

**Open implementation question, resolved:** conditional copy renders above the grid (same visual position Getting Started held before), not inline near the facet trigger — built one way, not revisited since; can still change if it reads wrong live.

**Why bundled:** all of these are implementations of the same decision (Section 2, principle above) — a static section becomes conditional content driven by facet selection. Building them separately risks the same "half-migrated" state Phase 1 avoided by bundling #197/#201.

**Scope, in build order:**
1. Add "Getting Started with Open Source" as a Topic value; tag the 8 current getting-started lessons with it. Show the pathway's existing intro copy (`src/content/pathways/getting-started.json`) only when that Topic value is selected — inline above the (now singular) grid, not as a separate section. Remove the hardcoded Getting Started section in `lessons.astro` (~lines 103-124) once the facet path is live; don't run both simultaneously past a short overlap window.
2. Make `EducatorToolkit`'s checklist conditional on `audience=Educator` being selected, same mechanism as (1). Remove its current always-rendered placement in `lessons.astro` (~lines 126-132).
3. Rewrite the homepage's 3 route cards (`src/pages/index.astro` lines 36-56) to deep-link into real filtered `/lessons?...` states: "New to open source?" → `?topic=Getting+Started+with+Open+Source`, "Planning instruction?" → `?audience=Educator` (replacing its current duplicate-of-"Browse all" link with a genuinely distinct destination), "Browse all lessons" stays unscoped.
4. Confirm resulting copy/labels are consistent across both pages — mostly a pass once 1-3 are built, not separate engineering.

---

### Phase 3 — /lessons page density cleanup (#195) — done

Re-assessed after Phase 2 landed: confirmed live (screenshot + `gh issue view`) that /lessons now goes straight from the page intro (title + summary + 1 provenance note) into the filter panel and grid — down from the 4 stacked layers the issue described to 2. No code change was needed beyond what Phase 2 already did. Closed the issue with a comment explaining why (2026-08-11, [comment](https://github.com/UC-OSPO-Network/education/issues/195#issuecomment-5258237891)).

---

### Phase 4 — Sidebar navigation (#199) — done

Shipped 2026-08-11. Population question (Section 2, decision 5) resolved with Tim: **top 6 Topic facet values by live lesson count**, not a hand-curated list — computed the same way as `/lessons/topic`'s own sort, so it tracks tagging changes automatically rather than becoming a second thing to maintain. New `LessonsCategoryNav.astro`, two-column layout on `/lessons` (sidebar + filter/grid, styled after the existing global `.site-sidebar`), collapses to a horizontal scroll row under 768px. The page-intro's old "browse by subject" note was dropped as redundant with the sidebar's own "view all topics" link.

Considered and rejected: a mixed topic+audience list ("who are you / what are you doing" framing) — went with the simpler, purely-computed option instead.

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

All 4 phases are shipped (committed, pushed to `jt14den-fork/feat/facet-rebuild`), not yet opened as a PR against `origin`. #195 is closed on GitHub; #196-#201 are implemented but still open — Tim hasn't said whether to close them too.

1. Decide whether to close #196, #197, #198, #199, #200, #201 (and maybe #194 itself) now that all 4 phases are implemented, or leave them open until the PR merges.
2. Open a PR from `feat/facet-rebuild` once `feat/concept-pages-prototype` lands on `main`, or accept it'll carry that branch's unmerged commits until then (see Phase 1 branch note).
3. Nothing else from this plan is outstanding.
