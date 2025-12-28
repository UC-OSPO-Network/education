// Color-coded skill level badge component
// Green = Beginner, Orange = Intermediate, Red = Advanced

export default function SkillBadge({ level }) {
  if (!level) return null;

  // Determine badge color based on skill level
  const getBadgeStyle = (level) => {
    const normalizedLevel = level.toLowerCase();

    if (normalizedLevel.includes('beginner')) {
      return {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        label: 'Beginner'
      };
    } else if (normalizedLevel.includes('intermediate')) {
      return {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: '#ffffff',
        label: 'Intermediate'
      };
    } else if (normalizedLevel.includes('advanced')) {
      return {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#ffffff',
        label: 'Advanced'
      };
    } else {
      // Default fallback for any other level
      return {
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        color: '#ffffff',
        label: level
      };
    }
  };

  const style = getBadgeStyle(level);

  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: style.background,
      color: style.color,
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      zIndex: 10
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="1" y="11" width="3" height="4" fill="currentColor" opacity="0.6"/>
        <rect x="6" y="7" width="3" height="8" fill="currentColor" opacity="0.8"/>
        <rect x="11" y="3" width="3" height="12" fill="currentColor"/>
      </svg>
      {style.label}
    </div>
  );
}
