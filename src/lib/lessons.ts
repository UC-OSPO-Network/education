import { getCollection } from 'astro:content';

export type Lesson = {
  slug: string;
  name: string;
  keepStatus: 'keep' | 'keepCandidate' | 'drop';
  description: string;
  url: string;
  author?: string;
  license?: string;
  learnerCategory: string;
  educationalLevel: string;
  ossRole?: string;
  oss_role: string;
  subTopic: string;
  timeRequired?: string;
  learningResourceType: string;
  inLanguage?: string[];
  keywords: string;
};

export async function getLessons(): Promise<Lesson[]> {
  const entries = await getCollection('lessons');
  return entries.map((entry) => {
    const data = entry.data;
    // Normalize keywords to string for backward compatibility with UI
    const keywords = Array.isArray(data.keywords)
      ? data.keywords.join(', ')
      : data.keywords || '';

    // Handle ossRole and oss_role
    const oss_role = data.ossRole || data.oss_role || '';

    return {
      slug: entry.id,
      ...data,
      keywords,
      oss_role,
    } as Lesson;
  });
}

export async function getActiveLessons(): Promise<Lesson[]> {
  const lessons = await getLessons();
  return lessons.filter(
    (lesson) =>
      (lesson.keepStatus === 'keep' || lesson.keepStatus === 'keepCandidate') &&
      lesson.url.trim() !== ''
  );
}
