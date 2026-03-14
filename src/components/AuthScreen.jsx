import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

export default function AuthScreen({ onAuth }) {
  const [isLogin, setIsLogin] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Si ya hay sesión guardada, entra directo y NO crea otro perfil
  useEffect(() => {
    try {
      const raw = localStorage.getItem("versusly_user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id || user?._id) {
          onAuth?.(user);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      if (!isLogin) {
        // ✅ REGISTER
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError("Completa username, email y contraseña.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Error registrando usuario.");
          setLoading(false);
          return;
        }

        // 🔁 Auto-login después de registrar (porque register suele devolver solo message)
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setError(
            loginData?.message ||
              "Registrado, pero no pude iniciar sesión. Intenta Login."
          );
          setLoading(false);
          return;
        }

        // Guarda sesión
        if (loginData?.token)
          localStorage.setItem("versusly_token", loginData.token);
        if (loginData?.user)
          localStorage.setItem("versusly_user", JSON.stringify(loginData.user));

        onAuth?.(loginData.user);
        setLoading(false);
        return;
      } else {
        // ✅ LOGIN
        if (!email.trim() || !password.trim()) {
          setError("Completa email y contraseña.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Credenciales incorrectas.");
          setLoading(false);
          return;
        }

        if (data?.token) localStorage.setItem("versusly_token", data.token);
        if (data?.user) localStorage.setItem("versusly_user", JSON.stringify(data.user));

        onAuth?.(data.user);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError("Error de red/servidor.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        color: "white",
      }}
    >
      <div
        style={{
          width: 520,
          maxWidth: "95vw",
          background: "rgba(15,23,42,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 26,
          boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
          Debate
        </div>
        <div style={{ opacity: 0.75, marginBottom: 18 }}>
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              color: "rgba(255,255,255,0.92)",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!isLogin && (
          <>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
              Username
            </div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_nombre"
              style={inputStyle}
            />
          </>
        )}

        <div
          style={{
            fontSize: 12,
            opacity: 0.75,
            marginBottom: 8,
            marginTop: 14,
          }}
        >
          Email
        </div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tuemail@gmail.com"
          style={inputStyle}
        />

        <div
          style={{
            fontSize: 12,
            opacity: 0.75,
            marginBottom: 8,
            marginTop: 14,
          }}
        >
          Contraseña
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            background: "#1d9bf0",
            color: "white",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Cargando..." : isLogin ? "Login" : "Crear cuenta"}
        </button>

        <button
          onClick={() => {
            setIsLogin((v) => !v);
            setError("");
          }}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isLogin ? "No tengo cuenta → Register" : "Ya tengo cuenta → Login"}
        </button>

        <div style={{ marginTop: 14, opacity: 0.6, fontSize: 12 }}>
          Si ya habías iniciado sesión antes, entrarás directo sin crear otro perfil.
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.92)",
  color: "#0b1220",
  fontWeight: 600,
};