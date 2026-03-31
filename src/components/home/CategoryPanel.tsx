import type { ReactNode } from 'react';

type CategoryPanelProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  active?: boolean;
  onSelect?: () => void;
  children?: ReactNode;
  actionLabel?: string;
  href?: string;
};

export default function CategoryPanel({
  icon,
  title,
  description,
  active = false,
  onSelect,
  children,
  actionLabel,
  href,
}: CategoryPanelProps) {
  const classes = ['home-category-tab', active ? 'is-active' : '']
    .filter(Boolean)
    .join(' ');

  const trigger = (
    <>
      <span className="home-category-tab__icon">{icon}</span>
      <span className="home-category-tab__copy">
        <span className="home-category-tab__title">{title}</span>
        {description ? (
          <span className="home-category-tab__description">{description}</span>
        ) : null}
      </span>
    </>
  );

  return (
    <article className={classes}>
      <div className="home-category-tab__head">
        {onSelect ? (
          <button
            type="button"
            className="home-category-tab__trigger"
            onClick={onSelect}
            aria-pressed={active}
          >
            {trigger}
          </button>
        ) : (
          <div className="home-category-tab__trigger home-category-tab__trigger--static">{trigger}</div>
        )}
      </div>

      {active ? (
        <div className="home-category-tab__body">
          {children}
          {actionLabel && href ? (
            <div className="home-category-tab__footer">
              <a className="home-category-tab__link" href={href}>
                {actionLabel}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
