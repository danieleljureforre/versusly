import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import socket, { registerSocket } from "./config/socket";
import DebateRoom from "./components/DebateRoom";
import Sidebar from "./components/SidebarComponent";
import PostDebate from "./components/PostDebate";
import AuthScreen from "./components/AuthScreen";
import ProfileScreen from "./components/ProfileScreen";
import TopicSelectionScreen from "./components/TopicSelectionScreen";
import MatchMakingPremium from "./components/MatchMakingPremium";
import FeedScreen from "./components/FeedScreen";
import PostModal from "./components/PostModal";
import SearchScreen from "./components/SearchScreen";
import NotificationsScreen from "./components/NotificationsScreen";

import { useEffect, useMemo, useState } from "react";

const API_URL = "https://versusly.onrender.com";
const POSTS_URL = `${API_URL}/api/posts`;

const SCREENS = {
  HOME: "home",
  SEARCH: "search",
  PICK_TOPIC: "pick_topic",
  MATCHMAKING: "matchmaking",
  RIVAL_FOUND: "rival_found",
  DEBATE: "debate",
  POST_DEBATE: "post_debate",
  PROFILE: "profile",
  PROFILE_VIEW: "profile_view",
  NOTIFICATIONS: "notifications"
};

const CATEGORIES = [
  {
    id: "politics",
    title: "Politics",
    topics: [
      {
        id: "abortion",
        title: "Abortion",
        description: "Should abortion be legal?",
        sides: ["Yes, it should be legal", "No, it should be illegal"],
      },
      {
        id: "democrats_vs_republicans",
        title: "Democrats vs Republicans",
        description: "Which political vision is better for the country?",
        sides: ["Democrats", "Republicans"],
      },
      {
        id: "communism_vs_capitalism",
        title: "Communism vs Capitalism",
        description: "Which economic system works better?",
        sides: ["Communism", "Capitalism"],
      },
      {
        id: "small_vs_big_government",
        title: "Small government vs Big government",
        description: "What kind of government is better for society?",
        sides: ["Small government", "Big government"],
      },
      {
        id: "death_penalty",
        title: "Death penalty",
        description: "Should the death penalty be allowed?",
        sides: ["Yes, it should exist", "No, it should be abolished"],
      },
      {
        id: "gun_control",
        title: "Gun control",
        description: "Should governments impose stricter gun control laws?",
        sides: ["Yes, stricter gun control", "No, protect gun rights"],
      },
      {
        id: "immigration",
        title: "Immigration",
        description: "Should immigration laws be stricter?",
        sides: ["Yes, stricter immigration", "No, more open immigration"],
      },
      {
        id: "universal_healthcare",
        title: "Universal healthcare",
        description: "Should healthcare be universal and government-funded?",
        sides: ["Yes, universal healthcare", "No, private healthcare"],
      },
      {
        id: "ai_regulation",
        title: "AI regulation",
        description: "Should artificial intelligence be heavily regulated?",
        sides: ["Yes, strong regulation", "No, minimal regulation"],
      },
      {
        id: "climate_change",
        title: "Climate change policy",
        description: "Should governments impose strict climate policies?",
        sides: ["Yes, strict climate action", "No, avoid heavy regulation"],
      },
    ],
  }
];

