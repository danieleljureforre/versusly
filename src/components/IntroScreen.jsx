import { useEffect, useRef, useState } from "react";
import socket from "../config/socket";

export default function IntroScreen({
  roomId,
  topicTitle,
  mySide,
  onReady,
}) {
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(15);
  const sentRef = useRef(false);

  // ⏳ Countdown automático
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          sendIntro();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendIntro = () => {
    if (sentRef.current) return;

    socket.emit("submit_intro", {
      roomId,
      intro: text.trim(),
    });

    sentRef.current = true;
  };

  // 🔥 Cuando backend elige la frase
  useEffect(() => {
    const handleIntroReady = ({ chosenIntro }) => {
      onReady(chosenIntro);
    };

    socket.on("intro_ready", handleIntroReady);

    return () => {
      socket.off("intro_ready", handleIntroReady);
    };
  }, [onReady]);

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 40 }}>
      <h2>Frase inicial</h2>

      <div style={{ marginBottom: 20, opacity: 0.85 }}>
        <div>
          <strong>Tema:</strong> {topicTitle}
        </div>
        <div>
          <strong>Tu postura:</strong> {mySide}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        ⏳ Tiempo restante: {seconds}s
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu frase inicial..."
        style={{
          width: "100%",
          height: 140,
          padding: 14,
          borderRadius: 12,
          border: "1px solid #333",
          background: "#111",
          color: "white",
          resize: "none",
          fontSize: 15,
        }}
      />

      <div style={{ marginTop: 15, opacity: 0.6 }}>
        La frase se enviará automáticamente cuando termine el tiempo.
      </div>
    </div>
  );
}