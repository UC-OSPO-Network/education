/**
 * Fetches GitHub repository health signals and CITATION.cff data for all
 * lessons. Writes a slug-keyed snapshot to src/data/github-health.json for use
 * at build time.
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
    const parts = u.pathname.split('/').filter(Boolean);

    if (u.hostname === 'github.com') {
      if (parts.length < 2) return null;
      return {
        owner: parts[0],
        repo: parts[1].replace(/\.git$/, ''),
      };
    }

    const pagesMatch = u.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
    if (pagesMatch && parts.length >= 1) {
      return {
        owner: pagesMatch[1],
        repo: parts[0],
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getLessonSlug(file, lesson) {
  const fromLesson = typeof lesson.slug === 'string' ? lesson.slug.trim() : '';
  return fromLesson || file.replace(/\.json$/, '');
}

function getLessonRepo(lesson) {
  return parseGithubRepo(lesson.repoUrl?.trim()) ?? parseGithubRepo(lesson.url?.trim());
}

function repoKey({ owner, repo }) {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function repoUrl({ owner, repo }) {
  return `https://github.com/${owner}/${repo}`;
}

function formatDate(isoString) {
  if (!isoString) return null;
  return isoString.slice(0, 10);
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) return { ok: false, status: res.status, data: null };
  return { ok: true, status: res.status, data: await res.json() };
}

async function fetchContentPath(owner, repo, path, headers) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  return await res.json();
}

function decodeContent(content) {
  if (!content?.content || content.encoding !== 'base64') return '';
  return Buffer.from(content.content, 'base64').toString('utf8');
}

function normaliseFundingGithubValue(value) {
  if (Array.isArray(value)) return value.find(Boolean) ?? null;
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

async function fetchFunding(owner, repo, headers) {
  const paths = ['.github/FUNDING.yml', 'FUNDING.yml'];

  for (const path of paths) {
    const file = await fetchContentPath(owner, repo, path, headers);
    if (!file) continue;

    let sponsorsUrl = `https://github.com/sponsors/${owner}`;
    try {
      const funding = yaml.load(decodeContent(file));
      if (funding && typeof funding === 'object') {
        const githubSponsor = normaliseFundingGithubValue(funding.github);
        if (githubSponsor) {
          sponsorsUrl = `https://github.com/sponsors/${githubSponsor}`;
        }
      }
    } catch {
      // Presence is enough to display the sustainable funding signal.
    }

    return { hasFunding: true, sponsorsUrl };
  }

  return { hasFunding: false, sponsorsUrl: null };
}

async function fetchCodeOfConduct(owner, repo, headers) {
  const profile = await fetchJson(
    `https://api.github.com/repos/${owner}/${repo}/community/profile`,
    headers,
  );

  if (profile.ok && profile.data?.files?.code_of_conduct) {
    return true;
  }

  const paths = [
    'CODE_OF_CONDUCT.md',
    'CODE_OF_CONDUCT',
    '.github/CODE_OF_CONDUCT.md',
    'docs/CODE_OF_CONDUCT.md',
  ];

  for (const path of paths) {
    if (await fetchContentPath(owner, repo, path, headers)) return true;
  }

  return false;
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
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
      (a) => a['family-names'] === 'FIXME' || a['given-names'] === 'FIXME' || a.name === 'FIXME',
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

  if (!res.ok && branch !== 'master') {
    res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/master/CITATION.cff`,
      { headers },
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
    console.warn('    CITATION.cff is an unfilled template — skipping');
    return null;
  }

  const authors = Array.isArray(cff.authors)
    ? cff.authors.map(normaliseCffAuthor).filter(Boolean)
    : [];

  let doi = cff.doi ?? null;
  if (!doi && Array.isArray(cff.identifiers)) {
    const doiEntry = cff.identifiers.find(
      (id) => id.type === 'doi' || (id.type === 'url' && String(id.value ?? '').includes('doi.org')),
    );
    if (doiEntry) {
      doi = String(doiEntry.value).replace('https://doi.org/', '').replace('http://doi.org/', '');
    }
  }

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
    { headers },
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

  const [citation, funding, hasCodeOfConduct] = await Promise.all([
    fetchCitation(owner, repo, data.default_branch, headers),
    fetchFunding(owner, repo, headers),
    fetchCodeOfConduct(owner, repo, headers),
  ]);

  if (citation) {
    console.log(
      `    CITATION.cff found — ${citation.authors.length} author(s)${citation.doi ? ', DOI: ' + citation.doi : ''}`,
    );
  } else {
    console.log('    No CITATION.cff');
  }

  return {
    repoUrl: data.html_url ?? repoUrl({ owner, repo }),
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    pushedAt: formatDate(data.pushed_at),
    updatedAt: formatDate(data.updated_at),
    contributorCount,
    contributorCountTruncated,
    license: data.license?.spdx_id ?? null,
    archived: data.archived ?? false,
    sponsorsUrl: funding.sponsorsUrl,
    hasFunding: funding.hasFunding,
    hasCodeOfConduct,
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

  const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json')).sort();
  const lessons = files.map((file) => {
    const lesson = JSON.parse(readFileSync(join(lessonsDir, file), 'utf8'));
    return { file, lesson, slug: getLessonSlug(file, lesson), parsed: getLessonRepo(lesson) };
  });

  const uniqueRepos = new Map();
  for (const item of lessons) {
    if (!item.parsed) continue;
    const key = repoKey(item.parsed);
    if (!uniqueRepos.has(key)) uniqueRepos.set(key, item.parsed);
  }

  console.log(`\nFetching health + citations for ${uniqueRepos.size} unique repos (${files.length} lessons)...\n`);

  const healthByRepo = new Map();
  let fetched = 0;
  let skipped = 0;

  for (const [key, parsed] of uniqueRepos) {
    console.log(`  Fetch: ${parsed.owner}/${parsed.repo}`);
    const health = await fetchRepoHealth(parsed.owner, parsed.repo, headers);
    healthByRepo.set(key, health);

    if (health) {
      fetched++;
      console.log(
        `    stars=${health.stars} pushed=${health.pushedAt} contributors=${health.contributorCount}${health.contributorCountTruncated ? '+' : ''}`,
      );
    } else {
      skipped++;
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  const results = {};
  for (const item of lessons) {
    results[item.slug] = item.parsed ? healthByRepo.get(repoKey(item.parsed)) ?? null : null;
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
