// Controlled topic vocabulary, published as a schema.org DefinedTermSet.
//
// Each of the 13 topics carries a stable local URI (via `termCode`) and an
// external crosswalk anchor (the closest authoritative scheme), so the topics
// are machine-readable and formally grounded, not just local strings. Anchors
// follow the topic-taxonomy validation report (ACM CCS / CHAOSS / FAIR4RS /
// OpenSSF / WCAG / RSE competencies / The Turing Way).
//
// The term set lives at /lessons/topic; each term at /lessons/topic/<termCode>,
// which doubles as the human browse page (#5) and the DefinedTerm @id (#2).

export interface TopicCrosswalk {
  /** Human label for the external authority. */
  label: string;
  /** Canonical URI of the external scheme (SKOS closeMatch target). */
  uri: string;
}

export interface TopicTerm {
  /** Canonical name; must match the `topics` enum in content/config.ts. */
  name: string;
  /** Stable slug used in the term URI and as schema.org termCode. */
  termCode: string;
  /** Short description for the term/landing page. */
  description: string;
  /** Closest external authority for formal crosswalk semantics. */
  crosswalk: TopicCrosswalk;
}

/** Path of the DefinedTermSet (and the browse-by-topic index). */
export const TERM_SET_PATH = "/lessons/topic";

export const TOPIC_TERMS: TopicTerm[] = [
  {
    name: "Version Control & Collaborative Development",
    termCode: "version-control-collaborative-development",
    description:
      "Tracking changes with Git and collaborating through branches, pull requests, and shared repositories.",
    crosswalk: { label: "RSE Competencies (F1000Research)", uri: "https://f1000research.com/articles/13-1429" },
  },
  {
    name: "Documentation & Technical Writing",
    termCode: "documentation-technical-writing",
    description: "Writing READMEs, tutorials, API references, and other documentation that helps people use and contribute to software.",
    crosswalk: { label: "The Turing Way", uri: "https://book.the-turing-way.org/" },
  },
  {
    name: "Licensing, Copyright & Reuse",
    termCode: "licensing-copyright-reuse",
    description: "Choosing and applying open source licenses, and understanding copyright, attribution, and the terms of reuse.",
    crosswalk: { label: "Open Source Definition (OSI)", uri: "https://opensource.org/osd" },
  },
  {
    name: "Community, Governance & Conduct",
    termCode: "community-governance-conduct",
    description: "Building healthy communities: codes of conduct, governance models, inclusive communication, and contributor relations.",
    crosswalk: { label: "The Turing Way", uri: "https://book.the-turing-way.org/" },
  },
  {
    name: "Project Planning, Maintenance & Sustainability",
    termCode: "project-planning-maintenance-sustainability",
    description: "Planning, maintaining, and sustaining a project over time: workload, roadmaps, and keeping contributors engaged.",
    crosswalk: {
      label: "CHAOSS: Contributor Sustainability",
      uri: "https://chaoss.community/practitioner-guide-contributor-sustainability/",
    },
  },
  {
    name: "Quality, Testing, Review & Automation",
    termCode: "quality-testing-review-automation",
    description: "Testing, code review, continuous integration, and automation that keep software correct and maintainable.",
    crosswalk: { label: "RSE Competencies (F1000Research)", uri: "https://f1000research.com/articles/13-1429" },
  },
  {
    name: "Software Design & Engineering Practices",
    termCode: "software-design-engineering-practices",
    description: "Designing and structuring software well: modularity, architecture, and general software engineering practice.",
    crosswalk: { label: "RSE Competencies (F1000Research)", uri: "https://f1000research.com/articles/13-1429" },
  },
  {
    name: "Packaging, Release & Distribution",
    termCode: "packaging-release-distribution",
    description: "Packaging software for Python, R, and other ecosystems, and releasing and distributing it to users.",
    crosswalk: { label: "RSE Competencies (F1000Research)", uri: "https://f1000research.com/articles/13-1429" },
  },
  {
    name: "Reproducibility, Environments & Workflows",
    termCode: "reproducibility-environments-workflows",
    description: "Reproducible computational environments and workflows using containers, environment management, and pipelines.",
    crosswalk: { label: "The Turing Way", uri: "https://book.the-turing-way.org/" },
  },
  {
    name: "Open Science, FAIR & Research Software Metadata",
    termCode: "open-science-fair-research-software-metadata",
    description: "Making research software findable, accessible, interoperable, and reusable: citation, metadata, and discoverability.",
    crosswalk: { label: "FAIR4RS Principles (RDA)", uri: "https://doi.org/10.15497/RDA00068" },
  },
  {
    name: "Project Health, Metrics & Assessment",
    termCode: "project-health-metrics-assessment",
    description: "Measuring and assessing the health, viability, and risk of open source projects.",
    crosswalk: { label: "CHAOSS: Assessing Viability", uri: "https://chaoss.community/practitioner-guide-viability/" },
  },
  {
    name: "Security & Supply Chain",
    termCode: "security-supply-chain",
    description: "Securing source code, dependencies, and the software supply chain.",
    crosswalk: { label: "OpenSSF SCM Best Practices", uri: "https://best.openssf.org/SCM-BestPractices/" },
  },
  {
    name: "Accessibility & Inclusive Design",
    termCode: "accessibility-inclusive-design",
    description: "Making software and its documentation usable by everyone, including people with disabilities.",
    crosswalk: { label: "WCAG (W3C)", uri: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
  },
];

const BY_NAME = new Map(TOPIC_TERMS.map((t) => [t.name, t]));
const BY_CODE = new Map(TOPIC_TERMS.map((t) => [t.termCode, t]));

export function topicByName(name: string): TopicTerm | undefined {
  return BY_NAME.get(name);
}

export function topicByCode(code: string): TopicTerm | undefined {
  return BY_CODE.get(code);
}

/** Absolute @id for a term, e.g. https://ucospo.net/lessons/topic/<code>. */
export function termId(site: URL | undefined, termCode: string): string {
  return new URL(`${TERM_SET_PATH}/${termCode}`, site ?? "https://ucospo.net").href;
}

/** Absolute @id for the DefinedTermSet itself. */
export function termSetId(site: URL | undefined): string {
  return new URL(TERM_SET_PATH, site ?? "https://ucospo.net").href;
}
