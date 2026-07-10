#!/usr/bin/env node
/**
 * Checks lesson freshness and prints a markdown report body to stdout.
 *
 * Split by provenance, not a uniform dateModified check:
 * - Lessons we authored ourselves: checked against our own dateModified/
 *   dateCreated. We own the content, so staleness here is actionable.
 * - Curated (external) lessons: checked against the source repo's last
 *   push (src/data/github-health.json, refreshed weekly by
 *   refresh-github-health.yml) and whether that repo is now archived.
 *   Our own dateModified for these mostly reflects when we last touched
 *   the catalog entry, not whether the underlying lesson is current, so
 *   it isn't a meaningful signal on its own.
 *
 * Usage:
 *   node .github/scripts/check-staleness.mjs            # markdown report to stdout
 *   node .github/scripts/check-staleness.mjs --json      # JSON report to stdout
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const STALE_MONTHS = 18;
const LESSONS_DIR = join(REPO_ROOT, 'src/content/lessons');
const HEALTH_FILE = join(REPO_ROOT, 'src/data/github-health.json');
const LESSON_SITE_BASE = 'https://ucospo.net/education/lessons';
const CREATOR_ORG = 'UC OSPO Network';

const now = new Date();

function isCreatedByUs(lesson) {
  if ((lesson.provider || '').trim() === CREATOR_ORG) return true;
  const haystack = `${lesson.repoUrl || ''} ${lesson.url || ''}`.toLowerCase();
  return haystack.includes('uc-ospo-network') || haystack.includes('ucospo.net');
}

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  const date = isoMatch ? new Date(`${trimmed}T00:00:00Z`) : new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthsSince(date) {
  return (now.getUTCFullYear() - date.getUTCFullYear()) * 12 + (now.getUTCMonth() - date.getUTCMonth());
}

function isStale(date) {
  const monthDiff = monthsSince(date);
  return monthDiff > STALE_MONTHS || (monthDiff === STALE_MONTHS && now.getUTCDate() > date.getUTCDate());
}

export function buildReport() {
  const health = JSON.parse(readFileSync(HEALTH_FILE, 'utf8'));
  const healthLessons = health.lessons || {};

  const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.json')).sort();

  const ownContentStale = [];
  const curatedStale = [];
  const curatedArchived = [];
  const unknownFreshness = [];
  let checked = 0;

  for (const file of files) {
    const lesson = JSON.parse(readFileSync(join(LESSONS_DIR, file), 'utf8'));
    if (lesson.keepStatus === 'drop') continue;
    if (lesson.creativeWorkStatus === 'Archived') continue;
    checked += 1;

    const slug = (lesson.slug && lesson.slug.trim()) || file.replace(/\.json$/, '');

    if (isCreatedByUs(lesson)) {
      const dateStr = (lesson.dateModified || lesson.dateCreated || '').trim();
      if (!dateStr) continue;
      const d = parseDate(dateStr);
      if (d && isStale(d)) {
        ownContentStale.push({ slug, name: lesson.name, dateStr, monthsOld: monthsSince(d) });
      }
      continue;
    }

    const h = healthLessons[slug];
    if (!h) {
      unknownFreshness.push({ slug, name: lesson.name });
      continue;
    }
    if (h.archived) {
      curatedArchived.push({ slug, name: lesson.name, repoUrl: lesson.repoUrl });
      continue;
    }
    const pushedAtStr = h.pushedAt;
    if (!pushedAtStr) {
      unknownFreshness.push({ slug, name: lesson.name });
      continue;
    }
    const pushedDate = parseDate(pushedAtStr);
    if (pushedDate && isStale(pushedDate)) {
      curatedStale.push({
        slug,
        name: lesson.name,
        pushedAtStr,
        monthsOld: monthsSince(pushedDate),
        repoUrl: lesson.repoUrl,
      });
    }
  }

  return {
    checked,
    healthFetchedAt: health.fetchedAt || null,
    ownContentStale,
    curatedStale,
    curatedArchived,
    unknownFreshness,
  };
}

export function renderMarkdown(report) {
  const { checked, healthFetchedAt, ownContentStale, curatedStale, curatedArchived, unknownFreshness } = report;
  const totalFlagged = ownContentStale.length + curatedStale.length + curatedArchived.length;
  const lines = [];

  lines.push('## Content staleness report');
  lines.push('');
  lines.push(
    `${checked} active lessons checked. ${totalFlagged} flagged for review` +
      (unknownFreshness.length > 0 ? `, ${unknownFreshness.length} with unknown freshness.` : '.'),
  );
  if (healthFetchedAt) {
    lines.push(`Source-repo freshness data last refreshed: ${healthFetchedAt}.`);
  }
  lines.push('');

  if (ownContentStale.length > 0) {
    lines.push(`### Lessons we authored — ${ownContentStale.length} not updated in ${STALE_MONTHS}+ months`);
    lines.push('');
    lines.push('We own this content, so these are directly actionable.');
    lines.push('');
    for (const l of ownContentStale) {
      lines.push(`- [${l.name}](${LESSON_SITE_BASE}/${l.slug}) — last modified ${l.dateStr} (${l.monthsOld} months ago)`);
    }
    lines.push('');
  }

  if (curatedArchived.length > 0) {
    lines.push(`### Curated lessons whose source repo is now archived — ${curatedArchived.length}`);
    lines.push('');
    lines.push('The upstream project is archived. Consider whether to keep, replace, or drop these.');
    lines.push('');
    for (const l of curatedArchived) {
      lines.push(`- [${l.name}](${LESSON_SITE_BASE}/${l.slug}) — [${l.repoUrl}](${l.repoUrl})`);
    }
    lines.push('');
  }

  if (curatedStale.length > 0) {
    lines.push(`### Curated lessons with a stale source repo — ${curatedStale.length}`);
    lines.push('');
    lines.push(`Source repo hasn't been pushed to in ${STALE_MONTHS}+ months. May indicate an unmaintained project.`);
    lines.push('');
    for (const l of curatedStale) {
      lines.push(
        `- [${l.name}](${LESSON_SITE_BASE}/${l.slug}) — [source](${l.repoUrl}) last pushed ${l.pushedAtStr} (${l.monthsOld} months ago)`,
      );
    }
    lines.push('');
  }

  if (unknownFreshness.length > 0) {
    lines.push(`<details><summary>Unknown freshness — ${unknownFreshness.length} lessons (no repo health data)</summary>`);
    lines.push('');
    for (const l of unknownFreshness) {
      lines.push(`- [${l.name}](${LESSON_SITE_BASE}/${l.slug})`);
    }
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  lines.push('_This report is regenerated in place each run by the Lesson Staleness Check workflow. It is not a checklist — items drop off automatically once the underlying data changes (repo re-activated, dateModified updated, or the lesson set to keepStatus: drop)._');

  return lines.join('\n');
}

function main() {
  const report = buildReport();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(renderMarkdown(report));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
