export interface Provider {
  name: string;
  url: string;
}

export const PROVIDER_CATALOG: Record<string, Provider> = {
  'UC Davis DataLab': {
    name: 'UC Davis DataLab',
    url: 'https://datalab.ucdavis.edu',
  },
  'The Carpentries': {
    name: 'The Carpentries',
    url: 'https://carpentries.org',
  },
  'The Carpentries Incubator': {
    name: 'The Carpentries Incubator',
    url: 'https://carpentries-incubator.github.io',
  },
  'CodeRefinery': {
    name: 'CodeRefinery',
    url: 'https://coderefinery.org',
  },
  'INTERSECT': {
    name: 'INTERSECT',
    url: 'https://intersect-training.org',
  },
  'GitHub / Open Source Guides': {
    name: 'GitHub / Open Source Guides',
    url: 'https://opensource.guide',
  },
  'The Turing Way': {
    name: 'The Turing Way',
    url: 'https://the-turing-way.org',
  },
  'HSF Training': {
    name: 'HSF Training',
    url: 'https://hsf-training.github.io',
  },
  'MolSSI': {
    name: 'MolSSI',
    url: 'https://molssi.org',
  },
  'UC Carpentries': {
    name: 'UC Carpentries',
    url: 'https://uc-carpentries.github.io',
  },
};

export function lookupProvider(name: string): Provider | null {
  return PROVIDER_CATALOG[name] ?? null;
}
