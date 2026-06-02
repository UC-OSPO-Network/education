import type { CffAuthor, Citation } from './githubHealth';

export type { CffAuthor, Citation };

export interface NormalizedCitation {
  source: 'cff' | 'metadata' | 'catalog';
  title: string;
  authors: CffAuthor[];
  year: string;
  version: string | null;
  doi: string | null;
  url: string;
  publisher: string;
}

export function normalizeCitation(params: {
  lessonName: string;
  lessonAuthor?: string;
  lessonUrl?: string;
  repoUrl?: string;
  cffCitation?: Citation | null;
  provider?: { name: string; url: string } | null;
  publisher?: string;
}): NormalizedCitation {
  const publisher = params.publisher ?? 'UC OSPO Network';

  if (params.cffCitation?.source === 'cff' && params.cffCitation.authors.length > 0) {
    return {
      source: 'cff',
      title: params.cffCitation.title ?? params.lessonName,
      authors: params.cffCitation.authors,
      year: params.cffCitation.dateReleased?.slice(0, 4) ?? String(new Date().getFullYear()),
      version: params.cffCitation.version,
      doi: params.cffCitation.doi,
      url: params.cffCitation.doi
        ? `https://doi.org/${params.cffCitation.doi}`
        : params.lessonUrl?.trim() || params.repoUrl?.trim() || '',
      publisher,
    };
  }

  if (params.lessonAuthor) {
    return {
      source: 'metadata',
      title: params.lessonName,
      authors: [{ name: params.lessonAuthor }],
      year: String(new Date().getFullYear()),
      version: null,
      doi: null,
      url: params.lessonUrl?.trim() || params.repoUrl?.trim() || '',
      publisher,
    };
  }

  if (params.provider) {
    return {
      source: 'metadata',
      title: params.lessonName,
      authors: [{ name: params.provider.name }],
      year: String(new Date().getFullYear()),
      version: null,
      doi: null,
      url: params.lessonUrl?.trim() || params.repoUrl?.trim() || params.provider.url,
      publisher: params.provider.name,
    };
  }

  return {
    source: 'metadata',
    title: params.lessonName,
    authors: [],
    year: String(new Date().getFullYear()),
    version: null,
    doi: null,
    url: params.lessonUrl?.trim() || params.repoUrl?.trim() || '',
    publisher,
  };
}

function formatAuthorApa(a: CffAuthor): string {
  if ('name' in a) return a.name;
  const last = a.family ?? '';
  const initials = a.given
    ? a.given
        .split(/\s+/)
        .map((p) => `${p[0]}.`)
        .join(' ')
    : '';
  return initials ? `${last}, ${initials}` : last;
}

function formatAuthorBibtex(a: CffAuthor): string {
  if ('name' in a) return `{${a.name}}`;
  const last = a.family ?? '';
  const given = a.given ?? '';
  return given ? `${last}, ${given}` : last;
}

export function renderApa(c: NormalizedCitation): string {
  const authors =
    c.authors.length > 0 ? c.authors.map(formatAuthorApa).join(', ') : c.publisher;
  return [
    `${authors} (${c.year}).`,
    `${c.title}.`,
    c.version ? `(Version ${c.version}).` : null,
    `${c.publisher}.`,
    c.url,
  ]
    .filter(Boolean)
    .join(' ');
}

export function renderBibtex(c: NormalizedCitation, id: string): string {
  const authors =
    c.authors.length > 0
      ? c.authors.map(formatAuthorBibtex).join(' and ')
      : `{${c.publisher}}`;
  const safeId = id.replace(/-/g, '_');
  return `@misc{${safeId}_${c.year},
  author    = {${authors}},
  title     = {${c.title}},
  year      = {${c.year}},
  publisher = {${c.publisher}},
  url       = {${c.url}}${c.doi ? `,\n  doi       = {${c.doi}}` : ''}${c.version ? `,\n  version   = {${c.version}}` : ''}
}`;
}
