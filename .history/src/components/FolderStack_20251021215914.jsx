import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FolderStack({ topics }) {
  const [openFolder, setOpenFolder] = useState(null);

  const handleToggle = (topic) => {
    setOpenFolder(openFolder === topic ? null : topic);
  };

  return (
    <div className="relative flex flex-col gap-[-1rem] mt-8">
      {topics.map((topic, index) => (
        <motion.div
          key={topic.topic}
          layout
          onClick={() => handleToggle(topic.topic)}
          className={`relative cursor-pointer rounded-t-2xl bg-[#2A2A2A] text-white shadow-md transition-all duration-300
            ${openFolder === topic.topic ? "z-20 -translate-y-2" : `z-${10 - index}`}
          `}
          style={{
            marginTop: index === 0 ? 0 : "-60px",
            border: "1px solid #3A3A3A",
          }}
        >
          {/* Folder tab */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#3A3A3A] rounded-t-2xl">
            <h3 className="font-medium">{topic.topic}</h3>
          </div>

          {/* Folder body (collapsible area) */}
          <AnimatePresence>
            {openFolder === topic.topic && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-t border-[#4A4A4A]"
              >
                <h2 className="text-lg font-semibold mb-1">{topic.name}</h2>
                <p className="text-sm text-gray-300 mb-2">{topic.learnerCategory}</p>
                <p className="text-sm mb-2">{topic.description}</p>
                <p className="text-xs text-gray-400">
                  <strong>Audience:</strong> {topic.audience}
                  <br />
                  <strong>OSPO Relevance:</strong> {topic["OSPO Relevance"]}
                </p>
                {topic.url && (
                  <a
                    href={topic.url}
                    target="_blank"
                    className="inline-block mt-2 text-blue-400 hover:underline"
                  >
                    View resource →
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}