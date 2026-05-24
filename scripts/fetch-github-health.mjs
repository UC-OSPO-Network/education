/**
 * Fetches GitHub repository health signals for all lessons that have a repoUrl.
 * Writes a snapshot to src/data/github-health.json for use at build time.
 *
 * Usage:
 *   GITHUB_TOKEN=your_token node scripts/fetch-github-health.mjs
 *   node scripts/fetch-github-health.mjs   (unauthenticated, 60 req/hr limit)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessonsDir = join(__dirname, '../src/content/lessons');
const outputPath = join(__dirname, '../src/data/github-health.json');

function parseGithubRepo(url) {
  if (!url || url === 'null') return null;
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

function formatDate(isoString) {
  if (!isoString) return null;
  return isoString.slice(0, 10);
}

async function fetchRepoHealth(owner, repo, headers) {
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

  if (repoRes.status === 404) {
    console.warn(`    404: ${owner}/${repo} — skipping`);
    return null;
  }
  if (!repoRes.ok) {
    console.warn(`    Error ${repoRes.status}: ${owner}/${repo} — skipping`);
    return null;
  }

  const data = await repoRes.json();

  const contribRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100&anon=false`,
    { headers }
  );
  let contributorCount = null;
  let contributorCountTruncated = false;
  if (contribRes.ok) {
    const contribs = await contribRes.json();
    if (Array.isArray(contribs)) {
      contributorCount = contribs.length;
      contributorCountTruncated = contribs.length === 100;
    }
  }

  return {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    pushedAt: formatDate(data.pushed_at),
    updatedAt: formatDate(data.updated_at),
    contributorCount,
    contributorCountTruncated,
    license: data.license?.spdx_id ?? null,
    archived: data.archived ?? false,
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('Warning: GITHUB_TOKEN not set — using unauthenticated (60 req/hr).');
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));

  // Collect unique repoUrls and which lesson files map to them
  const repoMap = new Map(); // repoUrl -> { parsed, files[] }
  for (const file of files) {
    const lesson = JSON.parse(readFileSync(join(lessonsDir, file), 'utf8'));
    const repoUrl = lesson.repoUrl?.trim();
    if (!repoUrl) continue;
    const parsed = parseGithubRepo(repoUrl);
    if (!parsed) {
      console.log(`  Skip: ${lesson.name} (no valid GitHub repo URL: ${repoUrl})`);
      continue;
    }
    if (!repoMap.has(repoUrl)) {
      repoMap.set(repoUrl, { parsed, names: [] });
    }
    repoMap.get(repoUrl).names.push(lesson.name);
  }

  console.log(`\nFetching health for ${repoMap.size} unique repos (${files.length} lessons)...\n`);

  const results = {};
  let fetched = 0;
  let skipped = 0;

  for (const [repoUrl, { parsed, names }] of repoMap) {
    const label = `${parsed.owner}/${parsed.repo}`;
    const lessons = names.join(', ');
    console.log(`  Fetch: ${label}  (${lessons})`);

    const health = await fetchRepoHealth(parsed.owner, parsed.repo, headers);
    if (health) {
      results[repoUrl] = health;
      fetched++;
      console.log(
        `    stars=${health.stars} pushed=${health.pushedAt} contributors=${health.contributorCount}${health.contributorCountTruncated ? '+' : ''}`
      );
    } else {
      skipped++;
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    lessons: results,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nDone. ${fetched} fetched, ${skipped} skipped. Written to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
