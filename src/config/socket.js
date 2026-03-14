import { io } from "socket.io-client";

const API_URL = "https://versusly.onrender.com";

function generateId() {
  return "id-" + Math.random().toString(36).substring(2, 12);
}

function getClientId() {
  let id = localStorage.getItem("vs_client_id");

  if (!id) {
    id = generateId();
    localStorage.setItem("vs_client_id", id);
  }

  return id;
}

export const clientId = getClientId();

const socket = io(API_URL, {
  transports: ["websocket"],
  auth: {
    clientId
  },
  autoConnect: true,
});

export function registerSocket(userId) {
  if (!userId) return;
  socket.emit("register", String(userId));
}

export default socket;