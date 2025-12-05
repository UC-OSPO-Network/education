import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Folder({ category, posts }) {
  const [open, setOpen] = useState(false);

  // Map each learnerCategory to a unique emoji
  const categoryIcons = {
    "Building Community": "🌱",
    "Contributing to a Project": "🛠️",
    "Technical Skills": "💻",
    "Learning": "📘",
    "Advanced Concepts": "🚀",
    "Uncategorized": "📄",
  };

  // Get emoji for this category
  const icon = categoryIcons[category] || "📁";

  return (
    <motion.div
      className="folder-stack"
      initial={{ rotateX: 0 }}
      whileHover={{ rotateX: 2, y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      style={{
        perspective: "1000px",
        marginBottom: "2.5rem",
        color: "white",
      }}
    >
      <motion.div
        className="folder"
        style={{
          background: "#2A2A2A",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          y: -2,
          boxShadow: "0 14px 36px rgba(0,0,0,0.6)",
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Folder Header */}
        <div
          className="folder-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            background: "#333",
            borderBottom: "1px solid #444",
            fontWeight: 600,
            position: "relative",
          }}
        >
          <span style={{ fontSize: "1.4rem" }}>{icon}</span>
          <span>{category}</span>
          <span
            style={{
              marginLeft: "auto",
              transition: "transform 0.3s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>

        {/* Folder Content */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="folder-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ background: "#2B2B2B", overflow: "hidden" }}
            >
              {posts.slice(0, 5).map((post, i) => (
                <motion.div
                  key={i}
                  className="post"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: "1rem 1.25rem",
                    borderTop: "1px solid #3A3A3A",
                  }}
                >
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    <h3
                      style={{
                        color: "#007ACC",
                        marginBottom: "0.3rem",
                        fontSize: "1.1rem",
                      }}
                    >
                      {post.name || "Untitled"}
                    </h3>
                    <p style={{ color: "#ccc", margin: "0.25rem 0" }}>
                      <strong>Topic:</strong> {post.Topic || "N/A"}
                    </p>
                    <p style={{ color: "#ccc", margin: "0.25rem 0" }}>
                      {post.description || "No description"}
                    </p>
                    <small style={{ color: "#888" }}>
                      Audience: {post.audience || "N/A"} | OSPO Relevance:{" "}
                      {post["OSPO Relevance"] || "N/A"}
                    </small>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}