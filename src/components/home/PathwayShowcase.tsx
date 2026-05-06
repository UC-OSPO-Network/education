import { useState } from 'react';
import CategoryIcon from './CategoryIcon';
import CategoryPanel from './CategoryPanel';
import LessonRail from './LessonRail';
import type { HomepagePathwayItem } from './types';

type PathwayShowcaseProps = {
  items: HomepagePathwayItem[];
  defaultActiveId?: string;
};

export default function PathwayShowcase({
  items,
  defaultActiveId,
}: PathwayShowcaseProps) {
  const initialId =
    items.find((item) => item.id === defaultActiveId)?.id ?? items[0]?.id ?? '';
  const [activeId, setActiveId] = useState(initialId);

  return (
    <div className="home-showcase__stack">
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        const zIndex = items.length - index;

        return (
          <div className="home-showcase__item" key={item.id} style={{ zIndex }}>
            <CategoryPanel
              icon={<CategoryIcon name={item.iconName} />}
              title={item.title}
              description={item.description}
              active={isActive}
              onSelect={() => setActiveId(item.id)}
            >
              {item.sections.length > 0 ? (
                item.sections.map((section) => (
                  <LessonRail
                    key={`${item.id}-${section.title}`}
                    title={section.title}
                    lessons={section.lessons}
                    pathwayIcon={<CategoryIcon name={item.iconName} size={18} decorative />}
                    showProgress={section.lessons.length > 3}
                    initialVisibleCount={3}
                  />
                ))
              ) : (
                <p className="home-showcase__empty">
                  Lesson previews for this pathway are coming soon.
                </p>
              )}
            </CategoryPanel>
          </div>
        );
      })}
    </div>
  );
}
