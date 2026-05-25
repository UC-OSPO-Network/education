import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import type { NormalizedCitation } from './citation';
import type { CffAuthor } from './githubHealth';

// undefined = not yet loaded; null = file missing or unreadable
let _catalog: NormalizedCitation | null | undefined = undefined;

export function getCatalogCitation(): NormalizedCitation | null {
  if (_catalog !== undefined) return _catalog;

  try {
    const raw = readFileSync(resolve(process.cwd(), 'CITATION.cff'), 'utf-8');
    const cff = yaml.load(raw) as Record<string, unknown>;

    const authors: CffAuthor[] = ((cff.authors as unknown[]) ?? []).map((a) => {
      const author = a as Record<string, string>;
      return {
        family: author['family-names'] ?? null,
        given: author['given-names'] ?? null,
        orcid: author.orcid ?? null,
        affiliation: author.affiliation ?? null,
      };
    });

    _catalog = {
      source: 'catalog',
      title: String(cff.title ?? 'UC OSPO Education'),
      authors,
      year: String(cff['date-released'] ?? new Date().getFullYear()).slice(0, 4),
      version: cff.version ? String(cff.version) : null,
      doi: null,
      url: String(cff.url ?? ''),
      publisher: 'UC OSPO Network',
    };
  } catch {
    _catalog = null;
  }

  return _catalog;
}
