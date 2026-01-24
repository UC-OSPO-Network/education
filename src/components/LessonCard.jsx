import SkillBadge from './SkillBadge.jsx';

// Lesson card component matching student Figma design
// Features: dark header, light body, skill badge, tag pills

function HighlightedText({ text, matches, field }) {
  if (!matches || !text) return <>{text}</>;

  const match = matches.find(m => m.key === field);
  if (!match) return <>{text}</>;

  const parts = [];
  let lastIndex = 0;

  match.indices.forEach(([start, end], i) => {
    if (start > lastIndex) {
      parts.push(
        <span key={`text-${i}`}>
          {text.slice(lastIndex, start)}
        </span>
      );
    }

    parts.push(
      <mark key={`mark-${i}`}>
        {text.slice(start, end + 1)}
      </mark>
    );

    lastIndex = end + 1;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}


export default function LessonCard({ lesson, pathwayIcon,matches }) {
  if (!lesson) return null;

  // Determine if lesson appears in multiple pathways
  const isMultiCategory = lesson.learnerCategory &&
    (lesson.learnerCategory.includes(',') || lesson.learnerCategory.includes(';'));

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #2A2A2A 0%, #2A2A2A 35%, #3A3A3A 35%, #3A3A3A 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '2px solid #3A3A3A',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--uc-light-blue)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(18, 149, 216, 0.4)';
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
      {/* Skill Level Badge */}
      <SkillBadge level={lesson.educationalLevel} />

      {/* Dark Header Section with Icon */}
      <div style={{
        padding: '1.5rem',
        paddingTop: '3.5rem', // Extra space for badge
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        minHeight: '120px'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '2rem',
          flexShrink: 0,
          lineHeight: 1
        }}>
          {pathwayIcon || '📚'}
        </div>

        {/* Title */}
        <h3 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.4',
          flex: 1
        }}>
        <HighlightedText
          text={lesson.name || 'Untitled Lesson'}
          matches={matches}
          field="name"
        />
        </h3>
      </div>

      {/* Light Body Section */}
      <div style={{
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Description */}
        <p style={{
          margin: 0,
          fontSize: '0.95rem',
          color: '#D4D4D8',
          lineHeight: '1.6',
          flex: 1
        }}>
          {lesson.description || 'No description available'}
        </p>

        {/* Tags and Meta Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Tag Pills */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {lesson.oss_role && lesson.oss_role.split(',').slice(0, 2).map((role, idx) => (
              <span key={idx} style={{
                padding: '0.35rem 0.85rem',
                background: 'rgba(18, 149, 216, 0.15)',
                border: '1px solid rgba(18, 149, 216, 0.3)',
                color: '#72CDF4',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {role.trim()}
              </span>
            ))}
            {lesson.learningResourceType && (
              <span style={{
                padding: '0.35rem 0.85rem',
                background: 'rgba(255, 181, 17, 0.15)',
                border: '1px solid rgba(255, 181, 17, 0.3)',
                color: '#FFB511',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {lesson.learningResourceType}
              </span>
            )}
          </div>

          {/* Multi-category indicator */}
          {isMultiCategory && (
            <p style={{
              margin: 0,
              fontSize: '0.8rem',
              color: '#9CA3AF',
              fontStyle: 'italic'
            }}>
              ✨ This lesson is featured in multiple pathways
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
