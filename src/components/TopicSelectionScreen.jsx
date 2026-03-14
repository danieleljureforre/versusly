import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicSelectionScreen({ categories, onContinue }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [selected, setSelected] = useState({});

  const toggleStance = (topicId, stance) => {
    setSelected((prev) => {
      const newSelected = { ...prev };

      if (newSelected[topicId]?.stance === stance) {
        delete newSelected[topicId];
      } else {
        newSelected[topicId] = {
          stance,
          intro: "",
        };
      }

      return newSelected;
    });
  };

  const setIntro = (topicId, text) => {
    setSelected((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        intro: text,
      },
    }));
  };

  const selectedEntries = Object.entries(selected);
  const selectedCount = selectedEntries.length;

  const isValid =
    selectedCount >= 3 &&
    selectedEntries.every(
      ([, value]) => value.intro.trim().length > 0
    );

  return (
    <div
      style={{
        display: "flex",
        gap: 30,
        maxWidth: 1200,
        margin: "0 auto",
        color: "white",
      }}
    >
      {/* IZQUIERDA - TEMAS */}
      <div style={{ flex: 2 }}>
        <h2 style={{ fontSize: 28, marginBottom: 10 }}>
          Make At Least Three Choices
        </h2>

        <p style={{ color: "#888", marginBottom: 25 }}>
          {selectedCount} / 3 Topics
        </p>

        {categories.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 20 }}>
            <div
              onClick={() =>
                setOpenCategory(
                  openCategory === cat.id ? null : cat.id
                )
              }
              style={{
                cursor: "pointer",
                padding: "16px 20px",
                borderRadius: 14,
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              {cat.title}
            </div>

            <AnimatePresence>
              {openCategory === cat.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  {cat.topics.map((topic) => (
                    <div
                      key={topic.id}
                      style={{
                        background: "#121212",
                        border: "1px solid #2a2a2a",
                        padding: 20,
                        borderRadius: 14,
                        marginTop: 12,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 8,
                          fontSize: 16,
                        }}
                      >
                        {topic.title}
                      </div>

                      <div
                        style={{
                          color: "#777",
                          marginBottom: 12,
                        }}
                      >
                        {topic.description}
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        {topic.sides.map((side) => {
                          const isActive =
                            selected[topic.id]?.stance ===
                            side;

                          return (
                            <button
                              key={side}
                              onClick={() =>
                                toggleStance(
                                  topic.id,
                                  side
                                )
                              }
                              style={{
                                padding: "8px 16px",
                                borderRadius: 999,
                                border: isActive
                                  ? "1px solid #1d9bf0"
                                  : "1px solid #333",
                                background: isActive
                                  ? "#1d9bf0"
                                  : "transparent",
                                color: isActive
                                  ? "white"
                                  : "#aaa",
                                cursor: "pointer",
                                transition:
                                  "all 0.2s ease",
                                fontWeight: 600,
                              }}
                            >
                              {side}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* DERECHA - SELECCIONADOS */}
      <div
        style={{
          flex: 1,
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: 20,
          padding: 20,
          height: "fit-content",
          position: "sticky",
          top: 30,
        }}
      >
        <h3 style={{ marginBottom: 20 }}>
          Your debates
        </h3>

        {selectedEntries.length === 0 && (
          <div style={{ color: "#666" }}>
            You haven´t chosen a topic
          </div>
        )}

        {selectedEntries.map(([topicId, data]) => {
          const topic = categories
            .flatMap((c) => c.topics)
            .find((t) => t.id === topicId);

          return (
            <div
              key={topicId}
              style={{
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: "1px solid #2a2a2a",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {topic?.title}
              </div>

              <div
                style={{
                  color: "#1d9bf0",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                {data.stance}
              </div>

              <textarea
                value={data.intro}
                onChange={(e) =>
                  setIntro(topicId, e.target.value)
                }
                maxLength={200}
                placeholder="Starter Phrase"
                style={{
                  width: "100%",
                  minHeight: 70,
                  padding: 8,
                  borderRadius: 10,
                  border: "1px solid #333",
                  background: "#1a1a1a",
                  color: "white",
                  resize: "none",
                  fontSize: 13,
                }}
              />
            </div>
          );
        })}

        <button
          disabled={!isValid}
          onClick={() => onContinue(selected)}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            background: isValid ? "#1d9bf0" : "#333",
            color: "white",
            fontWeight: 700,
            cursor: isValid
              ? "pointer"
              : "not-allowed",
          }}
        >
          Find Match
        </button>
      </div>
    </div>
  );
}