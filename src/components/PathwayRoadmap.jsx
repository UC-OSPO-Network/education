import React from "react";

export default function PathwayRoadmap({ steps }) {
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  // Flatten lessons for start/next steps
  const allLessons = steps.flatMap(s => s.lessons || []);
  const firstLessonId = allLessons[0]?.id;
  const lastLessonId = allLessons[allLessons.length - 1]?.id;

  return (
    <nav aria-label="Learning Roadmap" style={{ marginBottom: '4rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Learning Roadmap</h2>
      <ol
        style={{
          listStyle: 'none',
          paddingLeft: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {steps.map((step, index) => (
          <li key={index} style={{}}
              tabIndex={0}
              aria-label={`Subtopic: ${step.subTopic}`}
          >
            <div style={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
              color: '#003262',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{fontSize: '1.5rem'}}>●</span> {step.subTopic}
            </div>
            <ol
              style={{
                listStyle: 'none',
                paddingLeft: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
              aria-label={`Lessons for ${step.subTopic}`}
            >
              {step.lessons.map((lesson, i) => {
                const isFirst = lesson.id === firstLessonId;
                const isLast = lesson.id === lastLessonId;
                return (
                  <li
                    key={lesson.id || i}
                    tabIndex={0}
                    aria-label={`Lesson: ${lesson.name}, Level: ${lesson.educationalLevel}, Type: ${lesson.learningResourceType || 'Lesson'}`}
                    style={{
                      background: isFirst
                        ? 'linear-gradient(90deg, #ffe082 60%, #fffde7 100%)'
                        : isLast
                        ? 'linear-gradient(90deg, #b2dfdb 60%, #e0f2f1 100%)'
                        : '#f5f5f5',
                      border: isFirst || isLast ? '2px solid #003262' : '1px solid #ccc',
                      borderRadius: '1.5rem',
                      padding: '0.75rem 1.25rem',
                      minWidth: 180,
                      boxShadow: isFirst || isLast ? '0 2px 8px #00326222' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{lesson.name}</span>
                    <span style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      marginLeft: 4,
                    }}>
                      {lesson.educationalLevel}
                    </span>
                    {lesson.learningResourceType && (
                        <span style={{
                            fontSize: '0.85rem',
                            background: '#e3f2fd',
                            color: '#003262',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '0.5rem',
                        }}>
                            {lesson.learningResourceType}
                        </span>
                        )}

                    {isFirst && (
                      <span style={{
                        background: '#ffd600',
                        color: '#003262',
                        borderRadius: '0.5rem',
                        padding: '0.2rem 0.6rem',
                        fontWeight: 700,
                        marginLeft: 8,
                        fontSize: '0.9rem',
                      }}>Start Here</span>
                    )}
                    {isLast && (
                      <span style={{
                        background: '#26a69a',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        padding: '0.2rem 0.6rem',
                        fontWeight: 700,
                        marginLeft: 8,
                        fontSize: '0.9rem',
                      }}>Next Steps</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
      <style>{`
        @media (max-width: 700px) {
          nav[aria-label='Learning Roadmap'] ol {
            flex-direction: column !important;
          }
          nav[aria-label='Learning Roadmap'] li[tabindex] ol {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
        }
        nav[aria-label='Learning Roadmap'] li[tabindex]:focus {
          outline: 2px solid #003262;
          outline-offset: 2px;
        }
        nav[aria-label='Learning Roadmap'] li[tabindex] li[tabindex]:focus {
          outline: 2px solid #ffd600;
          outline-offset: 2px;
        }
      `}</style>
    </nav>
  );
}
