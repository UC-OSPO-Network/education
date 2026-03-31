import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { Lesson } from '../../lib/lessons';
import type { ReactNode } from 'react';

type LessonPreviewCardProps = {
  lesson: Lesson;
  pathwayIcon?: ReactNode;
  compact?: boolean;
};

function firstItems(value: string | undefined, limit = 2) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function getLevelConfig(level: string | undefined) {
  if (!level) return { bg: '#6b7280', label: 'Lesson' };
  const n = level.toLowerCase();
  if (n.includes('beginner')) return { bg: '#10b981', label: 'Beginner' };
  if (n.includes('intermediate')) return { bg: '#f59e0b', label: 'Intermediate' };
  if (n.includes('advanced')) return { bg: '#ef4444', label: 'Advanced' };
  return { bg: '#6b7280', label: level };
}

export default function LessonPreviewCard({
  lesson,
  pathwayIcon,
  compact = false,
}: LessonPreviewCardProps) {
  const href = `${import.meta.env.BASE_URL}lessons/${lesson.slug}`;
  const roles = firstItems(lesson.oss_role);
  const topMeta = lesson.learningResourceType || lesson.subTopic || 'Lesson';
  const compactClass = compact ? 'is-compact' : '';
  const level = getLevelConfig(lesson.educationalLevel);

  return (
    <a className={`home-lesson-card ${compactClass}`.trim()} href={href}>
      {/* ── Colored level band ── */}
      <div
        className="home-lesson-card__level-band"
        style={{ background: level.bg }}
      >
        <ChartBarIcon className="home-lesson-card__level-icon" />
        <span>{level.label}</span>
      </div>

      {/* ── Dark meta strip ── */}
      <div className="home-lesson-card__top">
        <div className="home-lesson-card__meta">{topMeta}</div>
        {roles.length > 0 ? (
          <div className="home-lesson-card__meta home-lesson-card__meta--muted">
            {roles.join(', ')}
          </div>
        ) : null}
      </div>

      {/* ── Body: title + description ── */}
      <div className="home-lesson-card__body">
        <div className="home-lesson-card__heading">
          {pathwayIcon ? <span className="home-lesson-card__icon">{pathwayIcon}</span> : null}
          <h4 className="home-lesson-card__title">{lesson.name}</h4>
        </div>
        <p className="home-lesson-card__description">
          {lesson.description || lesson.abstract || 'No description available yet.'}
        </p>
      </div>
    </a>
  );
}
