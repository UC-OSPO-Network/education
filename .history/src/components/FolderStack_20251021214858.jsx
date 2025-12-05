import React, { useState } from "react";

export default function FolderStack({ topics = [] }) {
  const [openTopic, setOpenTopic] = useState(null);

  const toggleTopic = (topic) => {
    setOpenTopic(openTopic === topic ? null : topic);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {topics.map((item, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            backgroundColor: "#2e2e2e",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            padding: "1rem",
            cursor: "pointer",
          }}
          onClick={() => toggleTopic(item.topic)}
        >
          {/* Folder tab */}
          <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            {item.topic}
          </div>

          {/* Posts inside the folder */}
          {openTopic === item.topic && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
              <a href={item.url} target="_blank" style={{ textDecoration: "none", color: "inherit" }}>
                <div
                  style={{
                    border: "1px solid #555",
                    borderRadius: "8px",
                    padding: "1rem",
                    backgroundColor: "#3a3a3a",
                    transition: "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{item.name}</h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem" }}>
                    Learner Category: {item.learnerCategory}
                  </p>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem" }}>{item.description}</p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      color: "#ccc",
                    }}
                  >
                    <span>Audience: {item.audience}</span>
                    <span>OSPO Relevance: {item["OSPO Relevance"]}</span>
                  </div>
                </div>
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}