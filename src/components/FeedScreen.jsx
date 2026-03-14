import { useState, useMemo, useEffect } from "react";

const API_URL = "http://localhost:3001";

export default function FeedScreen({
  posts = [],
  currentUser,
  onOpenPost,
  onOpenProfile
}) {

  const [tab, setTab] = useState("for_you");
  const [feedPosts, setFeedPosts] = useState(posts);

  useEffect(() => {
    setFeedPosts(posts);
  }, [posts]);

  const following =
    JSON.parse(localStorage.getItem("versusly_following") || "{}")[
      currentUser?.username
    ] || [];

  const filteredPosts = useMemo(() => {

    if (tab === "for_you") return feedPosts;

    return feedPosts.filter((post) =>
      post.players?.some((p) => following.includes(p.username))
    );

  }, [tab, feedPosts, following]);

  const buildAvatar = (avatar) => {
    if (!avatar) return null;

    if (avatar.startsWith("http")) return avatar;

    if (avatar.startsWith("/"))
      return API_URL + avatar;

    return API_URL + "/" + avatar;
  };

  async function likePost(postId, e) {

    e.stopPropagation();

    const res = await fetch(
      `${API_URL}/api/posts/${postId}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id
        })
      }
    );

    const data = await res.json();

    setFeedPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? { ...p, likes: data.likes }
          : p
      )
    );

  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* TABS */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #1e293b",
          marginBottom: 20
        }}
      >

        <div
          onClick={() => setTab("for_you")}
          style={{
            flex: 1,
            textAlign: "center",
            padding: 14,
            cursor: "pointer",
            fontWeight: 700,
            borderBottom:
              tab === "for_you"
                ? "2px solid #1d9bf0"
                : "2px solid transparent"
          }}
        >
          For You
        </div>

        <div
          onClick={() => setTab("following")}
          style={{
            flex: 1,
            textAlign: "center",
            padding: 14,
            cursor: "pointer",
            fontWeight: 700,
            borderBottom:
              tab === "following"
                ? "2px solid #1d9bf0"
                : "2px solid transparent"
          }}
        >
          Followed
        </div>

      </div>

      {filteredPosts.length === 0 && (
        <div style={{ opacity: 0.6 }}>
          No hay debates todavía.
        </div>
      )}

      {filteredPosts.map((post) => {

        const playerA = post.players?.[0] || {};
        const playerB = post.players?.[1] || {};

        const previewMessages = post?.messages?.slice(0, 4) || [];

        const avatarA =
          buildAvatar(playerA.avatar) ||
          (playerA.username === currentUser?.username
            ? buildAvatar(currentUser?.avatar)
            : null);

        const avatarB =
          buildAvatar(playerB.avatar) ||
          (playerB.username === currentUser?.username
            ? buildAvatar(currentUser?.avatar)
            : null);

        return (
          <div
            key={post._id}
            onClick={() => onOpenPost(post)}
            style={{
              background: "#020617",
              borderBottom: "1px solid #1e293b",
              padding: 20,
              cursor: "pointer"
            }}
          >

            {/* HEADER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10
              }}
            >

              {/* AVATAR A */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile?.(playerA.username);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: playerA.avatarColor || "#1d9bf0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "white",
                  cursor: "pointer"
                }}
              >
                {avatarA ? (
                  <img
                    src={avatarA}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  playerA.username?.charAt(0)?.toUpperCase()
                )}
              </div>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile?.(playerA.username);
                }}
                style={{ fontWeight: 600, cursor: "pointer" }}
              >
                {playerA.username}
              </span>

              <span style={{ opacity: 0.6 }}>vs</span>

              {/* AVATAR B */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile?.(playerB.username);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: playerB.avatarColor || "#1d9bf0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "white",
                  cursor: "pointer"
                }}
              >
                {avatarB ? (
                  <img
                    src={avatarB}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  playerB.username?.charAt(0)?.toUpperCase()
                )}
              </div>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile?.(playerB.username);
                }}
                style={{ fontWeight: 600, cursor: "pointer" }}
              >
                {playerB.username}
              </span>

            </div>

            {/* TEMA */}
            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                marginBottom: 12
              }}
            >
              🎤 {post.topic}
            </div>

            {/* CHAT PREVIEW */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 10
              }}
            >

              {previewMessages.map((msg, i) => {

                const left = i % 2 === 0;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: left ? "flex-start" : "flex-end"
                    }}
                  >

                    <div
                      style={{
                        background: left ? "#1e293b" : "#1d9bf0",
                        padding: "8px 12px",
                        borderRadius: 14,
                        maxWidth: "70%",
                        fontSize: 14,
                        color: "white"
                      }}
                    >
                      {msg.text}
                    </div>

                  </div>
                );
              })}

            </div>

            {/* STATS */}
            <div
              style={{
                display: "flex",
                gap: 18,
                fontSize: 13,
                opacity: 0.7
              }}
            >

              <span
                onClick={(e) => likePost(post._id, e)}
                style={{ cursor: "pointer" }}
              >
                ❤️ {post.likes?.length || 0}
              </span>

              <span>💬 {post.comments?.length || 0}</span>

              <span>
                🗳 {(post.poll?.votesA || 0) + (post.poll?.votesB || 0)}
              </span>

              <span>
                🧠 {post.messages?.length || 0}
              </span>

            </div>

          </div>
        );

      })}

    </div>
  );
}