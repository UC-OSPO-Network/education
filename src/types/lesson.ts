// TypeScript types for lesson data based on Bioschemas Training schema

export interface Lesson {
  name: string;
  slug?: string;
  Topic: string;
  'Keep?': string;
  learnerCategory: string;
  'Sorting ID': string;
  'Depends On': string;
  'Learning Objectives': string;
  subTopic: string;
  'OSPO Relevance': string;
  about: string;
  abstract: string;
  accessibilitySummary: string;
  url: string;
  oss_role: string;
  audience: string;
  author: string;
  competencyRequired: string;
  contributor: string;
  creativeWorkStatus: string;
  dateCreated: string;
  dateModified: string;
  datePublished: string;
  description: string;
  educationalLevel: string;
  hasPart: string;
  identifier: string;
  inLanguage: string;
  isPartOf: string;
  Notes: string;
  keywords: string;
  learningResourceType: string;
  license: string;
  mentions: string;
  recordedAt: string;
  teaches: string;
  timeRequired: string;
  version: string;
  workTranslation: string;
}

export interface PathwayInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  learnerCategories: string[];
}

export const PATHWAYS: PathwayInfo[] = [
  {
    id: 'getting-started',
    name: 'Getting Started with Open Source',
    description: 'For learners new to open source and open collaboration.',
    icon: '🧩',
    learnerCategories: ['Getting Started with Open Source']
  },
  {
    id: 'contributing',
    name: 'Contributing to a Project',
    description: 'For those ready to write code, open issues, or create documentation.',
    icon: '🤝',
    learnerCategories: ['Contributing to a Project']
  },
  {
    id: 'maintaining',
    name: 'Maintaining & Sustaining Software',
    description: 'For maintainers, project leads, and tech stewards.',
    icon: '🛠',
    learnerCategories: ['Maintaining & Sustaining Software']
  },
  {
    id: 'building-communities',
    name: 'Building Inclusive Communities',
    description: 'For those organizing people, not just code.',
    icon: '🌱',
    learnerCategories: ['Building Community']
  },
  {
    id: 'licensing',
    name: 'Understanding Licensing & Compliance',
    description: 'For anyone navigating open source legalities, especially in a UC context.',
    icon: '⚖️',
    learnerCategories: ['Understanding Licensing & Compliance']
  },
  {
    id: 'strategic',
    name: 'Strategic Practices & Career Development',
    description: 'For project leaders, RSEs, and open science strategists.',
    icon: '📈',
    learnerCategories: ['Strategic Practices & Career Development']
  }
];
