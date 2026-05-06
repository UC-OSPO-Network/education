import type { Lesson } from '../../lib/lessons';

export type CategoryIconName =
  | 'getting-started'
  | 'contributing'
  | 'maintaining'
  | 'building-communities'
  | 'licensing'
  | 'strategic';

export interface HomepagePathwaySection {
  title: string;
  lessons: Lesson[];
}

export interface HomepagePathwayItem {
  id: string;
  title: string;
  description: string;
  iconName: CategoryIconName;
  sections: HomepagePathwaySection[];
}
