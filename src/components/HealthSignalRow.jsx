const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCompactNumber(value) {
  return compactNumberFormatter.format(value ?? 0);
}

function formatRelativeDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 30) return `${Math.max(1, diffDays)}d ago`;

  const diffMonths =
    (now.getUTCFullYear() - date.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - date.getUTCMonth());

  if (diffMonths < 12) return `${Math.max(1, diffMonths)}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

function isStale(dateString) {
  if (!dateString) return false;
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const monthDiff =
    (now.getUTCFullYear() - date.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - date.getUTCMonth());

  return monthDiff > 18 || (monthDiff === 18 && now.getUTCDate() > date.getUTCDate());
}

function stopCardNavigation(event) {
  event.stopPropagation();
}

/**
 * @param {{ health: import("../lib/githubHealth").HealthRecord | null | undefined }} props
 */
export default function HealthSignalRow({ health }) {
  if (!health) return null;

  const repoUrl = health.repoUrl;
  const stars = health.stars ?? 0;
  const relativePushedAt = formatRelativeDate(health.pushedAt);
  const stale = isStale(health.pushedAt);
  const contributorLabel = health.contributorCount == null
    ? null
    : `${formatCompactNumber(health.contributorCount)}${health.contributorCountTruncated ? "+" : ""}`;

  return (
    <div className="lesson-card__health" role="group" aria-label="GitHub repository health signals">
      {/* Stars, forks, contributors, license, funding, CoC temporarily hidden — data still in github-health.json */}
      {/* Restore by uncommenting the blocks below */}
      {/* {repoUrl ? (
        <a href={repoUrl} target="_blank" rel="noopener noreferrer"
          title="Star this lesson on GitHub"
          aria-label={`${stars} stars — Star this lesson on GitHub (opens in new tab)`}
          className="lesson-card__health-link" onClick={stopCardNavigation}>
          <span aria-hidden="true">⭐</span> {formatCompactNumber(stars)}
        </a>
      ) : (
        <span className="lesson-card__health-item" title={`${stars} stars`}>
          <span aria-hidden="true">⭐</span> {formatCompactNumber(stars)}
        </span>
      )} */}
      {/* <span className="lesson-card__health-item" title={`${health.forks ?? 0} forks`}>
        <span aria-hidden="true">🍴</span> {formatCompactNumber(health.forks ?? 0)}
      </span> */}
      {/* {contributorLabel && (
        <span className="lesson-card__health-item"
          title={`${health.contributorCount}${health.contributorCountTruncated ? "+" : ""} contributors`}>
          <span aria-hidden="true">👥</span> {contributorLabel}
        </span>
      )} */}

      {relativePushedAt && (
        <span className={`lesson-card__health-item${stale ? " lesson-card__health-item--stale" : ""}`}>
          Updated {relativePushedAt}
        </span>
      )}

      {/* {health.license && (
        <span className="lesson-card__health-item" title={`License: ${health.license}`}>
          {health.license}
        </span>
      )} */}
      {/* {health.hasFunding && health.sponsorsUrl && (
        <a href={health.sponsorsUrl} target="_blank" rel="noopener noreferrer"
          className="lesson-card__health-link lesson-card__health-link--sponsor"
          aria-label="Sponsor this lesson's maintainers on GitHub (opens in new tab)"
          onClick={stopCardNavigation}>
          <span aria-hidden="true">💚</span> Sponsorable
        </a>
      )} */}
      {/* {health.hasCodeOfConduct && (
        <span className="lesson-card__health-item" title="Has Code of Conduct"
          role="img" aria-label="Has Code of Conduct">
          <span aria-hidden="true">🤝</span>
        </span>
      )} */}
    </div>
  );
}
