// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const lessons = defineCollection({
  type: 'data', // JSON files
  schema: z.object({
    // core id
    name: z.string(),
    slug: z.string(),
    keepStatus: z.enum(['keep', 'keepCandidate', 'drop']).default('keepCandidate'),
    
    // content
    description: z.string().default(''),
    url: z.string().url().or(z.literal('')).default(''),
    
    // categories
    topic: z.string().default(''),
    subTopic: z.string().default(''),
    learnerCategory: z.string().default(''),
    educationalLevel: z.string().default('Unknown'),
    learningResourceType: z.string().default(''),
    
    // people metadata
    author: z.string().default(''),
    license: z.string().default(''),
    ossRole: z.string().default(''),
    
    // arrays
    inLanguage: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    
    // csv slugs
    dependsOn: z.string().default(''), 
    sortingId: z.string().default(''), // for ref
    
    // additional metadata
    learningObjectives: z.string().default(''),
    ospoRelevance: z.string().default(''),
    abstract: z.string().default(''),
    dateCreated: z.string().default(''),
    dateModified: z.string().default(''),
    
  }).passthrough(), // allows extra fields
});

export const collections = { lessons };