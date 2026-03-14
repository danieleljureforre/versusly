import { useState } from "react";

export default function HomeScreen({ onNavigate, posts = [], currentUserId }) {

  const containerStyle = {
    display: "flex",
    height: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
  };

  const sidebarStyle = {
    width: "20%",
    borderRight: "1px solid #eee",
    padding: 20,
  };

  const feedStyle = {
    width: "60%",
    borderRight: "1px solid #eee",
    padding: 20,
    overflowY: "auto",
  };

  const trendsStyle = {
    width: "20%",
    padding: 20,
  };

  const buttonStyle = {
    display: "block",
    marginBottom: 20,
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    textAlign: "left",
  };

  const postCard = {
    borderBottom: "1px solid #eee",
    paddingBottom: 20,
    marginBottom: 20,
  };

  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2>Versusly</h2>

        <button style={buttonStyle} onClick={() => onNavigate("FEED")}>
          🏠 Inicio
        </button>

        <button style={buttonStyle} onClick={() => onNavigate("MATCH")}>
          ⚔️ Debatir
        </button>

        <button style={buttonStyle} onClick={() => onNavigate("PROFILE")}>
          👤 Perfil
        </button>
      </div>

      {/* FEED */}
      <div style={feedStyle}>
        {posts.length === 0 && (
          <p style={{ color: "#777" }}>No hay publicaciones aún.</p>
        )}

        {posts.map((post) => {

          // 🔥 Soporta transcript viejo o messages nuevo
          const messages = post.messages || post.transcript || [];

          return (
            <div key={post._id || post.id} style={postCard}>
              <p style={{ fontWeight: "bold" }}>
                @{post.user || "Usuario"}
              </p>

              <p style={{ fontSize: 20, marginBottom: 15 }}>
                {post.topic || post.topicTitle}
              </p>

              {/* MENSAJES DEL DEBATE */}
              {messages.length > 0 && (
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 15,
                    borderRadius: 12,
                    marginBottom: 15,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}
                >
                  {messages.map((m, i) => {
                    const sender = m.senderId || m.sender;

                    return (
                      <div
                        key={i}
                        style={{
                          alignSelf:
                            sender === currentUserId
                              ? "flex-end"
                              : "flex-start",
                          background:
                            sender === currentUserId
                              ? "#1976d2"
                              : "#ffffff",
                          color:
                            sender === currentUserId
                              ? "white"
                              : "#000",
                          padding: "8px 12px",
                          borderRadius: 16,
                          maxWidth: "70%",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                          wordBreak: "break-word"
                        }}
                      >
                        {m.text}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ color: "#777", fontSize: 14 }}>
                💬 {post.comments?.length || 0} comentarios · 🔁 1 debate
              </div>
            </div>
          );
        })}
      </div>

      {/* TRENDS */}
      <div style={trendsStyle}>
        <h3>🔥 Tendencias</h3>
        <p>#MessiVsCristiano</p>
        <p>#Capitalismo</p>
        <p>#Aborto</p>
        <p>#Milei</p>
      </div>
    </div>
  );
}