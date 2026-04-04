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
] as const;

const learningResourceTypeOptions = [
  { label: 'Static Documents', value: 'Static Documents' },
  { label: 'Short Training Courses', value: 'Short Training Courses' },
  { label: 'Long Form Training', value: 'Long Form Training' },
] as const;

const languageOptions = [
  { label: 'English (en)', value: 'en' },
  { label: 'Bulgarian (bg)', value: 'bg' },
  { label: 'Bengali (bn)', value: 'bn' },
  { label: 'German (de)', value: 'de' },
  { label: 'Greek (el)', value: 'el' },
  { label: 'Spanish (es)', value: 'es' },
  { label: 'Persian (fa)', value: 'fa' },
  { label: 'French (fr)', value: 'fr' },
  { label: 'Hindi (hi)', value: 'hi' },
  { label: 'Hungarian (hu)', value: 'hu' },
  { label: 'Indonesian (id)', value: 'id' },
  { label: 'Italian (it)', value: 'it' },
  { label: 'Japanese (ja)', value: 'ja' },
  { label: 'Korean (ko)', value: 'ko' },
  { label: 'Malay (ms)', value: 'ms' },
  { label: 'Dutch (nl)', value: 'nl' },
  { label: 'Polish (pl)', value: 'pl' },
  { label: 'Portuguese (pt)', value: 'pt' },
  { label: 'Romanian (ro)', value: 'ro' },
  { label: 'Russian (ru)', value: 'ru' },
  { label: 'Swahili (sw)', value: 'sw' },
  { label: 'Tamil (ta)', value: 'ta' },
  { label: 'Turkish (tr)', value: 'tr' },
  { label: 'Chinese (Simplified) (zh-CN)', value: 'zh-CN' },
  { label: 'Chinese (Traditional) (zh-TW)', value: 'zh-TW' },
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
      // Keep Keystatic's internal filename slug separate from the mirrored JSON `slug` key.
      slugField: 'entrySlug',
      schema: {
        entrySlug: fields.text({
          label: 'Entry Slug (filename)',
          validation: { isRequired: true },
          description:
            'Internal Keystatic field for the file slug/path. Keep this aligned with filename slug.',
        }),
        name: fields.text({
          label: 'Name',
          validation: { isRequired: true },
          description: 'The title of the lesson',
        }),
        slug: fields.text({
          label: 'Slug (mirrored JSON)',
          validation: { isRequired: true },
          description:
            'Mirrored slug key stored in JSON. Must match the filename slug.',
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
          defaultValue: 'Beginner',
        }),
        ossRole: fields.text({
          label: 'OSS role(s)',
          description: 'Used for filtering and tag pills. Example: Contributor, Maintainer',
        }),
        subTopic: fields.text({ label: 'Sub-topic' }),
        timeRequired: fields.text({
          label: 'Time Required',
          description: 'ISO 8601 duration format. e.g. PT15M (15 mins), PT1H (1 hour), PT1H30M',
        }),
        learningResourceType: fields.select({
          label: 'Learning resource type',
          options: learningResourceTypeOptions,
          defaultValue: 'Short Training Courses',
        }),
        inLanguage: fields.array(
          fields.select({
            label: 'Language',
            options: languageOptions,
            defaultValue: 'en',
          }),
          {
            label: 'Languages',
            itemLabel: (props) => props.value,
          }
        ),
        keywords: fields.array(fields.text({ label: 'Keyword' }), {
          label: 'Keywords',
          itemLabel: (props) => props.value,
        }),
        // --- Additional Metadata Fields ---
        topic: fields.text({ label: 'Topic' }),
        sortingId: fields.text({ label: 'Sorting ID' }),
        dependsOn: fields.array(fields.text({ label: 'Dependency (slug or URL)' }), {
          label: 'Depends On',
          itemLabel: (props) => props.value || 'dependency',
          description: 'Prerequisite lesson slugs and/or external URLs',
        }),
        prerequisiteNotes: fields.text({
          label: 'Prerequisite Notes',
          multiline: true,
          description: 'Free-text prerequisite notes that are not machine-readable references',
        }),
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
