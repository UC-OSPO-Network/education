import { ChartBarIcon } from "@heroicons/react/24/outline";
import HealthSignalRow from "./HealthSignalRow.jsx";

/** @typedef {import("../lib/githubHealth").HealthRecord} HealthRecord */

function formatUrlLabel(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getLevelConfig(level) {
  if (!level) return { bg: "#6b7280", label: "Lesson" };
  const n = level.toLowerCase();
  if (n.includes("beginner"))     return { bg: "#005d46", label: "Beginner" };
  if (n.includes("intermediate")) return { bg: "#a85a00", label: "Intermediate" };
  if (n.includes("advanced"))     return { bg: "#8a2530", label: "Advanced" };
  return { bg: "#6b7280", label: level };
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
  const roleTags = (lesson.roles ?? []).slice(0, 2);

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

  const feedbackUrl =
    "https://github.com/UC-OSPO-Network/education/issues/new" +
    "?template=lesson-feedback.yml" +
    `&title=${encodeURIComponent(`Lesson Feedback: ${lessonName}`)}` +
    `&body=${encodeURIComponent(`Lesson: ${lessonName}\n\nFeedback:`)}`;

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
      </div>

      {/* Dark metadata strip */}
      <div className="lesson-card__meta-strip">
        <p className="lesson-card__meta-type">{topMeta}</p>
        {roleTags.length > 0 && (
          <p className="lesson-card__meta-role">{roleTags.join(", ")}</p>
        )}
      </div>

      {/* Body */}
      <div className="lesson-card__body">
        <TitleTag className="lesson-card__title">{lessonName}</TitleTag>

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
                onClick={(e) => e.stopPropagation()}
                className="lesson-card__prereq-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <a
          href={feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="lesson-card__feedback"
        >
          💬 Give Feedback
        </a>

        {isMultiPathway && (
          <p className="lesson-card__multi-pathway">
            ✨ Featured in multiple pathways
          </p>
        )}

        <HealthSignalRow health={health} />
      </div>
    </article>
  );
}
