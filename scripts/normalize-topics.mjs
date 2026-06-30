import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');

const WRITE = process.argv.includes('--write');

/*
 * Topic normalization (per docs/ia-taxonomy-proposal.md).
 *
 * The Topic facet today is built from the raw `keywords` array: 127 distinct
 * values across 43 active lessons, unusable as a dropdown. This collapses
 * keywords onto an 11-term curated `topics` vocabulary. `keywords` stays in
 * frontmatter for full-text search; `topics` becomes the facet field.
 *
 * Mapped to null (= search-only, no topic):
 *   - Languages (python, r) and generic markers (best practices).
 *   - Generic OSS umbrella labels (open source, foss, open source basics, users,
 *     team development, research) — too broad to be discriminating facets.
 *   - Journey-stage markers (starting, quick win, contributing, first contribution)
 *     belong on the Pathway facet, handled separately, not as topics.
 *
 * Accessibility (accessibility, disability, wcag) is now its own topic
 * (Accessibility & Inclusive Design); the UI may suppress it while it has a
 * single lesson, but it stays in the metadata model.
 */

// 13-term vocabulary, revised per the GPT Deep Research validation
// (gpt-topic-taxonomy-validation-REPORT.md, 2026-06-29): split Software Design
// & Engineering Practices out of Quality; add Accessibility & Inclusive Design;
// rename five buckets; demote generic OSS umbrella terms to search-only.
export const TOPICS = [
  'Version Control & Collaborative Development',
  'Documentation & Technical Writing',
  'Licensing, Copyright & Reuse',
  'Community, Governance & Conduct',
  'Project Planning, Maintenance & Sustainability',
  'Quality, Testing, Review & Automation',
  'Software Design & Engineering Practices',
  'Packaging, Release & Distribution',
  'Reproducibility, Environments & Workflows',
  'Open Science, FAIR & Research Software Metadata',
  'Project Health, Metrics & Assessment',
  'Security & Supply Chain',
  'Accessibility & Inclusive Design',
];

const VC = 'Version Control & Collaborative Development';
const DOC = 'Documentation & Technical Writing';
const LIC = 'Licensing, Copyright & Reuse';
const COM = 'Community, Governance & Conduct';
const PROJ = 'Project Planning, Maintenance & Sustainability';
const QA = 'Quality, Testing, Review & Automation';
const SE = 'Software Design & Engineering Practices';
const PKG = 'Packaging, Release & Distribution';
const REPRO = 'Reproducibility, Environments & Workflows';
const OS = 'Open Science, FAIR & Research Software Metadata';
const HEALTH = 'Project Health, Metrics & Assessment';
const SEC = 'Security & Supply Chain';
const ACC = 'Accessibility & Inclusive Design';

