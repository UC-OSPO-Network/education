import SkillBadge from "./SkillBadge.jsx";

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatUrlLabel(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LessonCard({ lesson, pathwayIcon, lessonIndex = {}, headingLevel = 2 }) {
  if (!lesson) return null;

  const lessonName = lesson.name || "Untitled Lesson";
  const dependencyRefs = Array.isArray(lesson.dependsOn)
    ? lesson.dependsOn.filter((value) => typeof value === "string" && value.trim() !== "")
    : [];

  const prerequisiteLinks = dependencyRefs
    .map((token) => {
      const value = token.trim();
      if (!value) return null;

      if (isHttpUrl(value)) {
        return {
          key: value,
          href: value,
          label: formatUrlLabel(value),
        };
      }

      const targetLesson = lessonIndex[value];
      if (targetLesson?.url) {
        return {
          key: value,
          href: targetLesson.url,
          label: targetLesson.name || value,
        };
      }

      return null;
    })
    .filter(Boolean);

  const feedbackUrl =
    "https://github.com/UC-OSPO-Network/education/issues/new" +
    "?template=lesson-feedback.yml" +
    `&title=${encodeURIComponent(`Lesson Feedback: ${lessonName}`)}` +
    `&body=${encodeURIComponent(`Lesson: ${lessonName}\n\nFeedback:`)}`;

  const isMultiCategory =
    lesson.learnerCategory &&
    (lesson.learnerCategory.includes(",") || lesson.learnerCategory.includes(";"));

  const lessonHref = `${import.meta.env.BASE_URL}lessons/${lesson.slug}`;
  const roleTags = lesson.oss_role ? lesson.oss_role.split(",").slice(0, 2).map((role) => role.trim()) : [];
  const TitleTag = `h${headingLevel}`;

  return (
    <article className="lesson-card">
      <a className="lesson-card__overlay" href={lessonHref} aria-label={`Open lesson: ${lessonName}`} />
      <div className="lesson-card__header">
        <div className="lesson-card__badge-row">
          <span className="lesson-card__meta-copy">{lesson.learningResourceType || "Lesson"}</span>
          <SkillBadge level={lesson.educationalLevel} />
        </div>

        <div className="lesson-card__title-row">
          <span className="lesson-card__icon" aria-hidden="true">
            {pathwayIcon || "📚"}
          </span>
          <TitleTag className="lesson-card__title">{lessonName}</TitleTag>
        </div>
      </div>

      <div className="lesson-card__body">
        <p className="lesson-card__description">
          {lesson.description || "No description available"}
        </p>

        {prerequisiteLinks.length > 0 ? (
          <div>
            <p className="lesson-card__meta-label">Prerequisites</p>
            <div className="lesson-card__link-list">
              {prerequisiteLinks.map((link) => (
                <a
                  className="lesson-card__interactive"
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <a
          className="lesson-card__feedback lesson-card__interactive"
          href={feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Give feedback
        </a>

        <div className="lesson-card__tags">
          {roleTags.map((role) => (
            <span className="lesson-card__tag lesson-card__tag--accent" key={role}>
              {role}
            </span>
          ))}

          {lesson.learningResourceType ? (
            <span className="lesson-card__tag lesson-card__tag--warm">
              {lesson.learningResourceType}
            </span>
          ) : null}
        </div>

        {isMultiCategory ? (
          <p className="lesson-card__footnote">
            Featured in multiple pathways.
          </p>
        ) : null}
      </div>
    </article>
  );
}
