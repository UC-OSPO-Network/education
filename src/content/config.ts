// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const prerequisiteSchema = z.object({
  type: z.enum(['lesson', 'url', 'text']),
  value: z.string(),
  label: z.string().optional(),
});

const lessons = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string().default(''),
    keepStatus: z.enum(['keep', 'keepCandidate', 'drop']).default('keepCandidate'),

    description: z.string().default(''),
    url: z.string().url().or(z.literal('')).default(''),
    repoUrl: z.string().url().or(z.literal('')).default(''),

    domain: z.enum(['Research Software', 'Data Science', 'Institutional Policy', 'GIS', 'General Open Source']).default('General Open Source'),
    topic: z.string().default(''),
    subTopic: z.string().default(''),

    // Curated 11-term facet vocabulary derived from `keywords` via
    // scripts/normalize-topics.mjs (see docs/ia-taxonomy-proposal.md).
    // `keywords` stays for full-text search; `topics` drives the Topic filter.
    topics: z.array(z.enum([
      'Version Control & Collaborative Development',
      'Documentation & Technical Writing',
      'Licensing, Copyright & Reuse',
      'Community, Governance & Conduct',
      'Project Planning, Maintenance & Sustainability',
      'Quality, Testing, Review & Automation',
      'Software Design & Engineering Practices',
      'Packaging, Release & Distribution',
      'Reproducibility, Environments & Workflows',
      'Open Science, FAIR & Research Software Metadata',
      'Project Health, Metrics & Assessment',
      'Security & Supply Chain',
      'Accessibility & Inclusive Design',
      'Getting Started with Open Source',
    ])).default([]),

    // Canonical field. learnerCategory kept for back-compat with existing JSON files.
    pathways: z.array(z.string()).default([]),
    learnerCategory: z.string().default(''),

    educationalLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    // Current active vocab: workshop | course | guide
    // Legacy values (tutorial, handout, etc.) retained for back-compat with drop lessons
    learningResourceType: z.enum(['workshop', 'course', 'guide', 'tutorial', 'presentation', 'handout', 'video lecture', 'e-Learning module', 'quiz', 'exercise']).default('workshop'),

    author: z.string().default(''),
    provider: z.string().default(''),
    license: z.string().default(''),

    // Canonical field. ossRole kept for back-compat with existing JSON files.
    roles: z.array(z.string()).default([]),
    ossRole: z.string().default(''),

    timeRequired: z.string().default(''),
    inLanguage: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),

    // Canonical field. dependsOn kept for back-compat with existing JSON files.
    prerequisites: z.array(prerequisiteSchema).default([]),
    dependsOn: z.array(z.string()).default([]),
    prerequisiteNotes: z.string().default(''),
    sortingId: z.string().default(''),

    learningObjectives: z.string().default(''),
    ospoRelevance: z.string().default(''),
    abstract: z.string().default(''),
    dateCreated: z.string().default(''),
    dateModified: z.string().default(''),
    datePublished: z.string().default(''),
    creativeWorkStatus: z.enum(['Active', 'Under development', 'Archived']).default('Active'),

    // Optional bioschemas / schema.org fields
    // `audience` = raw "designed for" text (kept for search). `audiences` =
    // canonical 8-term persona vocab derived via scripts/normalize-audience.mjs;
    // drives the "Designed for" filter. Distinct from `roles` (OSS-role
    // competency the lesson builds toward).
    audience: z.string().default(''),
    audiences: z.array(z.enum([
      'Researcher',
      'Research Software Engineer / Developer',
      'Open Source Contributor',
      'Open Source Maintainer',
      'Project / Program Lead',
      'Community Manager',
      'Librarian / Information Professional',
      'Educator',
    ])).default([]),
    competencyRequired: z.string().default(''),
    contributor: z.string().default(''),
    teaches: z.string().default(''),
    version: z.string().default(''),
  }).passthrough()
    .refine(
      (lesson) => !lesson.audiences.includes('Educator') || ['workshop', 'course'].includes(lesson.learningResourceType),
      {
        message: "audiences cannot include 'Educator' unless learningResourceType is 'workshop' or 'course' — self-study guides aren't delivered by an instructor",
        path: ['audiences'],
      },
    ),
});

const pathways = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    icon: z.string().default(''),
    order: z.number().default(99),
    // Optional expository intro, paragraph-split on \n\n.
    // Most pathways don't need this — description + lesson grid is enough.
    body: z.string().default(''),
  }),
});

export const collections = { lessons, pathways };
