import { ChartBarIcon } from '@heroicons/react/24/outline';

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatUrlLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getLevelConfig(level) {
  if (!level) return { bg: '#6b7280', label: 'Lesson' };
  const n = level.toLowerCase();
  if (n.includes('beginner'))    return { bg: '#10b981', label: 'Beginner' };
  if (n.includes('intermediate')) return { bg: '#f59e0b', label: 'Intermediate' };
  if (n.includes('advanced'))    return { bg: '#ef4444', label: 'Advanced' };
  return { bg: '#6b7280', label: level };
}

export default function LessonCard({ lesson, lessonIndex = {} }) {
  if (!lesson) return null;

  const lessonName = lesson.name || 'Untitled Lesson';
  const level = getLevelConfig(lesson.educationalLevel);
  const topMeta = lesson.learningResourceType || lesson.subTopic || 'Lesson';
  const roles = lesson.oss_role
    ? lesson.oss_role.split(',').map((r) => r.trim()).filter(Boolean).slice(0, 2)
    : [];

  const dependencyRefs = Array.isArray(lesson.dependsOn)
    ? lesson.dependsOn.filter((v) => typeof v === 'string' && v.trim() !== '')
    : [];

  const prerequisiteLinks = dependencyRefs
    .map((token) => {
      const value = token.trim();
      if (!value) return null;
      if (isHttpUrl(value)) return { key: value, href: value, label: formatUrlLabel(value) };
      const target = lessonIndex[value];
      if (target?.url) return { key: value, href: target.url, label: target.name || value };
      return null;
    })
    .filter(Boolean);

  const feedbackUrl =
    'https://github.com/UC-OSPO-Network/education/issues/new' +
    '?template=lesson-feedback.yml' +
    `&title=${encodeURIComponent(`Lesson Feedback: ${lessonName}`)}` +
    `&body=${encodeURIComponent(`Lesson: ${lessonName}\n\nFeedback:`)}`;

  const isMultiCategory =
    lesson.learnerCategory &&
    (lesson.learnerCategory.includes(',') || lesson.learnerCategory.includes(';'));

  const lessonHref = `${import.meta.env.BASE_URL}lessons/${lesson.slug}`;

  return (
    <a className="lesson-card" href={lessonHref}>
      {/* Colored level band */}
      <div className="lesson-card__band" style={{ background: level.bg }}>
        <ChartBarIcon className="lesson-card__band-icon" />
        <span>{level.label}</span>
      </div>

      {/* Dark metadata strip */}
      <div className="lesson-card__meta-strip">
        <p className="lesson-card__meta-type">{topMeta}</p>
        {roles.length > 0 && (
          <p className="lesson-card__meta-role">{roles.join(', ')}</p>
        )}
      </div>

      {/* Body */}
      <div className="lesson-card__body">
        <h3 className="lesson-card__title">{lessonName}</h3>

        <p className="lesson-card__description">
          {lesson.description || 'No description available.'}
        </p>

        {prerequisiteLinks.length > 0 && (
          <div className="lesson-card__prereqs">
            <p className="lesson-card__prereq-label">Prerequisites</p>
            {prerequisiteLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="lesson-card__prereq-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <a
          href={feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="lesson-card__feedback"
        >
          💬 Give Feedback
        </a>

        <div className="lesson-card__tags">
          {roles.map((role, idx) => (
            <span key={idx} className="lesson-card__tag lesson-card__tag--role">
              {role}
            </span>
          ))}
          {lesson.learningResourceType && (
            <span className="lesson-card__tag lesson-card__tag--type">
              {lesson.learningResourceType}
            </span>
          )}
          {isMultiCategory && (
            <p className="lesson-card__multi-pathway">
              ✨ Featured in multiple pathways
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
