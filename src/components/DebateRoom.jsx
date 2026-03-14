import { useEffect, useMemo, useRef, useState } from "react";
import socket from "../config/socket";

const TURN_SECONDS = 60;
const MAX_TURNS = 10;

export default function DebateRoom({
  roomId,
  rivalName,
  topicTitle,
  mySide,
  chosenIntro,
  onExit,
}) {
  const [messages, setMessages] = useState([]);
  const [turn, setTurn] = useState(null);
  const [turnEndsAt, setTurnEndsAt] = useState(null);
  const [turnCounts, setTurnCounts] = useState({});
  const [seconds, setSeconds] = useState(TURN_SECONDS);
  const [input, setInput] = useState("");
  const [officialIntro, setOfficialIntro] = useState(chosenIntro || "");

  const bottomRef = useRef(null);

  const isMyTurn = turn === socket.id;
  const myCount = turnCounts?.[socket.id] || 0;

  const rivalCount = useMemo(() => {
    const ids = Object.keys(turnCounts || {});
    const rivalId = ids.find((id) => id !== socket.id);
    return rivalId ? turnCounts[rivalId] : 0;
  }, [turnCounts]);

  /* ================= SINCRONIZAR PROP ================= */
  useEffect(() => {
    if (chosenIntro) {
      setOfficialIntro(chosenIntro);
    }
  }, [chosenIntro]);

  /* ================= REQUEST STATE ================= */
  useEffect(() => {
    socket.emit("request_state", { roomId }, (res) => {
      if (!res?.ok) return;

      setTurn(res.turn);
      setTurnEndsAt(res.turnEndsAt);
      setTurnCounts(res.turnCounts || {});
      setMessages(res.transcript || []);

      if (res.chosenIntro) {
        setOfficialIntro(res.chosenIntro);
      }
    });
  }, [roomId]);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    const handleTurn = (payload) => {
      if (!payload) return;
      setTurn(payload.turn);
      setTurnEndsAt(payload.turnEndsAt);
      setTurnCounts(payload.turnCounts || {});
    };

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleFinish = (data) => {
  const ids = Object.keys(data?.turnCounts || {});
  const rivalSocketId = ids.find((id) => id !== socket.id) || null;

  onExit(data.reason, {
    ...data,
    topicTitle,
    rivalName,
    rivalSocketId,       // ✅ clave para publicar bien
    transcript: messages,
  });
};

    socket.on("turn_update", handleTurn);
    socket.on("receive_message", handleMessage);
    socket.on("debate_finished", handleFinish);

    return () => {
      socket.off("turn_update", handleTurn);
      socket.off("receive_message", handleMessage);
      socket.off("debate_finished", handleFinish);
    };
  }, [onExit, messages]);

  /* ================= TIMER VISUAL ================= */
  useEffect(() => {
    if (!turnEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((turnEndsAt - Date.now()) / 1000)
      );
      setSeconds(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [turnEndsAt]);

  /* ================= AUTOSCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!isMyTurn) return;
    const clean = input.trim();
    if (!clean) return;

    socket.emit("send_message", { roomId, text: clean });
    setInput("");
  };

  const surrender = () => {
    socket.emit("surrender", { roomId });
  };

  const progress = (seconds / TURN_SECONDS) * 100;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", color: "white" }}>

      {/* FRASE DESTACADA */}
      {officialIntro && (
        <div
          style={{
            marginBottom: 30,
            padding: "28px 32px",
            borderRadius: 24,
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            border: "1px solid #1d9bf0",
            textAlign: "center",
            fontSize: 20,
            fontWeight: 500,
            lineHeight: 1.7,
            boxShadow: "0 0 40px rgba(29,155,240,0.15)",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 10 }}>
            FRASE OFICIAL DEL DEBATE
          </div>
          “{officialIntro}”
        </div>
      )}

      <h2 style={{ marginBottom: 15, fontSize: 28 }}>
        {topicTitle}
      </h2>

      <div style={{ marginBottom: 5 }}>
        <strong>{isMyTurn ? "Your turn" : "Your rival´s turn"}</strong> • {seconds}s
      </div>

      <div style={{ marginBottom: 15 }}>
        You {myCount}/{MAX_TURNS} • Rival {rivalCount}/{MAX_TURNS}
      </div>

      {/* BARRA TIEMPO */}
      <div
  style={{
    height: 8,
    background: "#222",
    borderRadius: 999,
    marginBottom: 20,
    width: "100%",
    overflow: "hidden"
  }}
>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#1d9bf0",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* MENSAJES */}
      <div
        style={{
          minHeight: 320,
          background: "#0c0c0c",
          padding: 18,
          borderRadius: 16,
          marginBottom: 15,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((m, i) => {
  const mine =
    m.senderId === socket.id ||
    m.sender === socket.id;

          return (
            <div
              key={i}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 18,
                background: mine ? "#1d9bf0" : "#222",
                color: mine ? "white" : "#ddd",
                wordBreak: "break-word",
              }}
            >
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      {isMyTurn && (
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            style={{
              flex: 1,
              padding: 12,
              background: "#222",
              color: "white",
              borderRadius: 10,
              border: "1px solid #333",
            }}
          />
          <button
            onClick={send}
            style={{
              padding: "12px 18px",
              background: "#1d9bf0",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </div>
      )}

      {/* RENDIRSE */}
      <button
        onClick={surrender}
        style={{
          marginTop: 20,
          background: "transparent",
          border: "1px solid #444",
          color: "white",
          padding: "8px 14px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Rendirse
      </button>
    </div>
  );
}