/**
 * Fetches GitHub repository health signals and CITATION.cff data for all
 * lessons that have a repoUrl. Writes a snapshot to src/data/github-health.json
 * for use at build time.
 *
 * Usage:
 *   GITHUB_TOKEN=your_token node scripts/fetch-github-health.mjs
 *   node scripts/fetch-github-health.mjs   (unauthenticated, 60 req/hr limit)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

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

/**
 * Normalise a CITATION.cff author entry into a plain object.
 * CFF authors can be people {family-names, given-names, orcid, affiliation}
 * or entities {name}.
 */
function normaliseCffAuthor(a) {
  if (!a || typeof a !== 'object') return null;
  if (a['family-names'] || a['given-names']) {
    return {
      family: a['family-names'] ?? null,
      given: a['given-names'] ?? null,
      orcid: a.orcid ? String(a.orcid).replace('https://orcid.org/', '') : null,
      affiliation: a.affiliation ?? null,
    };
  }
  if (a.name) {
    return { name: a.name };
  }
  return null;
}

/**
 * Coerce a YAML date value to YYYY-MM-DD.
 * yaml.load parses unquoted YYYY-MM-DD values as JS Date objects.
 */
function coerceDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    // Already ISO — return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // Try parsing other formats
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Return true if the CFF file appears to be an unfilled template
 * (cffinit emits "FIXME" placeholders).
 */
function isCffTemplate(cff) {
  if (cff.title === 'FIXME') return true;
  if (Array.isArray(cff.authors)) {
    const allFixme = cff.authors.every(
      (a) => a['family-names'] === 'FIXME' || a['given-names'] === 'FIXME' || a.name === 'FIXME'
    );
    if (allFixme) return true;
  }
  return false;
}

/**
 * Try to fetch CITATION.cff from the repo's default branch.
 * Returns a structured citation object or null if not found / unparseable.
 */
async function fetchCitation(owner, repo, defaultBranch, headers) {
  const branch = defaultBranch || 'main';
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/CITATION.cff`;

  let res = await fetch(url, { headers });

  // Some repos use 'master' when defaultBranch wasn't returned
  if (!res.ok && branch !== 'master') {
    res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/master/CITATION.cff`,
      { headers }
    );
  }

  if (!res.ok) return null;

  const text = await res.text();
  let cff;
  try {
    cff = yaml.load(text);
  } catch {
    console.warn(`    CITATION.cff parse error for ${owner}/${repo}`);
    return null;
  }

  if (!cff || typeof cff !== 'object') return null;

  if (isCffTemplate(cff)) {
    console.warn(`    CITATION.cff is an unfilled template — skipping`);
    return null;
  }

  const authors = Array.isArray(cff.authors)
    ? cff.authors.map(normaliseCffAuthor).filter(Boolean)
    : [];

  // DOI can be top-level (cff.doi) or buried in identifiers[].value as a doi.org URL
  let doi = cff.doi ?? null;
  if (!doi && Array.isArray(cff.identifiers)) {
    const doiEntry = cff.identifiers.find(
      (id) => id.type === 'doi' || (id.type === 'url' && String(id.value ?? '').includes('doi.org'))
    );
    if (doiEntry) {
      doi = String(doiEntry.value).replace('https://doi.org/', '').replace('http://doi.org/', '');
    }
  }

  // version can sometimes be a non-sensible date string — keep only sane values
  const rawVersion = cff.version != null ? String(cff.version) : null;
  const version = rawVersion && rawVersion.length < 40 && !/GMT|UTC/.test(rawVersion)
    ? rawVersion
    : null;

  return {
    source: 'cff',
    title: cff.title ?? null,
    doi,
    version,
    dateReleased: coerceDate(cff['date-released']),
    license: cff.license ?? null,
    authors,
  };
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

  const citation = await fetchCitation(owner, repo, data.default_branch, headers);
  if (citation) {
    console.log(`    CITATION.cff found — ${citation.authors.length} author(s)${citation.doi ? ', DOI: ' + citation.doi : ''}`);
  } else {
    console.log(`    No CITATION.cff`);
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
    citation,
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

  // Collect unique repoUrls and which lessons map to them
  const repoMap = new Map();
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

  console.log(`\nFetching health + citations for ${repoMap.size} unique repos (${files.length} lessons)...\n`);

  const results = {};
  let fetched = 0;
  let skipped = 0;

  for (const [repoUrl, { parsed, names }] of repoMap) {
    const label = `${parsed.owner}/${parsed.repo}`;
    console.log(`  Fetch: ${label}  (${names.join(', ')})`);

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
