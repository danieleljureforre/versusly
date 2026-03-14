import { useEffect, useState } from "react";

export default function Sidebar({ screen, onNavigate, currentUser }) {

  const [notificationCount, setNotificationCount] = useState(0);

  const updateCount = () => {

    const notifications =
      JSON.parse(localStorage.getItem("versusly_notifications") || "{}");

    const list = notifications[currentUser?.username] || [];

    const unread = list.filter(n => !n.read);

    setNotificationCount(unread.length);
  };
  useEffect(() => {

  const refresh = () => {
    updateCount();
  };

  window.addEventListener("versusly_new_notification", refresh);

  return () => {
    window.removeEventListener("versusly_new_notification", refresh);
  };

}, [currentUser]);

  useEffect(() => {

    updateCount();

  }, [screen, currentUser]);
useEffect(() => {

  const refresh = () => {
    updateCount();
  };

  window.addEventListener("versusly_new_notification", refresh);

  return () => {
    window.removeEventListener("versusly_new_notification", refresh);
  };

}, [currentUser]);

  const linkStyle = (value) => ({
    display: "block",
    padding: "12px 16px",
    marginBottom: 8,
    borderRadius: 8,
    cursor: "pointer",
    background: screen === value ? "#1d9bf0" : "transparent",
    color: screen === value ? "white" : "#ccc",
    border: "none",
    textAlign: "left",
    fontSize: 16,
    position: "relative"
  });

  return (
    <div
      style={{
        width: 250,
        height: "100vh",
        background: "#0f0f0f",
        borderRight: "1px solid #222",
        padding: 20,
        boxSizing: "border-box",
      }}
    >

      <h2 style={{ color: "white", marginBottom: 30 }}>
        Debate
      </h2>

      <button
        style={linkStyle("home")}
        onClick={() => onNavigate("home")}
      >
        🏠 Home
      </button>

      <button
        style={linkStyle("search")}
        onClick={() => onNavigate("search")}
      >
        🔎 Search
      </button>

      <button
        style={linkStyle("notifications")}
        onClick={() => {
          onNavigate("notifications");
          setTimeout(updateCount, 50);
        }}
      >
        🔔 Notifications

        {notificationCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 10,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              padding: "2px 7px",
              fontSize: 12,
              fontWeight: "bold"
            }}
          >
            {notificationCount}
          </span>
        )}

      </button>

      <button
        style={linkStyle("pick_topic")}
        onClick={() => onNavigate("pick_topic")}
      >
        ⚔️ Debate
      </button>

      <button
        style={linkStyle("profile")}
        onClick={() => onNavigate("profile")}
      >
        👤 Profile
      </button>

    </div>
  );
}