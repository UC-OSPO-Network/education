// Color-coded skill level badge component
// Green = Beginner, Orange = Intermediate, Red = Advanced
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function SkillBadge({ level }) {
  if (!level) return null;

  const getBadgeStyle = (level) => {
    const normalizedLevel = level.toLowerCase();

    if (normalizedLevel.includes('beginner')) {
      return {
        background: 'linear-gradient(135deg, #00875b 0%, #006b49 100%)',
        color: '#ffffff',
        label: 'Beginner'
      };
    } else if (normalizedLevel.includes('intermediate')) {
      return {
        background: 'linear-gradient(135deg, #a76900 0%, #865400 100%)',
        color: '#ffffff',
        label: 'Intermediate'
      };
    } else if (normalizedLevel.includes('advanced')) {
      return {
        background: 'linear-gradient(135deg, #c1121f 0%, #9f0f1a 100%)',
        color: '#ffffff',
        label: 'Advanced'
      };
    } else {
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
      <ChartBarIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
      {style.label}
    </div>
  );
}
