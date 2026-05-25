import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getActiveLessons } from '../lib/lessons';

export const GET: APIRoute = async (context) => {
  const lessons = await getActiveLessons();

  const items = lessons
    .filter((l) => l.dateModified || l.datePublished || l.dateCreated)
    .sort((a, b) => {
      const dateA = a.dateModified || a.datePublished || a.dateCreated || '';
      const dateB = b.dateModified || b.datePublished || b.dateCreated || '';
      return dateB.localeCompare(dateA);
    })
    .map((lesson) => {
      const pubDate = lesson.dateModified || lesson.datePublished || lesson.dateCreated;
      return {
        title: lesson.name,
        description: lesson.description || lesson.abstract || '',
        link: `${context.site}lessons/${lesson.slug}`,
        pubDate: pubDate ? new Date(pubDate) : undefined,
        categories: lesson.keywords,
      };
    });

  return rss({
    title: 'UC OSPO Education — New & Updated Lessons',
    description: 'Curated open source education lessons from the UC OSPO Network.',
    site: context.site!,
    items,
    customData: '<language>en-us</language>',
  });
};
