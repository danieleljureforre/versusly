import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import postsRouter from "./routes/posts.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import crypto from "crypto";
import notificationsRouter from "./routes/notifications.js";
import usersRoutes from "./routes/users.js";
import path from "path";
import fs from "fs";
import multer from "multer";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* =========================
   DIRECTORIO DE UPLOADS
========================= */

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* =========================
   MULTER CONFIG
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten imágenes"));
    }
    cb(null, true);
  },
});

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   RUTAS
========================= */

app.use("/api/notifications", notificationsRouter);

app.post("/api/upload/avatar", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    return res.json({
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Error subiendo avatar:", error);
    return res.status(500).json({ error: "Error al subir avatar" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRoutes);

/* =========================
   ONLINE USERS
========================= */

const onlineUsers = {};

/* =========================
   VARIABLES DE DEBATE
========================= */

const waitingPlayers = [];
const rooms = {};

const TURN_SECONDS = 60;
const MAX_TURNS = 10;

/* =========================
   HELPERS
========================= */

function getSocketId(player) {
  if (!player) return null;
  return typeof player === "string" ? player : player.socketId;
}

function getSafeUser(user = {}, fallbackSocketId = "unknown") {
  return {
    id: user?.id || user?._id || user?.userId || fallbackSocketId,
    username: user?.username || "Usuario",
    avatar: user?.avatar || null,
    avatarColor: user?.avatarColor || "#1d9bf0",
  };
}

function findRoomBySocketId(socketId) {
  for (const roomId in rooms) {
    const room = rooms[roomId];

    if (room?.players?.some((p) => p.socketId === socketId)) {
      return { roomId, room };
    }
  }

  return null;
}

/* =========================
   EMITIR TURNO
========================= */

function emitTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  io.to(roomId).emit("turn_update", {
    turn: room.turn,
    turnEndsAt: room.turnEndsAt,
    turnCounts: room.turnCounts,
  });
}

/* =========================
   FINALIZAR DEBATE
========================= */

function endDebate(roomId, reason = "turn_limit", extra = {}) {
  const room = rooms[roomId];
  if (!room) return;

  if (room.timer) clearTimeout(room.timer);

  io.to(roomId).emit("debate_finished", {
    reason,
    transcript: room.messages,
    turnCounts: room.turnCounts,
    topicId: room.topicId,
    chosenIntro: room.chosenIntro,
    players: room.players,
    rivalName: extra?.rivalName || null,
    rivalAvatar: extra?.rivalAvatar || null,
    rivalAvatarColor: extra?.rivalAvatarColor || "#1d9bf0",
    ...extra,
  });

  delete rooms[roomId];
}

/* =========================
   CAMBIO DE TURNO
========================= */

function finishTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const current = room.turn;
  const p1 = getSocketId(room.players?.[0]);
  const p2 = getSocketId(room.players?.[1]);

  if (!current || !p1 || !p2) return;

  room.turnCounts[current] = (room.turnCounts[current] || 0) + 1;

  if (
    (room.turnCounts[p1] || 0) >= MAX_TURNS &&
    (room.turnCounts[p2] || 0) >= MAX_TURNS
  ) {
    endDebate(roomId, "turn_limit");
    return;
  }

  room.turn = current === p1 ? p2 : p1;

  scheduleTurn(roomId);
}

/* =========================
   PROGRAMAR TURNO
========================= */

function scheduleTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  if (room.timer) clearTimeout(room.timer);

  room.turnEndsAt = Date.now() + TURN_SECONDS * 1000;

  emitTurn(roomId);

  room.timer = setTimeout(() => {
    finishTurn(roomId);
  }, TURN_SECONDS * 1000);
}

/* =========================
   SOCKETS
========================= */

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  socket.on("register", (userId) => {
    if (!userId) return;

    const id = String(userId);

    socket.join(id);
    onlineUsers[id] = socket.id;

    console.log("User joined room:", id);
  });

  socket.on("disconnect", () => {
    console.log("Desconectado:", socket.id);

    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }

    const waitingIndex = waitingPlayers.findIndex(
      (p) => p.socketId === socket.id
    );

    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    const roomInfo = findRoomBySocketId(socket.id);

    if (roomInfo) {
      endDebate(roomInfo.roomId, "disconnect");
    }
  });
});

/* =========================
   APP GLOBALS
========================= */

app.set("io", io);
app.set("onlineUsers", onlineUsers);

/* =========================
   POSTS
========================= */

app.use("/api/posts", postsRouter);

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  next();
});

/* =========================
   MONGODB
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");

    const PORT = process.env.PORT || 3001;

    server.listen(PORT, () => {
      console.log("Server running on", PORT);
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
  });