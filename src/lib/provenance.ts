// Curated (external resource we selected) vs. Created (we authored it).
// Kept dependency-free so it can be imported by client components — importing
// from lessons.ts would pull in the server-only `astro:content` module.

// The organization that authors the lessons we create ourselves.
export const CREATOR_ORG = 'UC OSPO Network';

/**
 * True if we authored this lesson (vs. curated it from an external source).
 * Signal: provider is our org, or the source/repo lives in our namespace.
 */
export function isCreatedByUs(lesson: {
  provider?: string | null;
  repoUrl?: string | null;
  url?: string | null;
}): boolean {
  if ((lesson.provider ?? '').trim() === CREATOR_ORG) return true;
  const haystack = `${lesson.repoUrl ?? ''} ${lesson.url ?? ''}`.toLowerCase();
  return haystack.includes('uc-ospo-network') || haystack.includes('ucospo.net');
}
