import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Folder({ category, posts }) {
  const [open, setOpen] = useState(false);

  const categoryIcons = {
    "Building Community": "🌱",
    "Contributing to a Project": "🛠️",
    "Maintaining and Sustaining Software": "🛡️",
    "Understanding Licensing & Compliance": "📜",
  };

  const icon = categoryIcons[category] || "📁";

  return (
    <motion.div
      className="folder-stack"
      style={{
        perspective: "1000px",
        marginBottom: "-3rem", // negative margin to overlap folders
        color: "white",
      }}
    >
      <motion.div
        className="folder"
        style={{
          background: "#F3E5AB", // manila color
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          cursor: "pointer",
          transformStyle: "preserve-3d",
          position: "relative",
        }}
        whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.35)" }}
        onClick={() => setOpen(!open)}
      >
        {/* Tab */}
        <div
          style={{
            position: "absolute",
            top: "-1.5rem",
            left: "1rem",
            background: "#FFD97D",
            padding: "0.25rem 1rem",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <span>{icon}</span>
          <span>{category}</span>
        </div>

        {/* Folder Body */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="folder-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                padding: "2rem 1.25rem 1rem 1.25rem",
                borderTop: "1px solid rgba(0,0,0,0.2)",
              }}
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
                    marginBottom: "1rem",
                  }}
                >
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#333",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    <h3 style={{ margin: "0 0 0.25rem 0" }}>
                      {post.name || "Untitled"}
                    </h3>
                    <p style={{ margin: "0.25rem 0" }}>
                      <strong>Topic:</strong> {post.Topic || "N/A"}
                    </p>
                    <p style={{ margin: "0.25rem 0" }}>
                      {post.description || "No description"}
                    </p>
                    <small style={{ color: "#555" }}>
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