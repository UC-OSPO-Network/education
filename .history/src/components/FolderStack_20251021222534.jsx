import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Folder({ category, posts, index }) {
  const [open, setOpen] = useState(false);

  const categoryIcons = {
    "Building Community": "🌱",
    "Contributing to a Project": "🛠️",
    "Maintaining and Sustaining Software": "🛡️",
    "Understanding Licensing & Compliance": "📜",
  };

  const icon = categoryIcons[category] || "📁";

  return (
    <div
      style={{
        marginTop: index === 0 ? 0 : -10 * index, // stacked tab offset
        zIndex: 100 - index, // ensure proper layer stacking
      }}
    >
      <motion.div
        className="folder"
        style={{
          cursor: "pointer",
          border: "1px solid #fff",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#1E1E1E",
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Folder Tab */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.9rem 1.25rem",
            background: "#1E1E1E",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "12px", // curved top-right
            fontWeight: 600,
            position: "relative",
            color: "white",
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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ overflow: "hidden", background: "#1E1E1E" }}
            >
              {posts.slice(0, 5).map((post, i) => (
                <motion.div
                  key={i}
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
    </div>
  );
}