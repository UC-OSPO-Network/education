import {
  PuzzlePieceIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  ScaleIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import type { CategoryIconName } from './types';

type CategoryIconProps = {
  name: CategoryIconName;
  size?: number;
  decorative?: boolean;
};

export default function CategoryIcon({
  name,
  size = 22,
  decorative = true,
}: CategoryIconProps) {
  const label = name.replace(/-/g, ' ');
  const sharedProps = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label };

  const style = { width: size, height: size };

  const iconMap: Record<CategoryIconName, JSX.Element> = {
    'getting-started': <PuzzlePieceIcon style={style} />,
    contributing:      <UserGroupIcon style={style} />,
    maintaining:       <WrenchScrewdriverIcon style={style} />,
    'building-communities': <SparklesIcon style={style} />,
    licensing:         <ScaleIcon style={style} />,
    strategic:         <PresentationChartLineIcon style={style} />,
  };

  return (
    <span className="home-category-icon" {...sharedProps}>
      {iconMap[name]}
    </span>
  );
}
