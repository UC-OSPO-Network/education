import { defineCollection, z } from 'astro:content';

const lessons = defineCollection({
  type: 'data',
  schema: z
    .object({
      name: z.string(),
      keepStatus: z.enum(['keep', 'keepCandidate', 'drop']).default('keepCandidate'),
      description: z.string().optional().default(''),
      url: z.union([z.string().url(), z.literal('')]).default(''),
      learnerCategory: z.string().optional().default(''),
      educationalLevel: z.string().optional().default('Unknown'),
      oss_role: z.string().optional().default(''),
      subTopic: z.string().optional().default(''),
      learningResourceType: z.string().optional().default(''),
      keywords: z.string().optional().default(''),
    })
    .passthrough(),
});

export const collections = { lessons };
