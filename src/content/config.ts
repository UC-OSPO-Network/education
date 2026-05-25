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

    // Canonical field. learnerCategory kept for back-compat with existing JSON files.
    pathways: z.array(z.string()).default([]),
    learnerCategory: z.string().default(''),

    educationalLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    learningResourceType: z.enum(['tutorial', 'presentation', 'handout', 'video lecture', 'e-Learning module', 'quiz', 'exercise', 'workshop']).default('tutorial'),

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
    audience: z.string().default(''),
    competencyRequired: z.string().default(''),
    contributor: z.string().default(''),
    teaches: z.string().default(''),
    version: z.string().default(''),
  }).passthrough(),
});

const pathways = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    icon: z.string().default(''),
    order: z.number().default(99),
  }),
});

export const collections = { lessons, pathways };