export default function App() {

  const [screen, setScreen] = useState(SCREENS.HOME);
  const [selectedDebates, setSelectedDebates] = useState({});
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [chosenIntro, setChosenIntro] = useState(null);
  const [postDebateData, setPostDebateData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [profileUsername, setProfileUsername] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("versusly_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
    
  });

  const allTopics = useMemo(() => {
    return CATEGORIES.flatMap((c) =>
      c.topics.map((t) => ({ ...t, categoryId: c.id }))
    );
  }, []);

  const currentTopic = allTopics.find((t) => t.id === selectedTopicId);

  function resetDebateFlow() {
    setSelectedDebates({});
    setRoomId(null);
    setOpponent(null);
    setSelectedTopicId(null);
    setChosenIntro(null);
    setPostDebateData(null);
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch(POSTS_URL);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando posts:", e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);
useEffect(() => {

  fetch(`${API_URL}/api/users`)
    .then(res => res.json())
    .then(data => {

      console.log("Users loaded:", data);

      if (Array.isArray(data)) {
        setUsers(data);
      } 
      else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } 
      else {
        setUsers([]);
      }

    })
    .catch(err => {
      console.error("Error cargando usuarios:", err);
    });

}, []);
  /* =========================
     REGISTER SOCKET
  ========================= */

  useEffect(() => {

    const userId = currentUser?._id || currentUser?.id;
    if (!userId) return;

    const register = () => {
      registerSocket(userId);
    };

    if (socket.connected) {
      register();
    } else {
      socket.on("connect", register);
    }

    return () => {
      socket.off("connect", register);
    };

  }, [currentUser]);

  /* =========================
     GLOBAL NOTIFICATIONS
  ========================= */

  useEffect(() => {

    const handleNotification = (notification) => {

      const user =
        JSON.parse(localStorage.getItem("versusly_user") || "{}");

      if (!user?.username) return;

      const data =
        JSON.parse(localStorage.getItem("versusly_notifications") || "{}");

      if (!data[user.username]) {
        data[user.username] = [];
      }

      data[user.username].unshift({
        type: notification.type,
        from: notification.sender?.username || "Usuario",
        avatar: notification.sender?.avatar,
        avatarColor: notification.sender?.avatarColor,
        postId: notification.postId,
        read: false,
        date: Date.now()
      });

      localStorage.setItem(
  "versusly_notifications",
  JSON.stringify(data)
);

// 🔥 forzar actualización global
window.dispatchEvent(new Event("versusly_new_notification"));


    };

    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };

  }, []);

  if (!currentUser) {
    return <AuthScreen onAuth={(user) => setCurrentUser(user)} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f0f0f" }}>
      <Sidebar
        screen={screen}
        onNavigate={setScreen}
        currentUser={currentUser}
      />

      <div style={{ flex: 1, padding: 30, overflowY: "auto", color: "white" }}>

        <AnimatePresence mode="wait">

          {screen === SCREENS.HOME && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1>Home</h1>

              <FeedScreen
                posts={posts}
                currentUser={currentUser}
                onOpenPost={(post) => setSelectedPost(post)}
                onOpenProfile={(username) => {
                  setProfileUsername(username);
                  setScreen(SCREENS.PROFILE_VIEW);
                }}
              />

              <button
                onClick={() => setScreen(SCREENS.PICK_TOPIC)}
                style={{
                  marginTop: 25,
                  width: "100%",
                  padding: 16,
                  borderRadius: 12,
                  border: "none",
                  background: "#1d9bf0",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Debatir
              </button>
            </motion.div>
          )}

          {screen === SCREENS.SEARCH && (
  <SearchScreen
    posts={posts}
    users={users}
    currentUser={currentUser}
    onOpenPost={(post) => setSelectedPost(post)}
    onOpenProfile={(username) => {
      setProfileUsername(username);
      setScreen(SCREENS.PROFILE_VIEW);
    }}
  />
)}

          {screen === SCREENS.NOTIFICATIONS && (
            <NotificationsScreen
              currentUser={currentUser}
              onOpenPost={(postId) => {
                const post = posts.find((p) => p._id === postId);
                if (!post) return;
                setSelectedPost(post);
                setScreen(SCREENS.HOME);
              }}
            />
          )}

          {screen === SCREENS.PICK_TOPIC && (
            <TopicSelectionScreen
              categories={CATEGORIES}
              onContinue={(selectedMap) => {
                const topicIds = Object.keys(selectedMap);
                const randomTopicId =
                  topicIds[Math.floor(Math.random() * topicIds.length)];

                setSelectedDebates(selectedMap);
                setSelectedTopicId(randomTopicId);
                setChosenIntro(selectedMap[randomTopicId].intro);
                setScreen(SCREENS.MATCHMAKING);
              }}
            />
          )}

          {screen === SCREENS.MATCHMAKING && (
            <MatchMakingPremium
              stanceMap={selectedDebates}
              currentUser={currentUser}
              onMatchFound={(data) => {
                setRoomId(data.roomId);
                setOpponent({
                  id: data?.opponent?.id || "rival",
                  username: data?.opponent?.username || "Rival",
                  avatar: data?.opponent?.avatar || null,
                  avatarColor: data?.opponent?.avatarColor || "#1d9bf0"
                });
                setSelectedTopicId(data.topicId);
                setChosenIntro(data.chosenIntro);
                setScreen(SCREENS.RIVAL_FOUND);
              }}
              onCancel={() => setScreen(SCREENS.PICK_TOPIC)}
            />
          )}

          {screen === SCREENS.RIVAL_FOUND && roomId && opponent && (
            <RivalFoundScreen
              opponent={opponent}
              topic={currentTopic}
              intro={chosenIntro}
              onDone={() => setScreen(SCREENS.DEBATE)}
            />
          )}

          {screen === SCREENS.DEBATE && roomId && opponent && (
            <DebateRoom
              roomId={roomId}
              rivalName={opponent.username}
              topicTitle={currentTopic?.title}
              mySide={selectedDebates[selectedTopicId]?.stance}
              chosenIntro={chosenIntro}
              onExit={(reason, data) => {
                setPostDebateData(data);
                setScreen(SCREENS.POST_DEBATE);
              }}
            />
          )}

          {screen === SCREENS.POST_DEBATE && postDebateData && (
            <PostDebate
              result={postDebateData}
              roomId={roomId}
              currentUser={currentUser}
              opponent={opponent}
              onHome={() => {
                resetDebateFlow();
                fetchPosts();
                setScreen(SCREENS.HOME);
              }}
            />
          )}

          {screen === SCREENS.PROFILE && (
            <ProfileScreen
              user={currentUser}
              posts={posts}
              onUpdateUser={(updatedUser) => {
                setCurrentUser(updatedUser);
                localStorage.setItem("versusly_user", JSON.stringify(updatedUser));
              }}
            />
          )}

          {screen === SCREENS.PROFILE_VIEW && (
            <ProfileScreen
              user={currentUser}
              username={profileUsername}
              posts={posts}
              onBack={() => setScreen(SCREENS.HOME)}
            />
          )}

        </AnimatePresence>

        {selectedPost && (
          <PostModal
            post={selectedPost}
            currentUser={currentUser}
            onClose={() => setSelectedPost(null)}
            onOpenProfile={(username) => {
              setProfileUsername(username);
              setScreen(SCREENS.PROFILE_VIEW);
            }}
          />
        )}

      </div>
    </div>
  );
}
function RivalFoundScreen({ opponent, topic, intro, onDone }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onDone]);

  const avatarUrl = opponent?.avatar
  "https://versusly.onrender.com";
     null;

  return (
    <motion.div
      key="rival_found"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        maxWidth: 700,
        margin: "0 auto",
        marginTop: 120,
        textAlign: "center",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 40 }}>
        ⚔ Rival Found
      </h1>

      <div style={{ marginBottom: 20 }}>
        Topic: <strong>{topic?.title}</strong>
      </div>

      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 14,
          fontStyle: "italic",
        }}
      >
        "{intro}"
      </div>

    </motion.div>
  );
}