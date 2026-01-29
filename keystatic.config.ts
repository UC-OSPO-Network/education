import { collection, config, fields } from '@keystatic/core';
import { PATHWAYS } from './src/types/lesson';

const learnerCategoryOptions = PATHWAYS.flatMap((pathway) => pathway.learnerCategories).map(
  (category) => ({
    label: category,
    value: category,
  })
);

const uniqueLearnerCategoryOptions = Array.from(
  new Map(learnerCategoryOptions.map((option) => [option.value, option])).values()
).sort((a, b) => a.label.localeCompare(b.label));

const learnerCategorySelectOptions = [
  { label: 'Unassigned', value: '' },
  ...uniqueLearnerCategoryOptions,
];

const educationalLevelOptions = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
  { label: 'Mixed', value: 'Mixed' },
  { label: 'Unknown', value: 'Unknown' },
] as const;

const keepStatusOptions = [
  { label: 'Keep', value: 'keep' },
  { label: 'Keep candidate', value: 'keepCandidate' },
  { label: 'Drop', value: 'drop' },
] as const;

const useGitHubStorage =
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github' && import.meta.env.DEV;

export default config({
  storage: useGitHubStorage
    ? { kind: 'github', repo: 'UC-OSPO-Network/education' }
    : { kind: 'local' },
  ui: {
    brand: { name: 'UC OSPO Education' },
    navigation: {
      Content: ['lessons'],
    },
  },
  collections: {
    lessons: collection({
      label: 'Lessons',
      path: 'src/content/lessons/*',
      format: { data: 'json' },
      slugField: 'slug',
      schema: {
        name: fields.text({
          label: 'Name',
          validation: { isRequired: true },
          description: 'The title of the lesson',
        }),
        slug: fields.text({
          label: 'Slug',
          validation: { isRequired: true },
          description: 'The filename and URL part for this lesson',
        }),
        keepStatus: fields.select({
          label: 'Keep status',
          options: keepStatusOptions,
          defaultValue: 'keepCandidate',
        }),
        description: fields.text({ label: 'Description', multiline: true }),
        url: fields.url({
          label: 'Lesson URL',
          validation: { isRequired: true },
        }),
        author: fields.text({ label: 'Author' }),
        license: fields.text({ label: 'License' }),
        learnerCategory: fields.select({
          label: 'Pathway (learnerCategory)',
          options: learnerCategorySelectOptions,
          defaultValue: '',
          description: 'Pick the primary pathway for this lesson (or leave Unassigned).',
        }),
        educationalLevel: fields.select({
          label: 'Skill level (educationalLevel)',
          options: educationalLevelOptions,
          defaultValue: 'Unknown',
        }),
        ossRole: fields.text({
          label: 'OSS role(s)',
          description: 'Used for filtering and tag pills. Example: Contributor, Maintainer',
        }),
        subTopic: fields.text({ label: 'Sub-topic' }),
        timeRequired: fields.text({ label: 'Time Required', description: 'e.g. 30 minutes, 2 hours' }),
        learningResourceType: fields.text({ label: 'Learning resource type' }),
        inLanguage: fields.array(fields.text({ label: 'Language' }), {
          label: 'Languages',
          itemLabel: (props) => props.value,
        }),
        keywords: fields.array(fields.text({ label: 'Keyword' }), {
          label: 'Keywords',
          itemLabel: (props) => props.value,
        }),
        // --- Additional Metadata Fields ---
        topic: fields.text({ label: 'Topic' }),
        sortingId: fields.text({ label: 'Sorting ID' }),
        dependsOn: fields.text({ label: 'Depends On' }),
        learningObjectives: fields.text({ label: 'Learning Objectives', multiline: true }),
        ospoRelevance: fields.text({ label: 'OSPO Relevance', multiline: true }),
        about: fields.text({ label: 'About' }),
        abstract: fields.text({ label: 'Abstract', multiline: true }),
        accessibilitySummary: fields.text({ label: 'Accessibility Summary', multiline: true }),
        audience: fields.text({ label: 'Audience' }),
        competencyRequired: fields.text({ label: 'Competency Required' }),
        contributor: fields.text({ label: 'Contributor' }),
        creativeWorkStatus: fields.text({ label: 'Creative Work Status' }),
        dateCreated: fields.text({ label: 'Date Created' }),
        dateModified: fields.text({ label: 'Date Modified' }),
        datePublished: fields.text({ label: 'Date Published' }),
        hasPart: fields.text({ label: 'Has Part' }),
        identifier: fields.text({ label: 'Identifier' }),
        isPartOf: fields.text({ label: 'Is Part Of' }),
        notes: fields.text({ label: 'Notes', multiline: true }),
        mentions: fields.text({ label: 'Mentions' }),
        recordedAt: fields.text({ label: 'Recorded At' }),
        teaches: fields.text({ label: 'Teaches' }),
        version: fields.text({ label: 'Version' }),
        workTranslation: fields.text({ label: 'Work Translation' }),
      },
    }),
  },
});
