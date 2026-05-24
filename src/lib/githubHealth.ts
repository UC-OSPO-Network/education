export type CffAuthor =
  | { family: string | null; given: string | null; orcid: string | null; affiliation: string | null }
  | { name: string };

export type Citation = {
  source: 'cff' | 'default';
  title: string | null;
  doi: string | null;
  version: string | null;
  dateReleased: string | null;
  license: string | null;
  authors: CffAuthor[];
};

export type HealthRecord = {
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
  updatedAt: string | null;
  contributorCount: number | null;
  contributorCountTruncated: boolean;
  license: string | null;
  archived: boolean;
  citation: Citation | null;
};

export type HealthSnapshot = {
  fetchedAt: string | null;
  lessons: Record<string, HealthRecord>;
};

/**
 * Format a CffAuthor array into an APA-style author string.
 * Falls back to the raw `authorString` when no CFF authors exist.
 */
export function formatAuthorsApa(authors: CffAuthor[], authorString?: string): string {
  if (authors.length > 0) {
    return authors
      .map((a) => {
        if ('name' in a) return a.name;
        const last = a.family ?? '';
        const initials = a.given ? a.given.split(/\s+/).map((p) => `${p[0]}.`).join(' ') : '';
        return initials ? `${last}, ${initials}` : last;
      })
      .join(', ');
  }
  if (authorString) {
    // Strip email addresses from strings like "Name, email@domain.com"
    return authorString.replace(/,?\s+\S+@\S+\.\S+/g, '').trim();
  }
  return 'UC OSPO Network';
}

/**
 * Format a CffAuthor array for BibTeX author field.
 */
export function formatAuthorsBibtex(authors: CffAuthor[], authorString?: string): string {
  if (authors.length > 0) {
    return authors
      .map((a) => {
        // Wrap organization names in double braces so BibTeX treats them as literals
        if ('name' in a) return `{${a.name}}`;
        const last = a.family ?? '';
        const given = a.given ?? '';
        return given ? `${last}, ${given}` : last;
      })
      .join(' and ');
  }
  if (authorString) {
    return authorString.replace(/,?\s+\S+@\S+\.\S+/g, '').trim();
  }
  return 'UC OSPO Network';
}
