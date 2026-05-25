export interface Provider {
  name: string;
  url: string;
  shortDescription: string;
  domainFocus: string;
}

export const PROVIDER_CATALOG: Record<string, Provider> = {
  'UC Davis DataLab': {
    name: 'UC Davis DataLab',
    url: 'https://datalab.ucdavis.edu',
    shortDescription: 'An interdisciplinary research and training center housed within the UC Davis Library, supporting data-driven discovery across all research domains through workshops, office hours, and collaborative projects.',
    domainFocus: 'Data science, spatial analysis, bioinformatics, and applied research computing across disciplines.',
  },
  'GitHub / Open Source Guides': {
    name: 'GitHub Open Source Guides',
    url: 'https://opensource.guide',
    shortDescription: 'A collection of community resources created and maintained by GitHub to help individuals and organizations start, grow, and sustain open source projects.',
    domainFocus: 'Open source governance, community management, project sustainability, and contributor culture.',
  },
  'INTERSECT': {
    name: 'INTERSECT',
    url: 'https://intersect-training.org',
    shortDescription: 'An NSF-funded initiative delivering expert-led bootcamps and courses in research software engineering, targeting intermediate and advanced computational researchers who need formal training beyond introductory programming.',
    domainFocus: 'Research software engineering — software design, testing, packaging, documentation, and collaborative development.',
  },
  'The Carpentries Incubator': {
    name: 'The Carpentries Incubator',
    url: 'https://carpentries-incubator.org',
    shortDescription: 'The official community lesson development platform of The Carpentries, providing infrastructure and peer review for community members to develop and publish new lessons across research computing domains.',
    domainFocus: 'Broad research computing and data science; lessons span any domain where Carpentries-style instruction applies.',
  },
  'CodeRefinery': {
    name: 'CodeRefinery',
    url: 'https://coderefinery.org',
    shortDescription: 'A Nordic e-Infrastructure Collaboration (NeIC)-funded training network operating since 2016, equipping academic researchers with software tools and practices for reusable, reproducible, and open research.',
    domainFocus: 'Research software development essentials: version control, testing, documentation, reproducibility, and collaborative workflows.',
  },
  'The Turing Way': {
    name: 'The Turing Way',
    url: 'https://book.the-turing-way.org',
    shortDescription: 'An open, community-driven handbook developed under the Alan Turing Institute covering reproducibility, project design, ethics, and collaboration — authored by hundreds of contributors across the research community.',
    domainFocus: 'Research reproducibility, open science workflows, project design, and community best practices.',
  },
  'HSF Training': {
    name: 'HEP Software Foundation Training',
    url: 'https://hepsoftwarefoundation.org/activities/training.html',
    shortDescription: 'A training program within the HEP Software Foundation building shared computing curricula for particle physics researchers, focused on workforce development for the High-Luminosity LHC era.',
    domainFocus: 'Research software and computing for high-energy physics — from software engineering fundamentals to HEP-specific frameworks and machine learning.',
  },
  'MolSSI': {
    name: 'Molecular Sciences Software Institute (MolSSI)',
    url: 'https://education.molssi.org',
    shortDescription: 'An NSF-funded institute serving as a training hub for the global computational molecular sciences community, using a Carpentries-inspired model and a Software Fellows program to build a distributed network of domain-specific trainers.',
    domainFocus: 'Computational molecular science — Python programming, software best practices, and domain-specific tools for chemistry and materials science.',
  },
  'UC Carpentries': {
    name: 'UC Carpentries',
    url: 'https://uc-carpentries.github.io',
    shortDescription: 'A University of California initiative delivering Carpentries-style data and software skills training across UC campuses.',
    domainFocus: 'Data science and software skills for UC researchers.',
  },
};

export function lookupProvider(name: string): Provider | null {
  return PROVIDER_CATALOG[name] ?? null;
}
