import { useState } from "react";

const API_URL = "http://localhost:3001";

function ChatBubble({ text, side }) {
  const isLeft = side === "left";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isLeft ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          position: "relative",
          background: isLeft ? "#1c1f24" : "#1d9bf0",
          color: isLeft ? "#e6e6e6" : "white",
          padding: "14px 18px",
          borderRadius: 20,
          maxWidth: "75%",
          fontSize: 15,
          lineHeight: 1.5,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        {text}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            [isLeft ? "left" : "right"]: -6,
            width: 14,
            height: 14,
            background: isLeft ? "#1c1f24" : "#1d9bf0",
            transform: "rotate(45deg)",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

export default function PostView({ post, currentUser, onBack }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const playerA = post.players?.[0];
  const playerB = post.players?.[1];

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const res = await fetch(
      `${API_URL}/api/posts/${post._id}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id || currentUser._id,
          username: currentUser.username,
          text: commentText,
        }),
      }
    );

    const updated = await res.json();
    setComments(updated.comments);
    setCommentText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleComment();
    }
  };

  return (
    <div style={{ maxWidth: 850, margin: "60px auto" }}>
      {/* Botón volver mejorado */}
      <button
        onClick={onBack}
        style={{
          marginBottom: 30,
          background: "transparent",
          border: "1px solid #2a2f35",
          padding: "10px 18px",
          borderRadius: 14,
          color: "#ccc",
          cursor: "pointer",
        }}
      >
        ← Volver al feed
      </button>

      {/* Tema */}
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        {post.topic}
      </h1>

      <div style={{ opacity: 0.6, marginBottom: 40 }}>
        {playerA?.username} vs {playerB?.username}
      </div>

      {/* Mensajes en burbujas */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginBottom: 50,
        }}
      >
        {Array.isArray(post.messages) &&
  post.messages.map((msg, i) => {

    const allSenders = post.messages
      .map(m => m.senderId || m.sender)
      .filter(Boolean);

    const uniqueSenders = [...new Set(allSenders)];
    const leftSender = uniqueSenders[0];

    const senderId = msg.senderId || msg.sender;
    const isLeft = senderId === leftSender;

    return (
      <ChatBubble
        key={i}
        text={msg.text}
        side={isLeft ? "left" : "right"}
      />
    );
  })}

          return (
            <ChatBubble
              key={i}
              text={msg.text}
              side={isPlayerA ? "left" : "right"}
            />
          );
      </div>

      {/* Comentarios */}
      <h3 style={{ marginBottom: 15 }}>Comentarios</h3>

      <div style={{ marginBottom: 20 }}>
        {comments.map((c, i) => (
          <div
            key={i}
            style={{
              background: "#16181c",
              padding: 14,
              borderRadius: 14,
              marginBottom: 10,
            }}
          >
            <strong>{c.username}</strong>: {c.text}
          </div>
        ))}
      </div>

      {/* Input comentarios */}
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un comentario y presiona Enter..."
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 16,
          border: "1px solid #2a2f35",
          background: "#111",
          color: "white",
          resize: "none",
          minHeight: 60,
        }}
      />

      <button
        onClick={handleComment}
        style={{
          marginTop: 12,
          padding: "12px 22px",
          borderRadius: 16,
          border: "none",
          background: "#1d9bf0",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Comentar
      </button>
    </div>
  );
}