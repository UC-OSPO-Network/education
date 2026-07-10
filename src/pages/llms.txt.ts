import type { APIRoute } from 'astro';
import { getActiveLessons } from '../lib/lessons';
import { getCollection } from 'astro:content';
import { absoluteUrl, absoluteFileUrl } from '../lib/urls';

export const GET: APIRoute = async (context) => {
  const [lessons, pathways] = await Promise.all([
    getActiveLessons(),
    getCollection('pathways'),
  ]);

  const sortedPathways = pathways.sort((a, b) => a.data.order - b.data.order);

  const lines: string[] = [
    '# UC OSPO Education',
    '> Curated open source education lessons from the UC OSPO Network.',
    '',
    `Site: ${absoluteUrl(context.site, '/')}`,
    `Lessons: ${absoluteUrl(context.site, 'lessons')}`,
    `Pathways: ${absoluteUrl(context.site, 'pathways')}`,
    `RSS: ${absoluteFileUrl(context.site, 'rss.xml')}`,
    `API (JSON): ${absoluteFileUrl(context.site, 'api/lessons.json')}`,
    '',
    '## Pathways',
  ];

  for (const pathway of sortedPathways) {
    lines.push(`- ${pathway.data.name}: ${absoluteUrl(context.site, `pathways/${pathway.id}`)}`);
    lines.push(`  ${pathway.data.description}`);
  }

  lines.push('', '## Lessons');

  for (const lesson of lessons) {
    const slug = lesson.slug;
    const pathwayNames = lesson.pathways
      .map((id) => sortedPathways.find((p) => p.id === id)?.data.name)
      .filter(Boolean)
      .join(', ');
    lines.push(`- [${lesson.name}](${absoluteUrl(context.site, `lessons/${slug}`)})`);
    if (lesson.description) lines.push(`  ${lesson.description}`);
    if (pathwayNames) lines.push(`  Pathways: ${pathwayNames}`);
    if (lesson.educationalLevel) lines.push(`  Level: ${lesson.educationalLevel}`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
