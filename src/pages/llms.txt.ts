import type { APIRoute } from 'astro';
import { getActiveLessons } from '../lib/lessons';
import { TOPIC_TERMS } from '../data/topics';
import { absoluteUrl, absoluteFileUrl } from '../lib/urls';

export const GET: APIRoute = async (context) => {
  const lessons = await getActiveLessons();

  const lines: string[] = [
    '# UC OSPO Education',
    '> Curated open source education lessons from the UC OSPO Network.',
    '',
    `Site: ${absoluteUrl(context.site, '/')}`,
    `Lessons: ${absoluteUrl(context.site, 'lessons')}`,
    `Topics: ${absoluteUrl(context.site, 'lessons/topic')}`,
    `RSS: ${absoluteFileUrl(context.site, 'rss.xml')}`,
    `API (JSON): ${absoluteFileUrl(context.site, 'api/lessons.json')}`,
    '',
    '## Topics',
  ];

  for (const term of TOPIC_TERMS) {
    lines.push(`- ${term.name}: ${absoluteUrl(context.site, `lessons/topic/${term.termCode}`)}`);
    lines.push(`  ${term.description}`);
  }

  lines.push('', '## Lessons');

  for (const lesson of lessons) {
    const slug = lesson.slug;
    lines.push(`- [${lesson.name}](${absoluteUrl(context.site, `lessons/${slug}`)})`);
    if (lesson.description) lines.push(`  ${lesson.description}`);
    if (lesson.topics.length) lines.push(`  Topics: ${lesson.topics.join(', ')}`);
    if (lesson.educationalLevel) lines.push(`  Level: ${lesson.educationalLevel}`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
