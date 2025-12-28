import { useState } from 'react';

const PATHWAYS = [
  {
    id: 'getting-started',
    name: 'GETTING STARTED WITH OPEN SOURCE',
    description: 'For learners new to open source and open collaboration.',
    icon: '🧩'
  },
  {
    id: 'contributing',
    name: 'CONTRIBUTING TO A PROJECT',
    description: 'For those ready to write code, open issues, or create documentation.',
    icon: '🤝'
  },
  {
    id: 'maintaining',
    name: 'MAINTAINING & SUSTAINING SOFTWARE',
    description: 'For maintainers, project leads, and tech stewards.',
    icon: '🛠'
  },
  {
    id: 'building-communities',
    name: 'BUILDING INCLUSIVE COMMUNITIES',
    description: 'For those organizing people, not just code.',
    icon: '🌱'
  },
  {
    id: 'licensing',
    name: 'UNDERSTANDING LICENSING & COMPLIANCE',
    description: 'For anyone navigating open source legalities, especially in a UC context.',
    icon: '⚖️'
  },
  {
    id: 'strategic',
    name: 'STRATEGIC PRACTICES & CAREER DEVELOPMENT',
    description: 'For project leaders, RSEs, and open science strategists.',
    icon: '📈'
  }
];

export default function StackedPathways() {
  const [expandedId, setExpandedId] = useState('getting-started');

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
      position: 'relative'
    }}>
      {PATHWAYS.map((pathway, index) => {
        const isExpanded = expandedId === pathway.id;
        const zIndex = isExpanded ? 1000 : PATHWAYS.length - index;

        return (
          <div
            key={pathway.id}
            onClick={() => setExpandedId(pathway.id)}
            style={{
              position: 'relative',
              marginBottom: isExpanded ? '2rem' : '-20px',
              zIndex,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isExpanded ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div style={{
              background: isExpanded ? '#D4D4D8' : '#2A2A2A',
              borderRadius: '24px',
              border: `2px solid ${isExpanded ? 'transparent' : '#3A3A3A'}`,
              padding: isExpanded ? '2rem' : '1.5rem',
              boxShadow: isExpanded
                ? '0 20px 40px rgba(0, 0, 0, 0.6)'
                : '0 4px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{
                  fontSize: isExpanded ? '2rem' : '1.5rem',
                  transition: 'font-size 0.3s ease'
                }}>
                  {pathway.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: isExpanded ? '1.3rem' : '1.1rem',
                    fontWeight: '700',
                    color: isExpanded ? '#1E1E1E' : '#FFFFFF',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.5px'
                  }}>
                    {pathway.name}
                  </h3>
                  {isExpanded && (
                    <p style={{
                      margin: '0.75rem 0 0 0',
                      fontSize: '1rem',
                      color: '#3A3A3A',
                      fontStyle: 'italic',
                      lineHeight: '1.5',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      {pathway.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
