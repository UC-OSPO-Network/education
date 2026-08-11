// "audiences" is who a lesson is designed to teach (a learner-intent axis), not who's
// currently browsing the catalog — so this isn't a lesson-filter grid. It's collection-level
// orientation for evaluating an externally-hosted resource before adopting it, since the
// catalog metadata doesn't (yet) capture teaching readiness per lesson.
//
// Rendered conditionally in LessonFilter when the Educator audience facet is selected
// (see Phase 2 of docs/PLAN-lessons-education-redesign-2026-08-04.md).

export interface EducatorToolkitItem {
  title: string;
  body: string;
}

export const EDUCATOR_TOOLKIT_ITEMS: EducatorToolkitItem[] = [
  {
    title: "Check the intended learners and prerequisites",
    body: "Every lesson lists an educational level and, where available, prerequisite lessons. Confirm those match your audience before assigning it.",
  },
  {
    title: "Look at what the source actually includes",
    body: "This catalog links out — it doesn't mirror content. Open the lesson itself to see whether it has setup instructions, exercises, and solutions, since that varies a lot by source.",
  },
  {
    title: "Treat the listed duration as an estimate",
    body: "Time required reflects the source's own estimate, not a guarantee. It may not account for discussion, breaks, or your students' pace.",
  },
  {
    title: "Check the license before adapting",
    body: "Confirm what the source license actually permits — most catalog lessons are openly licensed, but terms vary.",
  },
  {
    title: "Do a technical walkthrough before class",
    body: "If a lesson requires specific tools or accounts, run through setup yourself first — external material isn't tested against your environment.",
  },
  {
    title: "Tell us how it went",
    body: "Report that you taught a lesson (see the lesson's own page) — that builds a real record of what's actually being used, for future instructors and for this program's own reporting.",
  },
];
