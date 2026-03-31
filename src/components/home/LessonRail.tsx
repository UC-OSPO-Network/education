import type { Lesson } from '../../lib/lessons';
import type { ReactNode } from 'react';
import LessonPreviewCard from './LessonPreviewCard';

type LessonRailProps = {
  title: string;
  lessons: Lesson[];
  pathwayIcon?: ReactNode;
  showProgress?: boolean;
  initialVisibleCount?: number;
};

export default function LessonRail({
  title,
  lessons,
  pathwayIcon,
  showProgress = false,
  initialVisibleCount = 3,
}: LessonRailProps) {
  const visibleCount = Math.min(initialVisibleCount, lessons.length);
  const progressWidth = `${(visibleCount / Math.max(lessons.length, 1)) * 100}%`;

  return (
    <section className="home-lesson-rail" aria-label={title}>
      <h3 className="home-lesson-rail__title">{title}</h3>

      <div className="home-lesson-rail__viewport">
        <div className="home-lesson-rail__track">
          {lessons.map((lesson) => (
            <div className="home-lesson-rail__item" key={lesson.slug}>
              <LessonPreviewCard lesson={lesson} pathwayIcon={pathwayIcon} compact />
            </div>
          ))}
        </div>
      </div>

      {showProgress && lessons.length > initialVisibleCount ? (
        <div className="home-lesson-rail__progress" aria-hidden="true">
          <span className="home-lesson-rail__progress-thumb" style={{ width: progressWidth }} />
        </div>
      ) : null}
    </section>
  );
}
