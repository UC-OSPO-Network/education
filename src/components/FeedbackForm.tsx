import { useState } from "react";

type FeedbackFormProps = {
    lessonName: string;
};

export default function FeedbackForm({ lessonName }: FeedbackFormProps) {
    const [feedbackType, setFeedbackType] = useState("bug");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonName,
                    feedbackType,
                    description
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Submission failed");

            setMessage("✅ Feedback submitted successfully!");
            setDescription("");
        } catch (err: any) {
            setError(err.message || "Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: "1rem", color: "#fff" }}>
                Lesson Feedback
            </h3>

            {/* Lesson */}
            <div style={{ marginBottom: "0.75rem" }}>
                <label style={labelStyle}>Lesson</label>
                <input
                    type="text"
                    value={lessonName}
                    readOnly
                    style={inputStyle}
                />
            </div>

            {/* Type */}
            <div style={{ marginBottom: "0.75rem" }}>
                <label style={labelStyle}>Feedback Type</label>
                <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    style={inputStyle}
                >
                    <option value="bug">Bug</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="content-quality">Content Quality</option>
                </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ ...inputStyle, resize: "vertical" }}
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: loading ? "#4B5563" : "#1295D8",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer"
                }}
            >
                {loading ? "Submitting..." : "Submit Feedback"}
            </button>

            {/* Messages */}
            {message && (
                <p style={{ marginTop: "0.75rem", color: "#22C55E" }}>
                    {message}
                </p>
            )}
            {error && (
                <p style={{ marginTop: "0.75rem", color: "#EF4444" }}>
                    {error}
                </p>
            )}
        </form>
    );
}

const labelStyle = {
    display: "block",
    marginBottom: "0.25rem",
    fontSize: "0.85rem",
    color: "#CBD5E1"
};

const inputStyle = {
    width: "100%",
    padding: "0.45rem 0.6rem",
    borderRadius: "6px",
    border: "1px solid #374151",
    background: "#111827",
    color: "#F9FAFB",
    fontSize: "0.9rem"
};
