import { useState } from "react";

const API_URL = "http://localhost:3001";

export default function PostModal({ post, currentUser, onClose }) {

  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes || []);
  const [commentText, setCommentText] = useState("");

  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const [openReplies, setOpenReplies] = useState({});

  /* =========================
     LIKE DEBATE
  ========================= */

  async function likeDebate() {

    const res = await fetch(
      `${API_URL}/api/posts/${post._id}/like`,
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

    setLikes(data.likes);

  }

  /* =========================
     LIKE COMENTARIO / RESPUESTA
  ========================= */

  async function likeItem(id) {

    const res = await fetch(
      `${API_URL}/api/posts/${post._id}/comment/${id}/like`,
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

    setComments(prev =>
      prev.map(c => ({

        ...c,

        likes: c._id === id ? data.likes : c.likes,

        replies: (c.replies || []).map(r => ({
          ...r,
          likes: r._id === id ? data.likes : r.likes,

          replies: (r.replies || []).map(rr => ({
            ...rr,
            likes: rr._id === id ? data.likes : rr.likes
          }))
        }))

      }))
    );

  }

  /* =========================
     COMENTAR
  ========================= */

  async function sendComment() {

    const text = commentText.trim();
    if (!text) return;

    const res = await fetch(
      `${API_URL}/api/posts/${post._id}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          avatarColor: currentUser.avatarColor,
          text
        })
      }
    );

    const newComment = await res.json();

    setComments(prev => [...prev, newComment]);

    setCommentText("");

  }

  /* =========================
     RESPONDER
  ========================= */

  async function sendReply() {

    const text = replyText.trim();
    if (!text || !replyingTo) return;

    const res = await fetch(
      `${API_URL}/api/posts/${post._id}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commentId: replyingTo.commentId,
          parentReplyId: replyingTo.parentReplyId || null,
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          avatarColor: currentUser.avatarColor,
          text,
          replyToUsername: replyingTo.replyToUsername || null
        })
      }
    );

    const newReply = await res.json();

    setComments(prev =>
      prev.map(c => {

        if (c._id !== replyingTo.commentId) return c;

        if (!replyingTo.parentReplyId) {

          return {
            ...c,
            replies: [...(c.replies || []), newReply]
          };

        }

        return {
          ...c,
          replies: (c.replies || []).map(r =>
            r._id === replyingTo.parentReplyId
              ? { ...r, replies: [...(r.replies || []), newReply] }
              : r
          )
        };

      })
    );

    setReplyText("");
    setReplyingTo(null);

    setOpenReplies(prev => ({
      ...prev,
      [replyingTo.commentId]: true
    }));

  }

  /* =========================
     AVATAR COMPONENT
  ========================= */

  function Avatar({ user }) {

    if (user?.avatar) {
      return (
        <img
          src={user.avatar.startsWith("http")
            ? user.avatar
            : `${API_URL}/${user.avatar}`
          }
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            objectFit: "cover"
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: user?.avatarColor || "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}
      >
        {user?.username?.charAt(0)?.toUpperCase()}
      </div>
    );

  }

  /* =========================
     REPLY CARD
  ========================= */

  function ReplyCard({ item, onReply, onLike, level = 0 }) {

    const nestedReplies = item.replies || [];

    return (

      <div style={{ marginTop: 10, marginLeft: level > 0 ? 20 : 0 }}>

        <div style={{
          background: "#1e293b",
          padding: 14,
          borderRadius: 10,
          display: "flex",
          gap: 10
        }}>

          <Avatar user={item} />

          <div>

            <b>{item.username}</b>{" "}

            {item.replyToUsername && (
              <span style={{ color: "#93c5fd" }}>
                respondiendo a @{item.replyToUsername}
              </span>
            )}

            <div>{item.text}</div>

            <div style={{
              marginTop: 8,
              display: "flex",
              gap: 15,
              fontSize: 14
            }}>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => onLike(item._id)}
              >
                ❤️ {item.likes?.length || 0}
              </span>

              <span
                style={{ cursor: "pointer", color: "#60a5fa" }}
                onClick={onReply}
              >
                responder
              </span>

            </div>

          </div>

        </div>

        {nestedReplies.map(rr => (

          <ReplyCard
            key={rr._id}
            item={rr}
            level={level + 1}
            onLike={onLike}
            onReply={() =>
              onReply({
                parentReplyId: item._id,
                replyToUsername: item.username
              })
            }
          />

        ))}

      </div>

    );

  }

  return (

    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 760,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#0f172a",
          borderRadius: 20,
          padding: 30,
          color: "white"
        }}
      >

        <h2 style={{ marginBottom: 10 }}>{post.topic}</h2>

        {/* LIKE DEBATE */}

        <div style={{ marginBottom: 20 }}>
          <span
            style={{ cursor: "pointer", fontSize: 16 }}
            onClick={likeDebate}
          >
            ❤️ {likes.length}
          </span>
        </div>

        {/* =========================
           MENSAJES DEL DEBATE
        ========================= */}

        <div style={{ marginBottom: 35 }}>

          {post.messages?.map((m, i) => {

            const isLeft = i % 2 === 0;

            const player = isLeft
              ? post.players?.[0]
              : post.players?.[1];

            return (

              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isLeft ? "flex-start" : "flex-end",
                  marginBottom: 14
                }}
              >

                <div style={{
                  display: "flex",
                  flexDirection: isLeft ? "row" : "row-reverse",
                  gap: 8,
                  maxWidth: "70%"
                }}>

                  <Avatar user={player} />

                  <div style={{
                    background: isLeft ? "#1e293b" : "#2563eb",
                    padding: "10px 14px",
                    borderRadius: 14
                  }}>
                    {m.text}
                  </div>

                </div>

              </div>

            );

          })}

        </div>

        {/* COMENTAR */}

        <div style={{
          display: "flex",
          gap: 10,
          marginBottom: 30
        }}>

          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe un comentario..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendComment();
              }
            }}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "none"
            }}
          />

          <button
            onClick={sendComment}
            style={{
              background: "#2563eb",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              color: "white",
              cursor: "pointer"
            }}
          >
            Comentar
          </button>

        </div>

        {/* COMENTARIOS */}

        {comments.map(c => {

          const replies = c.replies || [];
          const isOpen = !!openReplies[c._id];

          return (

            <div key={c._id} style={{ marginBottom: 20 }}>

              <div style={{
                background: "#1e293b",
                padding: 14,
                borderRadius: 10,
                display: "flex",
                gap: 10
              }}>

                <Avatar user={c} />

                <div>

                  <b>{c.username}</b>
                  <div>{c.text}</div>

                  <div style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 15,
                    fontSize: 14
                  }}>

                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => likeItem(c._id)}
                    >
                      ❤️ {c.likes?.length || 0}
                    </span>

                    <span
                      style={{ cursor: "pointer", color: "#60a5fa" }}
                      onClick={() =>
                        setReplyingTo({
                          commentId: c._id,
                          parentReplyId: null,
                          replyToUsername: c.username
                        })
                      }
                    >
                      responder
                    </span>

                    {replies.length > 0 && (

                      <span
                        style={{ cursor: "pointer", color: "#60a5fa" }}
                        onClick={() =>
                          setOpenReplies(prev => ({
                            ...prev,
                            [c._id]: !prev[c._id]
                          }))
                        }
                      >
                        {isOpen
                          ? "Ocultar respuestas"
                          : `Mostrar ${replies.length} respuestas`}
                      </span>

                    )}

                  </div>

                </div>

              </div>

              {isOpen && replies.map(r => (

                <ReplyCard
                  key={r._id}
                  item={r}
                  onLike={likeItem}
                  onReply={(extra = {}) =>
                    setReplyingTo({
                      commentId: c._id,
                      parentReplyId: extra.parentReplyId || r._id,
                      replyToUsername: extra.replyToUsername || r.username
                    })
                  }
                />

              ))}

              {replyingTo?.commentId === c._id && (

                <div style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10
                }}>

                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Responder a @${replyingTo.replyToUsername}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRadius: 6,
                      border: "none"
                    }}
                  />

                  <button
                    onClick={sendReply}
                    style={{
                      background: "#2563eb",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    enviar
                  </button>

                </div>

              )}

            </div>

          );

        })}

      </div>

    </div>

  );

}