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
    })
    .passthrough(),
});

export const collections = { lessons };
