import Notification from "../models/Notification.js";

export default async function addNotification({
  recipient,
  sender,
  type,
  postId = null,
  commentId = null,
  io
}) {
  try {

    if (!recipient) return;

    if (String(recipient) === String(sender)) return;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      postId,
      commentId,
      read: false,
      createdAt: new Date()
    });

    // 🔥 enviar a la room del usuario
    if (io) {
      io.to(String(recipient)).emit("new_notification", notification);
    }

    return notification;

  } catch (error) {

    console.error("Error creating notification:", error);

  }
}