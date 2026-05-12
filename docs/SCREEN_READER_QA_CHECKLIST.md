# Screen Reader QA Checklist

Use this checklist for release-level confidence. VoiceOver on macOS is the default local pass; NVDA on Windows is recommended when a release changes navigation, filtering, or page templates.

## Setup

- Build and preview the site, or use a deployed preview that serves the site under `/education/`.
- Run `npm run check-a11y:all` first so manual time focuses on experience quality.
- Test with keyboard only before turning on the screen reader.

## VoiceOver Quick Commands

- Start or stop VoiceOver: `Command + F5`
- Move to next item: `Control + Option + Right Arrow`
- Move to previous item: `Control + Option + Left Arrow`
- Activate current item: `Control + Option + Space`
- Open rotor: `Control + Option + U`

## Core Pages

Check:

- `/education/`
- `/education/lessons/`
- One lesson detail page, such as `/education/lessons/introduction-to-git/`
- `/education/pathways/`
- One pathway detail page, such as `/education/pathways/getting-started/`
- `/education/develop-a-lesson/`
- `/education/for-educators/`

## Required Checks

- Page title and first heading clearly identify the page.
- Landmarks expose useful regions, especially primary navigation and main content.
- The skip link appears on first Tab and moves users to main content.
- Heading navigation follows a logical order.
- Primary navigation can be opened and closed by keyboard.
- Dropdown/menu buttons announce expanded or collapsed state.
- Links and buttons have useful accessible names.
- Lesson filter fields are announced with labels.
- Typing in lesson search updates results without losing usable focus.
- Clear Filters is reachable, understandable, and resets the results.
- Lesson detail pages read in a sensible order from title through metadata and body sections.
- Pathway pages read in a sensible order from title through lesson groups.
- Focus never gets trapped in navigation, filters, or page content.
- Decorative icons or images are not announced as noisy content.

## Record Results

For release notes or PR comments, record:

- Screen reader and browser used.
- Pages checked.
- Any blockers found.
- Any follow-up issues opened.
