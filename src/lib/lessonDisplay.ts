// Dependency-free (no astro:content import) so client-side components — LessonCard.jsx,
// LessonFilter.tsx, exportPlan.ts — can import it directly without dragging a server-only
// module into the browser bundle. lib/lessons.ts re-exports these for server-side callers.

export function formatDuration(duration: string | undefined | null): string {
  if (!duration?.startsWith('PT')) return duration ?? '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  return [match[1] ? `${match[1]}h` : '', match[2] ? `${match[2]}m` : ''].filter(Boolean).join(' ');
}

// Self-study material (guides, references) is read at the learner's own pace,
// so a "time to teach" badge isn't meaningful — only show it for taught formats.
export const SELF_STUDY_TYPES = new Set(['guide', 'reference', 'article']);

export function teachingTime(lesson: { timeRequired?: string | null; learningResourceType?: string | null }): string {
  const type = (lesson.learningResourceType ?? '').toLowerCase().trim();
  if (SELF_STUDY_TYPES.has(type)) return '';
  return formatDuration(lesson.timeRequired);
}