// null === intentionally search-only (no topic). Every one of the 127 active
// keywords must appear here, or the script flags it as UNMAPPED.
const KEYWORD_TO_TOPIC = {
  // --- search-only: languages, generic markers, OSS umbrella, journey stages ---
  'python': null,
  'r': null,
  'best practices': null,
  'open source': null,
  'foss': null,
  'open source basics': null,
  'users': null,
  'team development': null,
  'research': null,
  'starting': null,        // → Pathway facet (separate migration)
  'quick win': null,       // → Pathway facet
  'contributing': null,    // → Pathway facet
  'first contribution': null, // → Pathway facet

  // --- Accessibility & Inclusive Design ---
  'accessibility': ACC,
  'disability': ACC,
  'wcag': ACC,

  // --- Version Control & Collaboration ---
  'git': VC,
  'github': VC,
  'github issues': VC,
  'github web interface': VC,
  'version control': VC,
  'source control': VC,
  'branching': VC,
  'merging': VC,
  'pull requests': VC,
  'repositories': VC,
  'collaboration': VC,
  'open collaboration': VC,
  'social coding': VC,
  'issue tracking': VC,
  'bug tracking': VC,

  // --- Documentation & Technical Writing ---
  'documentation': DOC,
  'technical writing': DOC,
  'markdown': DOC,
  'sphinx': DOC,

  // --- Licensing, Attribution & Reuse ---
  'licensing': LIC,
  'software licensing': LIC,
  'open source license': LIC,
  'open source licenses': LIC,
  'copyright': LIC,
  'legal': LIC,
  'legal compliance': LIC,
  'compliance': LIC,
  'contributor agreements': LIC,
  'reusability': [LIC, OS], // dual-fit: licensing enablement + FAIR reuse
  'software freedom': LIC,

  // --- Community, Governance & Conduct ---
  'community': COM,
  'community standards': COM,
  'governance': COM,
  'code of conduct': COM,
  'enforcement': COM,
  'harassment': COM,
  'inclusion': COM,
  'inclusivity': COM,
  'inclusive communication': COM,

  // --- Project Planning, Maintenance & Sustainability ---
  'maintainers': PROJ,
  'maintainer health': PROJ,
  'maintainer workflow': PROJ,
  'sustainability': PROJ,
  'funding': PROJ,
  'grants': PROJ,
  'sponsorship': PROJ,
  'open source business models': PROJ,
  'project management': PROJ,
  'project organization': PROJ,
  'leadership': PROJ,
  'strategic alignment': PROJ,
  'burnout': PROJ,
  'self-care': PROJ,
  'work-life balance': PROJ,
  'launch': PROJ,

  // --- Quality, Testing, Review & Automation ---
  'testing': QA,
  'unit testing': QA,
  'test-driven development': QA,
  'pytest': QA,
  'code review': QA,
  'peer review': QA,
  'ci/cd': QA,
  'continuous integration': QA,
  'github actions': QA,
  'gitlab ci': QA,
  'automation': QA,

  // --- Software Design & Engineering Practices ---
  'software design': SE,
  'software development': SE,
  'software engineering': SE,
  'code organization': SE,
  'modular programming': SE,

  // --- Packaging, Release & Distribution ---
  'packaging': PKG,
  'pypi': PKG,
  'pip': PKG,
  'setuptools': PKG,
  'r packages': PKG,
  'dependencies': PKG,
  'distribution': PKG,
  'software distribution': PKG,
  'deployment': PKG,

  // --- Reproducibility, Environments & Workflows ---
  'reproducibility': REPRO,
  'reproducible research': REPRO,
  'containers': REPRO,
  'docker': REPRO,
  'podman': REPRO,
  'scientific computing': REPRO,

  // --- Open Science, FAIR & Research Software Metadata ---
  'open science': OS,
  'fair software': OS,
  'metadata': OS,
  'research software': OS,
  'research software engineering': OS,
  'data management': OS,
  'citability': OS,
  'citation.cff': OS,
  'discoverability': OS,

  // --- Project Health, Metrics & Assessment ---
  'project health': HEALTH,
  'metrics': HEALTH,
  'chaoss': HEALTH,
  'impact': HEALTH,
  'adoption': HEALTH,
  'promotion': HEALTH,
  'bus factor': HEALTH,
  'elephant factor': HEALTH,
  'risk assessment': HEALTH,
  'project discovery': HEALTH,
  'project viability': HEALTH,
  'project success': HEALTH,

  // --- Security & Supply Chain ---
  'security': SEC,
  'code scanning': SEC,
  'vulnerability reporting': SEC,
  'mfa': SEC,
};

async function main() {
  const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));

  const topicCounts = Object.fromEntries(TOPICS.map((t) => [t, 0]));
  const noTopicLessons = [];
  const unmappedKeywords = new Set();
  let active = 0;
  let changed = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    if ((data.keepStatus || 'keepCandidate') === 'drop') continue;
    active++;

    const topics = new Set();
    for (const raw of data.keywords || []) {
      const key = raw.trim().toLowerCase();
      if (!(key in KEYWORD_TO_TOPIC)) {
        unmappedKeywords.add(key);
        continue;
      }
      const mapped = KEYWORD_TO_TOPIC[key];
      if (!mapped) continue; // null === search-only
      for (const topic of Array.isArray(mapped) ? mapped : [mapped]) topics.add(topic);
    }

    const sorted = [...topics].sort();
    sorted.forEach((t) => (topicCounts[t] += 1));
    if (sorted.length === 0) noTopicLessons.push(file);

    const before = JSON.stringify(data.topics || []);
    if (before !== JSON.stringify(sorted)) {
      changed++;
      if (WRITE) {
        data.topics = sorted;
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      }
    }
  }

  console.log('='.repeat(60));
  console.log(`TOPIC NORMALIZATION  (${WRITE ? 'WRITE' : 'DRY RUN — use --write to persist'})`);
  console.log('='.repeat(60));
  console.log(`Active lessons: ${active}   Files changed: ${changed}\n`);

  console.log(`Topic distribution (${TOPICS.length}-term vocab):`);
  for (const t of TOPICS) console.log(`  ${String(topicCounts[t]).padStart(2)}  ${t}`);

  if (unmappedKeywords.size) {
    console.log(`\n⚠ UNMAPPED keywords (${unmappedKeywords.size}) — add to KEYWORD_TO_TOPIC:`);
    [...unmappedKeywords].sort().forEach((k) => console.log(`  - ${k}`));
  } else {
    console.log('\n✓ All active keywords are mapped.');
  }

  if (noTopicLessons.length) {
    console.log(`\n⚠ Lessons with NO topic (${noTopicLessons.length}) — review keywords:`);
    noTopicLessons.forEach((f) => console.log(`  - ${f}`));
  } else {
    console.log('✓ Every active lesson resolved to at least one topic.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
