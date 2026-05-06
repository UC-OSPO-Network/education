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
    domain: z.enum(['Research Software', 'Data Science', 'Institutional Policy', 'GIS', 'General Open Source']).default('General Open Source'),
    topic: z.string().default(''),
    subTopic: z.string().default(''),
    learnerCategory: z.string().default(''),
    educationalLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    learningResourceType: z.enum(['tutorial', 'presentation', 'handout', 'video lecture', 'e-Learning module', 'quiz', 'exercise', 'workshop']).default('tutorial'),
    
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
    creativeWorkStatus: z.enum(['Active', 'Under development', 'Archived']).default('Active'),
    
  }).passthrough(), // allows extra fields
});

export const collections = { lessons };
