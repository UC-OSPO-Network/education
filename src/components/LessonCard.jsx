import { AcademicCapIcon, BookOpenIcon, ChartBarIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const TYPE_ICONS = {
  guide:    BookOpenIcon,
  workshop: UserGroupIcon,
  course:   AcademicCapIcon,
};
import HealthSignalRow from "./HealthSignalRow.jsx";

/** @typedef {import("../lib/githubHealth").HealthRecord} HealthRecord */

function formatDuration(duration) {
  if (!duration?.startsWith("PT")) return null;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const parts = [match[1] ? `${match[1]}h` : "", match[2] ? `${match[2]}m` : ""].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function getLevelConfig(level) {
  if (!level) return { bg: "#6b7280", label: "Lesson" };
  const n = level.toLowerCase();
  if (n.includes("beginner"))     return { bg: "#005d46", label: "Beginner" };
  if (n.includes("intermediate")) return { bg: "#a85a00", label: "Intermediate" };
  if (n.includes("advanced"))     return { bg: "#8a2530", label: "Advanced" };
  return { bg: "#6b7280", label: level };
}

function formatUrlLabel(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * @param {{
 *   lesson: import("../lib/lessons").Lesson;
 *   lessonIndex?: Record<string, { name: string; url: string }>;
 *   headingLevel?: number;
 *   health?: HealthRecord | null;
 * }} props
 */
export default function LessonCard({ lesson, lessonIndex = {}, headingLevel = 3, health = null }) {
  if (!lesson) return null;

  const lessonName = lesson.name || "Untitled Lesson";
  const level = getLevelConfig(lesson.educationalLevel);
  const topMeta = lesson.learningResourceType || lesson.subTopic || "Lesson";
  const TypeIcon = TYPE_ICONS[lesson.learningResourceType?.toLowerCase()] ?? null;
  const roleTags = (lesson.roles ?? []).slice(0, 2);
  const duration = formatDuration(lesson.timeRequired);

  const prerequisiteLinks = (lesson.prerequisites ?? [])
    .map((prereq) => {
      if (prereq.type === "url") {
        return {
          key: prereq.value,
          href: prereq.value,
          label: prereq.label ?? formatUrlLabel(prereq.value),
        };
      }
      if (prereq.type === "lesson") {
        const target = lessonIndex[prereq.value];
        if (target?.url) {
          return { key: prereq.value, href: target.url, label: target.name || prereq.value };
        }
      }
      return null;
    })
    .filter(Boolean);

  const isMultiPathway = (lesson.pathways ?? []).length > 1;
  const lessonHref = `${import.meta.env.BASE_URL}lessons/${lesson.slug}`;
  const TitleTag = `h${headingLevel}`;

  return (
    <article className="lesson-card">
      <a className="lesson-card__cover-link" href={lessonHref} aria-label="Open lesson page"></a>


      {/* Colored level band */}
      <div className="lesson-card__band" style={{ background: level.bg }}>
        <ChartBarIcon className="lesson-card__band-icon" />
        <span>{level.label}</span>
        {duration && (
          <>
            <span className="lesson-card__band-sep" aria-hidden="true">·</span>
            <span>{duration}</span>
          </>
        )}
      </div>

      {/* Dark metadata strip */}
      <div className="lesson-card__meta-strip">
        <p className="lesson-card__meta-type">
          {TypeIcon && <TypeIcon className="lesson-card__meta-type-icon" aria-hidden="true" />}
          {topMeta}
        </p>
        {roleTags.length > 0 && (
          <p className="lesson-card__meta-role">{roleTags.join(", ")}</p>
        )}
      </div>

      {/* Body */}
      <div className="lesson-card__body">
        <TitleTag className="lesson-card__title">
          {/* Stretched link — ::after covers the full card; prereq links sit above it via z-index */}
          <a href={lessonHref} className="lesson-card__title-link">
            {lessonName}
          </a>
        </TitleTag>

        <p className="lesson-card__description">
          {lesson.description || "No description available."}
        </p>

        {prerequisiteLinks.length > 0 && (
          <div className="lesson-card__prereqs">
            <p className="lesson-card__prereq-label">Prerequisites</p>
            {prerequisiteLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="lesson-card__prereq-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {isMultiPathway && (
          <p className="lesson-card__multi-pathway">Featured in multiple pathways</p>
        )}

        <HealthSignalRow health={health} />
      </div>
    </article>
  );
}
