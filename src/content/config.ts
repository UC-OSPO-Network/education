import { defineCollection, z } from 'astro:content';

const lessons = defineCollection({
  type: 'data',
  schema: z
    .object({
      name: z.string(),
      slug: z.string().optional(), // Now a simple string
      keepStatus: z.enum(['keep', 'keepCandidate', 'drop']).default('keepCandidate'),
      description: z.string().optional().default(''),
      url: z.union([z.string().url(), z.literal('')]).default(''),
      author: z.string().optional().default(''),
      license: z.string().optional().default(''),
      learnerCategory: z.string().optional().default(''),
      educationalLevel: z.string().optional().default('Unknown'),
      ossRole: z.string().optional().default(''),
      oss_role: z.string().optional().default(''), // Keep for backward compatibility
      subTopic: z.string().optional().default(''),
      timeRequired: z.string().optional().default(''),
      learningResourceType: z.string().optional().default(''),
      inLanguage: z.array(z.string()).optional().default([]),
      keywords: z.union([z.string(), z.array(z.string())]).optional().default([]),
      // Additional Metadata Fields
      topic: z.string().optional().default(''),
      sortingId: z.string().optional().default(''),
      dependsOn: z.string().optional().default(''),
      learningObjectives: z.string().optional().default(''),
      ospoRelevance: z.string().optional().default(''),
      about: z.string().optional().default(''),
      abstract: z.string().optional().default(''),
      accessibilitySummary: z.string().optional().default(''),
      audience: z.string().optional().default(''),
      competencyRequired: z.string().optional().default(''),
      contributor: z.string().optional().default(''),
      creativeWorkStatus: z.string().optional().default(''),
      dateCreated: z.string().optional().default(''),
      dateModified: z.string().optional().default(''),
      datePublished: z.string().optional().default(''),
      hasPart: z.string().optional().default(''),
      identifier: z.string().optional().default(''),
      isPartOf: z.string().optional().default(''),
      notes: z.string().optional().default(''),
      mentions: z.string().optional().default(''),
      recordedAt: z.string().optional().default(''),
      teaches: z.string().optional().default(''),
      version: z.string().optional().default(''),
      workTranslation: z.string().optional().default(''),
    })
    .passthrough(),
});

export const collections = { lessons };
