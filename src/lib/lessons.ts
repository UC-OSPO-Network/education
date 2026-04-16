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
  // Additional Metadata Fields
  topic?: string;
  sortingId?: string;
  dependsOn: string[];
  prerequisiteNotes: string;
  learningObjectives?: string;
  ospoRelevance?: string;
  about?: string;
  abstract?: string;
  accessibilitySummary?: string;
  audience?: string;
  competencyRequired?: string;
  contributor?: string;
  creativeWorkStatus?: string;
  dateCreated?: string;
  dateModified?: string;
  datePublished?: string;
  hasPart?: string;
  identifier?: string;
  isPartOf?: string;
  notes?: string;
  mentions?: string;
  recordedAt?: string;
  teaches?: string;
  version?: string;
  workTranslation?: string;
};

/**
 * Formats ISO 8601 duration (e.g. PT1H30M) into human-readable text (e.g. 1h 30m)
 */
export function formatDuration(duration: string | undefined | null): string {
  if (!duration || !duration.startsWith('PT')) return duration || '';

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const match = duration.match(regex);
  if (!match) return duration;

  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? `${match[2]}m` : '';

  return `${hours} ${minutes}`.trim();
}

export async function getLessons(): Promise<Lesson[]> {
  const entries = await getCollection('lessons');
  return entries.map((entry) => {
    const data = entry.data;
    // Normalize keywords to string for backward compatibility with UI
    const keywords = Array.isArray(data.keywords)
      ? data.keywords.join(', ')
      : data.keywords || '';

    // Handle ossRole and oss_role
    const oss_role = String(data.ossRole ?? data.oss_role ?? '');
    const dependsOn = Array.isArray(data.dependsOn)
      ? data.dependsOn.filter((value) => typeof value === 'string' && value.trim() !== '')
      : [];
    const prerequisiteNotes = typeof data.prerequisiteNotes === 'string' ? data.prerequisiteNotes : '';

    return {
      ...data,
      // Collection entry id is derived from filename and is our canonical slug.
      slug: entry.id,
      keywords,
      oss_role,
      dependsOn,
      prerequisiteNotes,
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
