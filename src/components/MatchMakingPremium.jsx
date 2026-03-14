import { motion } from "framer-motion";
import { useEffect } from "react";
import socket from "../config/socket";

export default function MatchmakingPremium({
  stanceMap,
  currentUser,
  onMatchFound,
  onCancel,
}) {

  useEffect(() => {

    if (!stanceMap || Object.keys(stanceMap).length === 0) return;

    socket.emit("find_match", {
      stanceMap,
      user: currentUser
    });

    const handleMatch = (data) => {

      const opponent = data?.opponent || {};

      const safeOpponent = {
        id: opponent?.id || opponent?._id || "rival",
        username: opponent?.username || "Rival",
        avatar: opponent?.avatar || "",
        avatarColor: opponent?.avatarColor || "#1d9bf0"
      };

      onMatchFound?.({
        ...data,
        opponent: safeOpponent
      });

    };

    socket.on("match_found", handleMatch);

    return () => {
      socket.off("match_found", handleMatch);
    };

  }, [stanceMap, currentUser, onMatchFound]);

  const handleCancel = () => {
    socket.emit("cancel_match");
    onCancel?.();
  };

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "0 auto",
        marginTop: 120,
        textAlign: "center",
        color: "white",
      }}
    >
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Searching For rival...
      </motion.h2>

      <p style={{ opacity: 0.7, marginTop: 10 }}>
        We are looking for an opposite.
      </p>

      <button
        onClick={handleCancel}
        style={{
          marginTop: 25,
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid #2f3336",
          background: "#16181c",
          color: "white",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Cancelar
      </button>
    </div>
  );
}