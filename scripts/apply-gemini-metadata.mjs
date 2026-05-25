import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LESSONS_DIR = path.join(__dirname, '../src/content/lessons');

const updates = [
  { "slug": "best-practices-for-maintainers", "domain": "General Open Source" },
  { "slug": "building-better-research-software", "domain": "Research Software", "subTopic": "Packaging", "audience": "Researchers, Research Software Engineers" },
  { "slug": "building-community", "domain": "General Open Source" },
  { "slug": "cicd-for-research-software-with-gitlab-ci", "domain": "Research Software", "subTopic": "Testing" },
  { "slug": "collaboration-in-open-research-projects", "domain": "Research Software", "subTopic": "Community Management" },
  { "slug": "collaborative-git-for-teams", "domain": "General Open Source", "subTopic": "Version Control Basics" },
  { "slug": "continuous-integration-and-delivery-with-github-actions", "domain": "General Open Source", "subTopic": "Testing" },
  { "slug": "effective-code-review", "domain": "General Open Source", "subTopic": "Community Management" },
  { "slug": "finding-users-for-your-project", "domain": "General Open Source", "subTopic": "Community Management" },
  { "slug": "how-to-contribute-to-open-source", "domain": "General Open Source", "audience": "Beginners, Software Developers", "ossRole": "Contributor" },
  { "slug": "intermediate-python-development", "domain": "Research Software", "subTopic": "Software Design Patterns" },
  { "slug": "intermediate-research-software-development-skills-python-lesson-material", "domain": "Research Software", "subTopic": "Testing", "audience": "Graduate Students, Research Software Engineers" },
  { "slug": "introduction-to-docker-for-research", "domain": "Research Software", "subTopic": "Reproducible Research" },
  { "slug": "introduction-to-git", "domain": "General Open Source" },
  { "slug": "issue-tracking-with-github", "domain": "General Open Source", "subTopic": "Version Control Basics" },
  { "slug": "leadership-and-governance", "domain": "General Open Source" },
  { "slug": "making-good-pull-requests", "domain": "General Open Source" },
  { "slug": "metrics", "domain": "General Open Source", "subTopic": "Community Management" },
  { "slug": "modular-programming-with-python", "domain": "Research Software", "subTopic": "Software Design Patterns" },
  { "slug": "python-package-development-best-practices", "domain": "Research Software", "subTopic": "Packaging" },
  { "slug": "python-packaging-for-beginners", "domain": "Research Software", "subTopic": "Packaging" },
  { "slug": "python-packaging", "domain": "General Open Source", "subTopic": "Packaging", "audience": "Software Developers, Contributors" },
  { "slug": "r-packaging", "domain": "Data Science", "subTopic": "Packaging", "audience": "Researchers, Graduate Students, Data Scientists" },
  { "slug": "reproducible-computational-environments-using-containers", "domain": "Research Software", "subTopic": "Reproducible Research", "audience": "Researchers, Graduate Students" },
  { "slug": "reproducible-research", "domain": "Research Software", "subTopic": "Reproducible Research" },
  { "slug": "research-software-engineering-with-python-course", "domain": "Research Software", "subTopic": "Software Design Patterns" },
  { "slug": "social-coding-and-open-source-collaboration", "domain": "General Open Source" },
  { "slug": "starting-an-open-source-project", "domain": "General Open Source", "subTopic": "Open Source Literacy" },
  { "slug": "testing-and-test-driven-development", "domain": "General Open Source", "subTopic": "Testing" },
  { "slug": "understanding-software-licensing", "domain": "Institutional Policy" },
  { "slug": "unit-testing-and-tdd-in-python", "domain": "Research Software", "subTopic": "Testing" },
  { "slug": "what-is-open-source", "audience": "Beginners, Researchers, Library Staff" },
  { "slug": "writing-documentation-for-software-projects", "domain": "General Open Source", "subTopic": "Open Source Literacy" },
  { "slug": "your-first-web-contribution", "audience": "Beginners, Software Developers" }
];

// Build slug → filepath map (match on slug field or filename prefix)
const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.json'));
const slugMap = {};
for (const file of files) {
  const filepath = path.join(LESSONS_DIR, file);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const slugFromFile = file.replace('.json', '');
  slugMap[slugFromFile] = filepath;
  if (data.slug) slugMap[data.slug] = filepath;
}

let applied = 0;
let skipped = 0;

for (const update of updates) {
  const { slug, ...fields } = update;

  // Try exact match, then prefix match
  let filepath = slugMap[slug];
  if (!filepath) {
    const match = files.find(f => f.startsWith(slug));
    if (match) filepath = path.join(LESSONS_DIR, match);
  }

  if (!filepath) {
    console.log(`⚠️  No file found for slug: ${slug}`);
    skipped++;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  let changed = false;

  for (const [key, value] of Object.entries(fields)) {
    if (!data[key] || data[key] === '') {
      data[key] = value;
      changed = true;
    } else {
      console.log(`  skip ${slug}.${key} (already set: "${data[key]}")`);
    }
  }

  if (changed) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
    console.log(`✅ Updated ${slug}`);
    applied++;
  }
}

console.log(`\nDone: ${applied} files updated, ${skipped} slugs not found.`);
