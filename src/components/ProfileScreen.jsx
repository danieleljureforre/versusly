import { useState, useEffect } from "react";
import PostModal from "./PostModal";
import addNotification from "../config/addNotification";

export default function ProfileScreen({
  user,
  posts = [],
  username,
  onUpdateUser,
  onBack
}) {

  const viewingOtherProfile = username && username !== user?.username;
  const profileUsername = viewingOtherProfile ? username : user?.username;

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [color, setColor] = useState(user?.avatarColor || "#1d9bf0");
  const [selectedPost, setSelectedPost] = useState(null);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // ⭐ estado local para el avatar
  const [avatar, setAvatar] = useState(user?.avatar || null);

  useEffect(() => {

    const storedFollowers =
      JSON.parse(localStorage.getItem("versusly_followers") || "{}");

    const storedFollowing =
      JSON.parse(localStorage.getItem("versusly_following") || "{}");

    setFollowers(storedFollowers[profileUsername] || []);
    setFollowing(storedFollowing[user?.username] || []);

  }, [profileUsername, user]);

  const isFollowing = following.includes(profileUsername);

  const toggleFollow = () => {

    const followersData =
      JSON.parse(localStorage.getItem("versusly_followers") || "{}");

    const followingData =
      JSON.parse(localStorage.getItem("versusly_following") || "{}");

    followersData[profileUsername] = followersData[profileUsername] || [];
    followingData[user.username] = followingData[user.username] || [];

    const alreadyFollowing =
      followersData[profileUsername].includes(user.username);

    if (alreadyFollowing) {

      followersData[profileUsername] =
        followersData[profileUsername].filter(u => u !== user.username);

      followingData[user.username] =
        followingData[user.username].filter(u => u !== profileUsername);

    } else {

      followersData[profileUsername].push(user.username);
      followingData[user.username].push(profileUsername);

      if (profileUsername !== user.username) {

        addNotification(profileUsername, {
          type: "follow",
          from: user.username,
          avatar: user.avatar,
          avatarColor: user.avatarColor
        });

      }

    }

    localStorage.setItem(
      "versusly_followers",
      JSON.stringify(followersData)
    );

    localStorage.setItem(
      "versusly_following",
      JSON.stringify(followingData)
    );

    setFollowers([...followersData[profileUsername]]);
    setFollowing([...followingData[user.username]]);
  };

  const myPosts = posts.filter((p) =>
    p?.players?.some((pl) => pl?.username === profileUsername)
  );

  const saveChanges = () => {

    const updated = {
      ...user,
      bio,
      avatarColor: color,
      avatar
    };

    onUpdateUser(updated);
    setEditing(false);
  };

  const logout = () => {
    localStorage.removeItem("versusly_user");
    window.location.reload();
  };

  const uploadAvatar = async (e) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {

      const res = await fetch("http://localhost:3001/api/upload/avatar", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      // ⭐ actualizar estado local para forzar render
      setAvatar(data.url);

      const updated = {
        ...user,
        avatar: data.url
      };

      onUpdateUser(updated);

    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", color: "white" }}>

      {viewingOtherProfile && (
        <button
          onClick={onBack}
          style={{
            marginBottom: 20,
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "transparent",
            color: "white",
            cursor: "pointer"
          }}
        >
          ← Volver
        </button>
      )}

      {/* BANNER */}
      <div
        style={{
          height: 160,
          borderRadius: 18,
          background: "linear-gradient(120deg,#1d9bf0,#0f172a)",
          position: "relative",
          marginBottom: 70
        }}
      >

        {/* AVATAR */}
        <div
          style={{
            position: "absolute",
            bottom: -55,
            left: 30,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: color,
            overflow: "hidden",
            border: "4px solid #0f0f0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 900
          }}
        >
          {avatar ? (
            <img
              key={avatar}
              src={`http://localhost:3001${avatar}?t=${Date.now()}`}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            profileUsername?.charAt(0)?.toUpperCase()
          )}
        </div>

      </div>

      {/* USER INFO */}
      <div style={{ paddingLeft: 30, marginBottom: 30 }}>

        <h2>@{profileUsername}</h2>

        <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>

          <div>
            <strong>{followers.length}</strong>
            <div style={{ opacity: 0.6 }}>Seguidores</div>
          </div>

          <div>
            <strong>{following.length}</strong>
            <div style={{ opacity: 0.6 }}>Siguiendo</div>
          </div>

        </div>

        {viewingOtherProfile && (
          <button
            onClick={toggleFollow}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "none",
              background: isFollowing ? "#374151" : "#1d9bf0",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              marginBottom: 10
            }}
          >
            {isFollowing ? "Siguiendo" : "Seguir"}
          </button>
        )}

        {!viewingOtherProfile && editing && (
          <div style={{ marginTop: 15 }}>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe tu biografía..."
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "none",
                marginBottom: 10
              }}
            />

            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              style={{ marginBottom: 10 }}
            />

          </div>
        )}

        {!viewingOtherProfile && !editing && (
          <p style={{ opacity: 0.7 }}>
            {user?.bio || "Sin biografía todavía."}
          </p>
        )}

        {!viewingOtherProfile && (
          <div style={{ marginTop: 15, display: "flex", gap: 10 }}>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#1d9bf0",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={saveChanges}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Guardar
              </button>
            )}

            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "transparent",
                color: "white",
                cursor: "pointer"
              }}
            >
              Log out
            </button>

          </div>
        )}

      </div>

      {/* POSTS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {myPosts.length === 0 ? (
          <div style={{ opacity: 0.5 }}>
            Este usuario aún no ha participado en debates.
          </div>
        ) : (
          myPosts.map((post) => {

            const rival =
              post?.players?.find(
                (p) => p.username !== profileUsername
              )?.username || "Rival";

            return (
              <div
                key={post._id}
                onClick={() => setSelectedPost(post)}
                style={{
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: 16,
                  padding: 20,
                  cursor: "pointer"
                }}
              >

                <div style={{ fontWeight: 800 }}>
                  🎤 {post.topic}
                </div>

                <div style={{ opacity: 0.6 }}>
                  {profileUsername} vs {rival}
                </div>

              </div>

            );

          })
        )}

      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          currentUser={user}
          onClose={() => setSelectedPost(null)}
        />
      )}

    </div>
  );
}