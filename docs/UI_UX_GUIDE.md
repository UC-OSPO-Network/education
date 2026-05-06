# UI/UX Implementation Guide

This document is the shared implementation guide for UI work in this repo. Use it when building new UI issues so the site stays visually consistent and two people can work in parallel without creating incompatible local component variants.

## Current Design Direction

The current homepage/category system uses rounded expandable panels and lesson cards, not folder-tab silhouettes. If that visual direction changes again, update this guide and the issue descriptions before implementation starts.

## Source Of Truth

- Global design tokens live in `public/styles.css`.
- Shared homepage primitives live in `src/components/home/`.
- General reusable cards/navigation components live in `src/components/`.
- Page-level composition belongs in `src/pages/`, but page files should consume shared primitives rather than redefining their own card/tab styles.

## Typography

Use the global font tokens from `public/styles.css`:

```css
font-family: var(--font-sans);
```

```css
font-family: var(--font-mono);
```

Current token values:

| Token | Usage |
| --- | --- |
| `--font-sans` | UI text, headings, labels, navigation, card text |
| `--font-mono` | Code snippets, `pre`, `code`, technical text |
| `--font-size-base` | Root/base font size |

Current UI stack:

```css
"Helvetica Neue", Helvetica, Arial, sans-serif
```

Typography rules:

- Do not hard-code a new `font-family` in component/page CSS unless there is a strong reason and the token set is updated first.
- Prefer `600` or `700` for headings and section labels.
- Prefer `400` or `500` for body text and supporting metadata.
- Keep heading text readable in both light and dark modes by using `var(--text-primary)` or `var(--text-secondary)`.

## Radius System

Use the global corner-radius tokens from `public/styles.css` instead of hard-coded radius values.

| Token | Value | Intended Use |
| --- | --- | --- |
| `--radius-xs` | `4px` | Small nav links, compact buttons, small controls |
| `--radius-sm` | `8px` | Default buttons, dropdowns, small cards, inputs |
| `--radius-md` | `12px` | Standard cards, content panels, medium containers |
| `--radius-lg` | `16px` | Larger cards or emphasized panels |
| `--radius-xl` | `24px` | Large mobile panels or softer section containers |
| `--radius-2xl` | `32px` | Large homepage/marketing panels and expanded category shells |
| `--radius-pill` | `999px` | Pills, badges, circular markers, round CTA buttons |

Radius rules:

- Do not introduce one-off values like `10px`, `14px`, `50px`, or `2rem` unless the token scale is intentionally updated.
- Use `--radius-pill` for fully rounded buttons/badges instead of `50px` or `50%`.
- If a component needs asymmetrical corners, still compose from the token scale, for example:

```css
border-radius: var(--radius-xs) var(--radius-xs) 0 0;
```

## Color And Theme Tokens

Use semantic theme tokens for neutral surfaces and text so light/dark mode works automatically:

| Token | Usage |
| --- | --- |
| `--bg-primary` | Page background and outer shells |
| `--bg-surface` | Card backgrounds and inner content panels |
| `--bg-surface-strong` | Stronger panel contrast, selected/expanded surfaces |
| `--text-primary` | Main readable text |
| `--text-secondary` | Descriptions, supporting copy, subdued metadata |
| `--border-light` | Subtle borders and separators |
| `--border-strong` | Hover/active borders and stronger outlines |

UC brand tokens are still available for accents:

| Token | Recommended Use |
| --- | --- |
| `--uc-blue` | Branded headers, links, emphasized accents |
| `--uc-gold` | CTA buttons, highlights, focus outlines |
| `--uc-light-blue`, `--uc-light-gold` | Hover/supporting brand accents |

Theme rules:

- Do not hard-code dark-only or light-only neutral colors in shared components.
- Prefer `--bg-*`, `--text-*`, and `--border-*` for cards, panels, body copy, and separators.
- Use UC brand colors intentionally for accents, not as a substitute for surface/text tokens.
- If a component needs custom hover states, derive them from existing tokens or `color-mix(...)` instead of introducing a new fixed hex value.

## Shared Component Contracts

### `CategoryPanel`

File: `src/components/home/CategoryPanel.tsx`

Use this for expandable homepage pathway/category panels.

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `icon` | `ReactNode` | Usually a `CategoryIcon` |
| `title` | `string` | Category heading |
| `description` | `string?` | Supporting text shown in the panel header |
| `active` | `boolean?` | Whether the panel is expanded |
| `onSelect` | `() => void` | Makes the header interactive |
| `children` | `ReactNode?` | Expanded content area |
| `actionLabel` | `string?` | Optional footer link label |
| `href` | `string?` | Optional footer link destination |

Implementation rule:

- Do not re-style `CategoryPanel` from page files with custom class overrides. If the shared primitive needs a behavior or visual change, update the component/CSS in `src/components/home/` and coordinate with other branch owners.

### `CategoryIcon`

File: `src/components/home/CategoryIcon.tsx`

Supported icon names are defined in `src/components/home/types.ts`:

