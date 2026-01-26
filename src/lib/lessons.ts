import { getCollection } from 'astro:content';

export type Lesson = {
  slug: string;
  name: string;
  keepStatus: 'keep' | 'keepCandidate' | 'drop';
  description: string;
  url: string;
  learnerCategory: string;
  educationalLevel: string;
  oss_role: string;
  subTopic: string;
  learningResourceType: string;
  keywords: string;
};

export async function getLessons(): Promise<Lesson[]> {
  const entries = await getCollection('lessons');
  return entries.map((entry) => ({ slug: entry.id, ...entry.data }));
}

export async function getActiveLessons(): Promise<Lesson[]> {
  const lessons = await getLessons();
  return lessons.filter(
    (lesson) =>
      (lesson.keepStatus === 'keep' || lesson.keepStatus === 'keepCandidate') &&
      lesson.url.trim() !== ''
  );
}
