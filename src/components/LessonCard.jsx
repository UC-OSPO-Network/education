import SkillBadge from './SkillBadge.jsx';

// Lesson card component matching student Figma design
// Features: dark header, light body, skill badge, tag pills

export default function LessonCard({ lesson, pathwayIcon }) {
  if (!lesson) return null;

  const lessonName = lesson.name || 'Untitled Lesson';

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

  const lessonHref = `${import.meta.env.BASE_URL}lessons/${lesson.slug}`;

  return (
    <a
      href={lessonHref}
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
        textDecoration: 'none',
        color: 'inherit'
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
    >
        {/* Skill Level Badge */}
        <SkillBadge level={lesson.educationalLevel} />

        {/* Dark Header Section */}
        <div
            style={{
              padding: '1.5rem',
              paddingTop: '3.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              minHeight: '120px'
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
                flex: 1
              }}
          >
            {lessonName}
          </h3>
        </div>

        {/* Light Body Section */}
        <div
            style={{
              padding: '1.5rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
        >
          {/* Description */}
          <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#D4D4D8',
                lineHeight: '1.6',
                flex: 1
              }}
          >
            {lesson.description || 'No description available'}
          </p>

          {/* Feedback Button - button to avoid invalid nested anchor */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(feedbackUrl, '_blank', 'noopener,noreferrer');
            }}
            style={{
              alignSelf: 'flex-start',
              fontSize: '0.85rem',
              color: '#72CDF4',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0
            }}
          >
            💬 Give Feedback
          </button>

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
                                whiteSpace: 'nowrap'
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
                        whiteSpace: 'nowrap'
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
    </a>
  );
}
