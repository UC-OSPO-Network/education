#!/usr/bin/env node
// One-off pathway reconciliation (HANDOFF #1).
//
// Pathways become a pure journey-stage facet now that subject lives in the
// Topic facet. Four stages survive: getting-started (Start here),
// contributing (Contribute — incl. technical craft), maintaining (Maintain),
// strategic (Lead & sustain). The `building-communities` and `licensing`
// pathways retire (their lessons are covered by the Topic facet).
//
// Each lesson gets exactly one stage. Mapping is explicit by slug — this is a
// curated migration, not a rule-based normalizer.
//
// Usage:
//   node scripts/migrate-pathways.mjs            # dry run (default)
//   node scripts/migrate-pathways.mjs --write    # persist changes

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/lessons";
const WRITE = process.argv.includes("--write");

// slug -> target pathway stage
const TARGET = {
  // Start here
  "what-is-open-source": "getting-started",
  "introduction-to-git": "getting-started",
  "making-good-pull-requests": "getting-started",
  "your-first-web-contribution": "getting-started",
  "how-to-contribute-to-open-source": "getting-started",
  "social-coding-and-open-source-collaboration": "getting-started",
  "understanding-software-licensing": "getting-started",
  "starting-an-open-source-project": "getting-started", // was maintaining

  // Contribute (incl. technical craft, moved out of maintaining)
  "collaboration-in-open-research-projects": "contributing",
  "collaborative-git-for-teams": "contributing",
  "issue-tracking-with-github": "contributing",
  "writing-documentation-for-software-projects": "contributing",
  "building-better-research-software": "contributing",
  "cicd-for-research-software-with-gitlab-ci": "contributing",
  "continuous-integration-and-delivery-with-github-actions": "contributing",
  "good-enough-practices-in-scientific-computing": "contributing",
  "intermediate-research-software-development-skills-python-lesson-material": "contributing",
  "introduction-to-docker-for-research-note-this-is-now-called-introduction-to-docker-and-podman": "contributing",
  "modular-programming-with-python": "contributing",
  "python-package-development-best-practices": "contributing",
  "python-packaging": "contributing",
  "python-packaging-for-beginners": "contributing",
  "r-packaging": "contributing",
  "reproducible-computational-environments-using-containers": "contributing",
  "reproducible-research": "contributing",
  "research-software-engineering-with-python-course": "contributing",
  "research-software-citable-discoverable": "contributing",
  "testing-and-test-driven-development": "contributing",
  "unit-testing-and-tdd-in-python": "contributing",

  // Maintain
  "best-practices-for-maintainers": "maintaining",
  "maintaining-balance-for-open-source-maintainers": "maintaining",
  "effective-code-review": "maintaining",
  "security-best-practices-for-your-project": "maintaining",
  "accessibility-best-practices-for-your-project": "maintaining",

  // Lead & sustain
  "getting-paid-for-open-source-work": "strategic",
  "metrics-model-oss-project-viability-strategy": "strategic",
  "metrics-model-starter-project-health": "strategic",
  "metrics": "strategic", // was maintaining
  "finding-users-for-your-project": "strategic", // was maintaining
  "building-community": "strategic", // was building-communities
  "leadership-and-governance": "strategic", // was building-communities
  "code-of-conduct": "strategic", // was building-communities
  "the-legal-side-of-open-source": "strategic", // was licensing
};

const isKept = (d) => (d.keepStatus ?? "keepCandidate") !== "drop" && (d.url ?? "").trim() !== "";

const changes = [];
const unmapped = [];
const dist = {};

for (const file of readdirSync(DIR)) {
  if (!file.endsWith(".json")) continue;
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!isKept(data)) continue;

  const slug = data.slug;
  const target = TARGET[slug];
  if (!target) {
    unmapped.push(slug);
    continue;
  }

  dist[target] = (dist[target] ?? 0) + 1;
  const before = (data.pathways ?? []).join("+");
  if (before === target) continue;

  changes.push({ slug, before: before || "—", after: target });
  if (WRITE) {
    data.pathways = [target];
    writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  }
}

console.log(`\n${WRITE ? "WROTE" : "DRY RUN —"} ${changes.length} pathway change(s):\n`);
for (const c of changes) {
  console.log(`  ${c.slug}\n      ${c.before}  ->  ${c.after}`);
}
console.log("\nResulting distribution:");
for (const [k, v] of Object.entries(dist).sort()) console.log(`  ${k.padEnd(18)} ${v}`);
if (unmapped.length) {
  console.log(`\n⚠ ${unmapped.length} kept lesson(s) NOT in the map (left unchanged):`);
  unmapped.forEach((s) => console.log(`  ${s}`));
}
if (!WRITE) console.log("\nRe-run with --write to persist.");
