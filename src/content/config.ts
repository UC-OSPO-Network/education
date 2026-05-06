// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const lessons = defineCollection({
  type: 'data', // JSON files
  schema: z.object({
    // core id
    name: z.string(),
    // Canonical slug is filename (entry.id); keep mirrored slug key in JSON when present.
    slug: z.string().default(''),
    keepStatus: z.enum(['keep', 'keepCandidate', 'drop']).default('keepCandidate'),
    
    // content
    description: z.string().default(''),
    url: z.string().url().or(z.literal('')).default(''),
    
    // categories
    topic: z.string().default(''),
    subTopic: z.string().default(''),
    learnerCategory: z.string().default(''),
    educationalLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    learningResourceType: z.enum(['Static Documents', 'Short Training Courses', 'Long Form Training']).default('Short Training Courses'),
    
    // people metadata
    author: z.string().default(''),
    license: z.string().default(''),
    ossRole: z.string().default(''),
    timeRequired: z.string().default(''),
    
    // arrays
    inLanguage: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    
    // prerequisites
    dependsOn: z.array(z.string()).default([]),
    prerequisiteNotes: z.string().default(''),
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
