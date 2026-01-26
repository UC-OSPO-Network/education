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
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github' || !import.meta.env.DEV;

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
      slugField: 'name',
      schema: {
        name: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
          slug: { label: 'Slug' },
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
        oss_role: fields.text({
          label: 'OSS role(s) (comma-separated)',
          description: 'Used for filtering and tag pills. Example: Contributor, Maintainer',
        }),
        subTopic: fields.text({ label: 'Sub-topic' }),
        learningResourceType: fields.text({ label: 'Learning resource type' }),
        keywords: fields.text({ label: 'Keywords (comma-separated)' }),
      },
    }),
  },
});
