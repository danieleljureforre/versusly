import { useState } from "react";

export default function SearchScreen({
  posts = [],
  users = [],
  currentUser,
  onOpenPost,
  onOpenProfile
}) {

  const [query, setQuery] = useState("");

  const q = query.toLowerCase();

  const filteredPosts = posts.filter(post =>
    post.topic?.toLowerCase().includes(q)
  );

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(q)
  );

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        color: "white",
        paddingTop: 20
      }}
    >

      <h1 style={{ marginBottom: 20 }}>
        Search
      </h1>

      <input
        type="text"
        placeholder="Find people or debates..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 10,
          border: "1px solid #1e293b",
          background: "#020617",
          color: "white",
          outline: "none",
          marginBottom: 30
        }}
      />

      {query && (

        <>
          {/* USUARIOS */}

          {filteredUsers.length > 0 && (
            <>
              <h3 style={{ marginBottom: 10 }}>People</h3>

              {filteredUsers.map((user) => {

  const avatarUrl = user.avatar
    ? `http://localhost:3001${user.avatar}`
    : null;

  return (

    <div
      key={user._id}
      onClick={() => onOpenProfile?.(user.username)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderBottom: "1px solid #1e293b",
        cursor: "pointer"
      }}
    >

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          overflow: "hidden",
          background: user.avatarColor || "#1d9bf0",
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
          user.username?.[0]?.toUpperCase()
        )}

      </div>

      <div>
        {user.username}
      </div>

    </div>

  );

})}
            </>
          )}

          {/* POSTS */}

          {filteredPosts.length > 0 && (
            <>
              <h3 style={{ marginTop: 25, marginBottom: 10 }}>
                Debates
              </h3>

              {filteredPosts.map((post) => (

                <div
                  key={post._id}
                  onClick={() => onOpenPost?.(post)}
                  style={{
                    padding: 12,
                    borderBottom: "1px solid #1e293b",
                    cursor: "pointer"
                  }}
                >
                  ⚔️ {post.topic}
                </div>

              ))}
            </>
          )}

          {filteredPosts.length === 0 && filteredUsers.length === 0 && (
            <div style={{ opacity: 0.6 }}>
              No se encontraron resultados.
            </div>
          )}

        </>
      )}

      {!query && (
        <div style={{ opacity: 0.6 }}>
          Write something to find it...
        </div>
      )}

    </div>
  );
}