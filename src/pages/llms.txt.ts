import type { APIRoute } from 'astro';
import { getActiveLessons } from '../lib/lessons';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async (context) => {
  const [lessons, pathways] = await Promise.all([
    getActiveLessons(),
    getCollection('pathways'),
  ]);

  const sortedPathways = pathways.sort((a, b) => a.data.order - b.data.order);
  const base = context.site?.toString().replace(/\/$/, '') ?? '';

  const lines: string[] = [
    '# UC OSPO Education',
    '> Curated open source education lessons from the UC OSPO Network.',
    '',
    `Site: ${base}/education/`,
    `Lessons: ${base}/education/lessons`,
    `Pathways: ${base}/education/pathways`,
    `RSS: ${base}/education/rss.xml`,
    '',
    '## Pathways',
  ];

  for (const pathway of sortedPathways) {
    lines.push(`- ${pathway.data.name}: ${base}/education/pathways/${pathway.id}`);
    lines.push(`  ${pathway.data.description}`);
  }

  lines.push('', '## Lessons');

  for (const lesson of lessons) {
    const slug = lesson.slug;
    const pathwayNames = lesson.pathways
      .map((id) => sortedPathways.find((p) => p.id === id)?.data.name)
      .filter(Boolean)
      .join(', ');
    lines.push(`- [${lesson.name}](${base}/education/lessons/${slug})`);
    if (lesson.description) lines.push(`  ${lesson.description}`);
    if (pathwayNames) lines.push(`  Pathways: ${pathwayNames}`);
    if (lesson.educationalLevel) lines.push(`  Level: ${lesson.educationalLevel}`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
