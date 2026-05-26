export type CffAuthor =
  | { family: string | null; given: string | null; orcid: string | null; affiliation: string | null }
  | { name: string };

export type Citation = {
  source: 'cff' | 'default';
  title: string | null;
  doi: string | null;
  version: string | null;
  dateReleased: string | null;
  license: string | null;
  authors: CffAuthor[];
};

export type HealthRecord = {
  repoUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
  updatedAt: string | null;
  contributorCount: number | null;
  contributorCountTruncated: boolean;
  license: string | null;
  archived: boolean;
  sponsorsUrl: string | null;
  hasFunding: boolean;
  hasCodeOfConduct: boolean;
  citation: Citation | null;
};

export type HealthSnapshot = {
  fetchedAt: string | null;
  lessons: Record<string, HealthRecord | null>;
};
