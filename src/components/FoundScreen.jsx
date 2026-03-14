import { useEffect, useState } from "react";
import { SCREENS } from "../config/screens"; // ajusta ruta si cambia

export default function FoundScreen({ rival, setScreen }) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setScreen(SCREENS.DEBATE);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [setScreen]);

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h1>¡Rival encontrado!</h1>
      <p>Rival: <b>{rival?.username ?? "Rival"}</b></p>
      <p style={{ marginTop: 20 }}>
        Iniciando debate en <b>{seconds}</b>…
      </p>
    </div>
  );
}