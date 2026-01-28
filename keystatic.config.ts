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
      },
    }),
  },
});
