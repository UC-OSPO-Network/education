# Accessibility Guide

This project targets WCAG 2.1 AA for site UI and lesson browsing workflows. Automated checks help catch regressions, but contributors should still design and review changes with keyboard and screen-reader users in mind.

## Local Checks

Run the broad page scan:

```bash
npm run check-a11y
```

Run keyboard and interaction flows:

```bash
npm run check-a11y:flows
```

Run both layers:

```bash
npm run check-a11y:all
```

If port `4321` is already in use, choose another local port:

```bash
A11Y_PORT=4322 npm run check-a11y:all
```

## Contributor Expectations

- Use semantic HTML before ARIA. Prefer native links, buttons, headings, lists, form controls, and landmarks.
- Keep exactly one page-level `h1`; do not skip heading levels for visual sizing.
- Give every form control a visible or programmatic label.
- Ensure all interactive controls work with keyboard only.
- Preserve visible focus states and logical tab order.
- Use link and button text that makes sense out of context.
- Keep text and UI contrast at WCAG 2.1 AA levels.
- Avoid hover-only interactions; support focus and touch equivalents.
- Keep landmarks clear: header/navigation/main/footer should remain understandable in assistive technology.

## When To Add Playwright Flow Coverage

Add or update `tests/a11y/flows.spec.ts` when a change introduces:

- A new menu, disclosure, modal, filter, tab, or other interactive state.
- Keyboard behavior that must open, close, move focus, or preserve focus.
- A page-level workflow that pa11y cannot reach from the static loaded page.
- ARIA state changes such as `aria-expanded`, `aria-controls`, or dynamic result counts.

Use `@axe-core/playwright` after opening interactive states so the tested DOM matches what users actually encounter.

## Manual Review

Automated checks do not prove that a screen-reader experience is understandable. Use `docs/SCREEN_READER_QA_CHECKLIST.md` for release-level manual checks, especially after navigation, filtering, layout, or content-template changes.