```ts
'getting-started' | 'contributing' | 'maintaining' | 'building-communities' | 'licensing' | 'strategic'
```

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `name` | `CategoryIconName` | One of the supported pathway ids |
| `size` | `number?` | Icon size in pixels |
| `decorative` | `boolean?` | Use `true` when surrounding text already labels the icon |

### `LessonPreviewCard`

File: `src/components/home/LessonPreviewCard.tsx`

Use this for compact homepage lesson previews inside a category panel.

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `lesson` | `Lesson` | Data object from `src/lib/lessons` |
| `pathwayIcon` | `ReactNode?` | Optional category icon shown next to the lesson title |
| `compact` | `boolean?` | Uses the compact card height/styling |

Behavior:

- Links to `lessons/{lesson.slug}` using `import.meta.env.BASE_URL`.
- Displays a color-coded skill band based on `educationalLevel`.
- Shows `learningResourceType` or `subTopic` as top metadata.
- Shows up to two `oss_role` labels.

### `LessonRail`

File: `src/components/home/LessonRail.tsx`

Use this for horizontal rows of `LessonPreviewCard`.

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Section heading |
| `lessons` | `Lesson[]` | Card data |
| `pathwayIcon` | `ReactNode?` | Optional icon forwarded to `LessonPreviewCard` |
| `showProgress` | `boolean?` | Enables the horizontal scroll indicator |
| `initialVisibleCount` | `number?` | Used when calculating overflow/progress behavior |

Behavior:

- Scrolls horizontally when cards overflow.
- Renders a progress indicator only when the rail actually has horizontal overflow.
- The indicator thumb tracks the current scroll position.

### `PathwayCard`

File: `src/components/PathwayCard.astro`

Use this for pathway cards that link to `/pathways/{id}`.

## Layout And Spacing Rules

Use existing page patterns unless there is a reason to change the layout system for a whole section.

Recommended baseline:

| UI Area | Desktop | Mobile |
| --- | --- | --- |
| Main content side padding | `2rem` | `1rem` |
| Page section max width | `1200px` or `78rem` depending on section family | full width within side padding |
| Grid gaps | `1.5rem` to `2rem` | `1rem` to `1.5rem` |
| Card internal padding | `1rem` to `1.75rem` | reduce only if needed for narrow screens |

Layout rules:

- Do not create a new max-width or breakpoint system per page unless the shared pattern is insufficient.
- Keep responsive behavior predictable at the existing breakpoints already used in the repo, especially `768px` and `960px`.
- For content-heavy cards, avoid overly tight vertical spacing. Preserve enough padding so hover/focus outlines and shadows do not visually collide.
- Horizontal card rails should preserve scroll snap and must not hide focus outlines.

## Interaction Rules

- Hover should not change text color accidentally because of global `a:hover`; override that inside card links when needed.
- Keyboard focus must remain visible with `:focus-visible`.
- Interactive container headers should use native `<button>` or `<a>` elements, not clickable `<div>` wrappers.
- Expand/collapse interactions should set ARIA state where relevant, such as `aria-pressed={active}`.
- Horizontal scroll indicators should reflect actual scroll position, not just card count.

## Accessibility Rules

- Preserve heading order. If a section needs a heading for structure but not for visible UI, use a visually hidden heading.
- Mark decorative icons with `aria-hidden="true"`. Use an accessible label only when the icon itself carries meaning not already present in nearby text.
- Maintain contrast in both themes by relying on `--text-*`, `--bg-*`, and `--border-*`.
- Do not remove focus outlines. If the default focus style is visually weak, replace it with a stronger `:focus-visible` style using `--uc-gold`.
- Make sure cards and panel headers are fully keyboard operable.

## Collaboration Rules

- One person should own shared primitives in `src/components/home/` at a time. Page implementers should consume those primitives instead of creating one-off variants.
- If a page issue needs a new prop or style variant on a shared component, update the shared primitive first and keep the API change small and explicit.
- Avoid parallel edits to the same shared CSS selectors. If two branches both need `src/components/home/home.css`, coordinate file ownership before implementation.
- Prefer issue-specific branches and small PRs. Avoid landing unrelated style-system changes in a page-specific PR unless the dependency is called out.

## UI PR Checklist

- [ ] Reused existing shared primitives instead of rebuilding a local variant.
- [ ] Used `--font-*`, `--radius-*`, `--bg-*`, `--text-*`, and `--border-*` tokens where applicable.
- [ ] Did not introduce hard-coded neutral colors for surfaces/text in shared UI.
- [ ] Verified hover, focus-visible, and active/expanded states.
- [ ] Checked desktop and mobile layouts.
- [ ] Checked light and dark theme rendering.
- [ ] Preserved heading order and keyboard interaction.
- [ ] Included screenshots or a short visual summary in the PR description.
- [ ] Ran `npm run build`.

## When To Update This Guide

Update this document whenever one of these changes:

- a global design token is added, renamed, or deprecated
- a shared homepage primitive API changes
- a page-level pattern becomes a shared pattern
- a visual convention changes, such as card radius, typography, or theme behavior
