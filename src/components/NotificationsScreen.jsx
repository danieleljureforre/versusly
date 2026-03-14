import { useEffect, useState } from "react";
import socket from "../config/socket.js";

const API_URL = "http://localhost:3001";

export default function NotificationsScreen({
  currentUser,
  onOpenPost
}) {

  const [notifications, setNotifications] = useState([]);

  /* =========================
     CARGAR NOTIFICACIONES
  ========================= */

  const loadNotifications = () => {

    if (!currentUser?.username) return;

    const data =
      JSON.parse(localStorage.getItem("versusly_notifications") || "{}");

    const list = data[currentUser.username] || [];

    setNotifications(list);

  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  /* =========================
     ESCUCHAR NUEVAS NOTIFICACIONES
  ========================= */

  useEffect(() => {

    const refresh = () => {
      loadNotifications();
    };

    window.addEventListener("versusly_new_notification", refresh);

    return () => {
      window.removeEventListener("versusly_new_notification", refresh);
    };

  }, [currentUser]);

  /* =========================
     SOCKET REALTIME
  ========================= */

  useEffect(() => {

    const handleNotification = () => {
      loadNotifications();
    };

    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };

  }, [currentUser]);

  /* =========================
     MARCAR COMO LEÍDAS
  ========================= */

  useEffect(() => {

    if (!currentUser?.username) return;

    const data =
      JSON.parse(localStorage.getItem("versusly_notifications") || "{}");

    const list = data[currentUser.username] || [];

    const updated = list.map(n => ({
      ...n,
      read: true
    }));

    data[currentUser.username] = updated;

    localStorage.setItem(
      "versusly_notifications",
      JSON.stringify(data)
    );

    setNotifications(updated);

  }, [currentUser]);

  /* =========================
     CLICK NOTIFICACIÓN
  ========================= */

  const handleClick = (notification) => {

    if (notification.postId && onOpenPost) {
      onOpenPost(notification.postId);
    }

  };

  /* =========================
     TIME AGO
  ========================= */

  function timeAgo(timestamp) {

    const date = new Date(timestamp);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "ahora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} d`;

    return `${Math.floor(seconds / 604800)} sem`;

  }

  /* =========================
     AVATAR
  ========================= */

  function buildAvatar(avatar) {

    if (!avatar) return null;

    if (avatar.startsWith("http")) return avatar;

    if (avatar.startsWith("/"))
      return API_URL + avatar;

    return API_URL + "/" + avatar;

  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        color: "white",
        paddingTop: 20
      }}
    >

      <h1 style={{ marginBottom: 30 }}>
        🔔 Notifications
      </h1>

      {notifications.length === 0 && (
        <div style={{ opacity: 0.6 }}>
          No tienes notificaciones todavía.
        </div>
      )}

      {notifications.map((n, i) => {

        let text = "";

        if (n.type === "follow") text = "Followed you";
        if (n.type === "comment") text = "Commented on your debate";
        if (n.type === "reply") text = "Responded to your comment";
        if (n.type === "like") text = "Liked your debate";
        if (n.type === "comment_like") text = "Liked your comment";

        const avatarUrl = buildAvatar(n.avatar);
        const username = n.from || "Usuario";

        return (
          <div
            key={n._id || i}
            onClick={() => handleClick(n)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              borderBottom: "1px solid #1e293b",
              cursor: "pointer",
              transition: "0.2s",
              borderRadius: 8
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#0f172a")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >

            {/* AVATAR */}

            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                overflow: "hidden",
                background: n.avatarColor || "#1d9bf0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }}
            >

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                username?.[0]?.toUpperCase()
              )}

            </div>

            {/* TEXTO */}

            <div style={{ flex: 1 }}>

              <div>
                <strong>{username}</strong> {text}
              </div>

              <div style={{ opacity: 0.5, fontSize: 13 }}>
                {timeAgo(n.date)}
              </div>

            </div>

          </div>

        );

      })}
    </div>
  );
}