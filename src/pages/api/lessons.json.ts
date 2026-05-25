import type { APIRoute } from 'astro';
import { getLessons } from '../../lib/lessons';
import type { HealthSnapshot } from '../../lib/githubHealth';
import githubHealthRaw from '../../data/github-health.json';

const healthData = githubHealthRaw as unknown as HealthSnapshot;

export const GET: APIRoute = async () => {
  const lessons = await getLessons();
  const siteUrl = 'https://ucospo.net/education';
  const healthLessons = healthData.lessons ?? {};

  const catalog = lessons
    .filter((l) => l.keepStatus !== 'drop')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((l) => {
      const health = l.repoUrl ? healthLessons[l.repoUrl] ?? null : null;
      return {
        name: l.name,
        slug: l.slug,
        url: `${siteUrl}/lessons/${l.slug}`,
        externalUrl: l.url || null,
        repoUrl: l.repoUrl || null,
        description: l.description || null,
        abstract: l.abstract || null,
        domain: l.domain || null,
        pathways: l.pathways.length > 0 ? l.pathways : null,
        educationalLevel: l.educationalLevel || null,
        learningResourceType: l.learningResourceType || null,
        keywords: l.keywords,
        author: l.author || null,
        license: l.license || null,
        timeRequired: l.timeRequired || null,
        keepStatus: l.keepStatus,
        githubHealth: health
          ? {
              lastUpdated: health.pushedAt ?? null,
              stars: health.stars ?? 0,
              forks: health.forks ?? 0,
              contributors: health.contributorCount ?? null,
              openIssues: health.openIssues ?? 0,
              archived: health.archived ?? false,
              citation: health.citation ?? null,
              fetchedAt: healthData.fetchedAt ?? null,
            }
          : null,
      };
    });

  return new Response(JSON.stringify({ lessons: catalog }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
