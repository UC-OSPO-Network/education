import { getCollection } from 'astro:content';

export type PrerequisiteRef =
  | { type: 'lesson'; value: string; label?: string }
  | { type: 'url'; value: string; label?: string }
  | { type: 'text'; value: string; label?: string };

export type Lesson = {
  slug: string;
  name: string;
  keepStatus: 'keep' | 'keepCandidate' | 'drop';
  description: string;
  abstract: string;
  url: string;
  repoUrl: string;
  domain: string;
  topic: string;
  subTopic: string;
  pathways: string[];
  educationalLevel: string;
  learningResourceType: string;
  author: string;
  provider: string;
  license: string;
  roles: string[];
  timeRequired: string;
  inLanguage: string[];
  keywords: string[];
  prerequisites: PrerequisiteRef[];
  prerequisiteNotes: string;
  sortingId: string;
  learningObjectives: string;
  ospoRelevance: string;
  dateCreated: string;
  dateModified: string;
  datePublished: string;
  creativeWorkStatus: string;
  audience: string;
  competencyRequired: string;
  contributor: string;
  teaches: string;
  version: string;
};

export function formatDuration(duration: string | undefined | null): string {
  if (!duration?.startsWith('PT')) return duration ?? '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  return [match[1] ? `${match[1]}h` : '', match[2] ? `${match[2]}m` : ''].filter(Boolean).join(' ');
}

export async function getLessons(): Promise<Lesson[]> {
  const entries = await getCollection('lessons');
  return entries.map((entry) => {
    const d = entry.data as Record<string, unknown>;

    // Back-compat: pathways from single learnerCategory string
    const pathways: string[] =
      Array.isArray(d.pathways) && (d.pathways as string[]).length > 0
        ? (d.pathways as string[])
        : typeof d.learnerCategory === 'string' && d.learnerCategory.trim()
          ? [d.learnerCategory as string]
          : [];

    // Back-compat: roles from comma-delimited ossRole string
    const roles: string[] =
      Array.isArray(d.roles) && (d.roles as string[]).length > 0
        ? (d.roles as string[])
        : typeof d.ossRole === 'string' && d.ossRole.trim()
          ? (d.ossRole as string).split(',').map((r: string) => r.trim()).filter(Boolean)
          : [];

    // Back-compat: prerequisites from dependsOn string array
    const prerequisites: PrerequisiteRef[] =
      Array.isArray(d.prerequisites) && (d.prerequisites as PrerequisiteRef[]).length > 0
        ? (d.prerequisites as PrerequisiteRef[])
        : Array.isArray(d.dependsOn)
          ? (d.dependsOn as string[])
              .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
              .map((v): PrerequisiteRef =>
                v.startsWith('http') ? { type: 'url', value: v } : { type: 'lesson', value: v }
              )
          : [];

    return {
      slug: entry.id,
      name: String(d.name ?? ''),
      keepStatus: (d.keepStatus as Lesson['keepStatus']) ?? 'keepCandidate',
      description: String(d.description ?? ''),
      abstract: String(d.abstract ?? ''),
      url: String(d.url ?? ''),
      repoUrl: String(d.repoUrl ?? ''),
      domain: String(d.domain ?? 'General Open Source'),
      topic: String(d.topic ?? ''),
      subTopic: String(d.subTopic ?? ''),
      pathways,
      educationalLevel: String(d.educationalLevel ?? 'Beginner'),
      learningResourceType: String(d.learningResourceType ?? 'tutorial'),
      author: String(d.author ?? ''),
      provider: String(d.provider ?? ''),
      license: String(d.license ?? ''),
      roles,
      timeRequired: String(d.timeRequired ?? ''),
      inLanguage: Array.isArray(d.inLanguage) ? (d.inLanguage as string[]) : [],
      keywords: Array.isArray(d.keywords) ? (d.keywords as string[]) : [],
      prerequisites,
      prerequisiteNotes: String(d.prerequisiteNotes ?? ''),
      sortingId: String(d.sortingId ?? ''),
      learningObjectives: String(d.learningObjectives ?? ''),
      ospoRelevance: String(d.ospoRelevance ?? ''),
      dateCreated: String(d.dateCreated ?? ''),
      dateModified: String(d.dateModified ?? ''),
      datePublished: String(d.datePublished ?? ''),
      creativeWorkStatus: String(d.creativeWorkStatus ?? 'Active'),
      audience: String(d.audience ?? ''),
      competencyRequired: String(d.competencyRequired ?? ''),
      contributor: String(d.contributor ?? ''),
      teaches: String(d.teaches ?? ''),
      version: String(d.version ?? ''),
    };
  });
}

export async function getActiveLessons(): Promise<Lesson[]> {
  return (await getLessons()).filter(
    (l) => (l.keepStatus === 'keep' || l.keepStatus === 'keepCandidate') && l.url.trim() !== '',
  );
}

export function getRelatedLessons(lesson: Lesson, allLessons: Lesson[], limit = 6): Lesson[] {
  const candidates = allLessons.filter(
    (other) =>
      other.slug !== lesson.slug &&
      other.keepStatus !== 'drop' &&
      other.url.trim() !== '',
  );

  const sharedPathway = (other: Lesson) =>
    lesson.pathways.some((p) => other.pathways.includes(p));
  const sharedSubtopic = (other: Lesson) =>
    lesson.subTopic.trim() !== '' && other.subTopic.trim() === lesson.subTopic.trim();

  const bySubtopicAndPathway = candidates.filter((o) => sharedPathway(o) && sharedSubtopic(o));
  const byPathwayOnly = candidates.filter((o) => sharedPathway(o) && !sharedSubtopic(o));

  return [...bySubtopicAndPathway, ...byPathwayOnly].slice(0, limit);
}
