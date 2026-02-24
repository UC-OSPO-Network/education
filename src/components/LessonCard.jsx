import SkillBadge from './SkillBadge.jsx';

// Lesson card component matching student Figma design
// Features: dark header, light body, skill badge, tag pills

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
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function LessonCard({ lesson, pathwayIcon, lessonIndex = {} }) {
  if (!lesson) return null;

  const lessonName = lesson.name || 'Untitled Lesson';
  const dependencyRefs = Array.isArray(lesson.dependsOn)
      ? lesson.dependsOn.filter((value) => typeof value === 'string' && value.trim() !== '')
      : [];
  const prerequisiteLinks = dependencyRefs
      .map((token) => {
        const value = token.trim();
        if (!value) return null;

        if (isHttpUrl(value)) {
          return {
            key: value,
            href: value,
            label: formatUrlLabel(value),
            fallback: false
          };
        }

        const targetLesson = lessonIndex[value];
        if (targetLesson && targetLesson.url) {
          return {
            key: value,
            href: targetLesson.url,
            label: targetLesson.name || value,
            fallback: false
          };
        }

        return null;
      })
      .filter(Boolean);

  const feedbackUrl =
      'https://github.com/UC-OSPO-Network/education/issues/new' +
      '?template=lesson-feedback.yml' +
      `&title=${encodeURIComponent(`Lesson Feedback: ${lessonName}`)}` +
      `&body=${encodeURIComponent(`Lesson: ${lessonName}\n\nFeedback:`)}`;

  // Determine if lesson appears in multiple pathways
  const isMultiCategory =
      lesson.learnerCategory &&
      (lesson.learnerCategory.includes(',') ||
          lesson.learnerCategory.includes(';'));

  return (
      <div
          style={{
            position: 'relative',
            background:
                'linear-gradient(180deg, #2A2A2A 0%, #2A2A2A 35%, #3A3A3A 35%, #3A3A3A 100%)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid #3A3A3A',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--uc-light-blue)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(18, 149, 216, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#3A3A3A';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => {
            if (lesson.url) {
              window.open(lesson.url, '_blank', 'noopener,noreferrer');
            }
          }}
      >
        {/* Dark Header Section */}
        <div
            style={{
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              height: '220px',
              minWidth: 0,
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <SkillBadge level={lesson.educationalLevel} />
          </div>

          <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                minWidth: 0
              }}
          >
            {/* Icon */}
            <div
                style={{
                  fontSize: '2rem',
                  flexShrink: 0,
                  lineHeight: 1
                }}
            >
              {pathwayIcon || '📚'}
            </div>

            {/* Title */}
            <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  lineHeight: '1.4',
                  flex: 1,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden'
                }}
            >
              {lessonName}
            </h3>
          </div>
        </div>

        {/* Light Body Section */}
        <div
            style={{
              padding: '1.5rem 1.75rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: 0,
              overflow: 'hidden'
            }}
        >
          {/* Description */}
          <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#D4D4D8',
                lineHeight: '1.6',
                flex: 1,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word'
              }}
          >
            {lesson.description || 'No description available'}
          </p>

          {prerequisiteLinks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0, width: '100%' }}>
                <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: '600'
                    }}
                >
                  Prerequisites
                </p>
                <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: '0.45rem',
                      minWidth: 0,
                      width: '100%'
                    }}
                >
                  {prerequisiteLinks.map((link) => (
                      <a
                          key={link.key}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'block',
                            fontSize: '0.82rem',
                            color: '#72CDF4',
                            textDecoration: 'underline',
                            textDecorationColor: 'rgba(114, 205, 244, 0.5)',
                            textUnderlineOffset: '3px',
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.3'
                          }}
                      >
                        {link.label}
                      </a>
                  ))}
                </div>
              </div>
          )}

          {/* Feedback Button */}
          <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                alignSelf: 'flex-start',
                display: 'block',
                fontSize: '0.85rem',
                color: '#72CDF4',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(114, 205, 244, 0.6)',
                textUnderlineOffset: '2px',
                cursor: 'pointer',
                maxWidth: '100%',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                whiteSpace: 'normal'
              }}
          >
            💬 Give Feedback
          </a>

          {/* Tags and Meta Info */}
          <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
          >
            {/* Tag Pills */}
            <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}
            >
              {lesson.oss_role &&
                  lesson.oss_role
                      .split(',')
                      .slice(0, 2)
                      .map((role, idx) => (
                          <span
                              key={idx}
                              style={{
                                padding: '0.35rem 0.85rem',
                                background: 'rgba(18, 149, 216, 0.15)',
                                border: '1px solid rgba(18, 149, 216, 0.3)',
                                color: '#72CDF4',
                                borderRadius: '16px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                whiteSpace: 'normal',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word',
                                maxWidth: '100%'
                              }}
                          >
                    {role.trim()}
                  </span>
                      ))}

              {lesson.learningResourceType && (
                  <span
                      style={{
                        padding: '0.35rem 0.85rem',
                        background: 'rgba(255, 181, 17, 0.15)',
                        border: '1px solid rgba(255, 181, 17, 0.3)',
                        color: '#FFB511',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                  >
                {lesson.learningResourceType}
              </span>
              )}
            </div>

            {/* Multi-category indicator */}
            {isMultiCategory && (
                <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: '#9CA3AF',
                      fontStyle: 'italic'
                    }}
                >
                  ✨ This lesson is featured in multiple pathways
                </p>
            )}
          </div>
        </div>
      </div>
  );
}
