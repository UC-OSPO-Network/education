import { useState } from "react";
import SkillBadge from "./SkillBadge.jsx";
import FeedbackForm from "./FeedbackForm.tsx";

export default function LessonCard({ lesson, pathwayIcon }) {
    if (!lesson) return null;

    const lessonName = lesson.name || "Untitled Lesson";
    const [showFeedback, setShowFeedback] = useState(false);

    // Determine if lesson appears in multiple pathways
    const isMultiCategory =
        lesson.learnerCategory &&
        (lesson.learnerCategory.includes(",") ||
            lesson.learnerCategory.includes(";"));

    return (
        <div
            style={{
                position: "relative",
                background:
                    "linear-gradient(180deg, #2A2A2A 0%, #2A2A2A 35%, #3A3A3A 35%, #3A3A3A 100%)",
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid #3A3A3A",
                transition: "all 0.3s ease",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--uc-light-blue)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(18, 149, 216, 0.4)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#3A3A3A";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => {
                if (!showFeedback && lesson.url) {
                    window.open(lesson.url, "_blank", "noopener,noreferrer");
                }
            }}
        >
            {/* Skill Level Badge */}
            <SkillBadge level={lesson.educationalLevel} />

            {/* Header */}
            <div
                style={{
                    padding: "1.5rem",
                    paddingTop: "3.5rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    minHeight: "120px"
                }}
            >
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>
                    {pathwayIcon || "📚"}
                </div>

                <h3
                    style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "#FFFFFF",
                        lineHeight: "1.4",
                        flex: 1
                    }}
                >
                    {lessonName}
                </h3>
            </div>

            {/* Body */}
            <div
                style={{
                    padding: "1.5rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: "0.95rem",
                        color: "#D4D4D8",
                        lineHeight: "1.6"
                    }}
                >
                    {lesson.description || "No description available"}
                </p>

                {/* Feedback Toggle Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowFeedback((prev) => !prev);
                    }}
                    style={{
                        alignSelf: "flex-start",
                        fontSize: "0.85rem",
                        background: "none",
                        border: "none",
                        color: "#72CDF4",
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0
                    }}
                >
                    💬 {showFeedback ? "Close Feedback" : "Give Feedback"}
                </button>

                {/* Feedback Form */}
                {showFeedback && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            marginTop: "1rem",
                            background: "#1F2933",
                            padding: "1rem",
                            borderRadius: "12px",
                            border: "1px solid #374151"
                        }}
                    >
                        <FeedbackForm lessonName={lessonName} />
                    </div>
                )}

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {lesson.oss_role &&
                        lesson.oss_role
                            .split(",")
                            .slice(0, 2)
                            .map((role, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        padding: "0.35rem 0.85rem",
                                        background: "rgba(18, 149, 216, 0.15)",
                                        border: "1px solid rgba(18, 149, 216, 0.3)",
                                        color: "#72CDF4",
                                        borderRadius: "16px",
                                        fontSize: "0.8rem",
                                        fontWeight: "600"
                                    }}
                                >
                  {role.trim()}
                </span>
                            ))}

                    {lesson.learningResourceType && (
                        <span
                            style={{
                                padding: "0.35rem 0.85rem",
                                background: "rgba(255, 181, 17, 0.15)",
                                border: "1px solid rgba(255, 181, 17, 0.3)",
                                color: "#FFB511",
                                borderRadius: "16px",
                                fontSize: "0.8rem",
                                fontWeight: "600"
                            }}
                        >
              {lesson.learningResourceType}
            </span>
                    )}
                </div>

                {isMultiCategory && (
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: "#9CA3AF",
                            fontStyle: "italic"
                        }}
                    >
                        ✨ This lesson is featured in multiple pathways
                    </p>
                )}
            </div>
        </div>
    );
}
