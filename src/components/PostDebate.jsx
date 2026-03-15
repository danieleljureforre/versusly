import socket from "../config/socket";

const API_URL = "https://versusly.onrender.com";

export default function PostDebate({ result, roomId, currentUser, opponent, onHome }) {

  if (!result) {
    return (
      <div style={{ color: "white", padding: 40 }}>
        Loading result...
      </div>
    );
  }

  const handleRematch = () => {
    socket.emit("request_rematch", { roomId });
  };

  const handlePublish = async () => {
    try {

      console.log("Publishing debate...");

      const myId =
        currentUser?.id ||
        currentUser?._id ||
        currentUser?.userId ||
        "user";

      const mappedMessages = (result.transcript || []).map((m) => ({
        senderId: m.senderId || m.sender || "",
        text: m.text || "",
        timestamp: m.timestamp || Date.now(),
      }));

      const body = {
        topic: result.topicTitle || "Debate",
        intro: result.chosenIntro || "",

        players: [
          {
            userId: myId,
            username: currentUser?.username || "User",
            avatar: currentUser?.avatar || "",
            avatarColor: currentUser?.avatarColor || "#1d9bf0"
          },
          {
            userId: opponent?.id || opponent?._id || "opponent",
            username: opponent?.username || "Opponent",
            avatar: opponent?.avatar || "",
            avatarColor: opponent?.avatarColor || "#ff7675"
          }
        ],

        messages: mappedMessages,

        poll: {
          votesA: 0,
          votesB: 0
        },

        comments: []
      };

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error saving debate");
      }

      console.log("Debate published successfully");

      /* =========================
         NOTIFY FOLLOWERS
      ========================= */

      const followersData =
        JSON.parse(localStorage.getItem("versusly_followers") || "{}");

      const notifications =
        JSON.parse(localStorage.getItem("versusly_notifications") || "{}");

      const followers = followersData[currentUser.username] || [];

      followers.forEach((follower) => {
        notifications[follower] = notifications[follower] || [];

        notifications[follower].unshift({
          type: "debate",
          from: currentUser.username,
          topic: result.topicTitle,
          date: Date.now()
        });
      });

      localStorage.setItem(
        "versusly_notifications",
        JSON.stringify(notifications)
      );

      onHome();

    } catch (err) {
      console.error("Error publishing debate:", err);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: 50,
        background: "#1e1e1e",
        borderRadius: 24,
        textAlign: "center",
        color: "white",
      }}
    >

      <h1>🏁 Debate finished</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginTop: 30,
        }}
      >

        <button
          onClick={handleRematch}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#6c5ce7",
            color: "white",
            cursor: "pointer",
          }}
        >
          🔁 Rematch
        </button>

        <button
          onClick={handlePublish}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#e17055",
            color: "white",
            cursor: "pointer",
          }}
        >
          📝 Publish debate
        </button>

        <button
          onClick={onHome}
          style={{
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#444",
            color: "white",
            cursor: "pointer",
          }}
        >
          🏠 Back to feed
        </button>

      </div>

    </div>
  );

}