import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import addNotification from "../controllers/addNotification.js";

const router = express.Router();

/* =========================
   CREAR POST
========================= */

router.post("/", async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando post" });
  }
});

/* =========================
   OBTENER POSTS
========================= */

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("players.userId")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando posts" });
  }
});

/* =========================
   LIKE POST
========================= */

router.post("/:id/like", async (req, res) => {
  try {

    const { userId } = req.body;

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    post.likes = post.likes || [];

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {

      post.likes.pull(userId);

    } else {

      post.likes.push(userId);

      const recipient =
  post.players?.find(p => String(p.userId) !== String(userId))?.userId;

      if (recipient && String(recipient) !== String(userId)) {

        await addNotification({
          recipient,
          sender: userId,
          type: "like",
          postId: post._id,
          io,
          onlineUsers
        });

      }

    }

    await post.save();

    res.json({
      likes: post.likes,
      totalLikes: post.likes.length
    });

  } catch (err) {

    console.error("LIKE ERROR:", err);
    res.status(500).json({ error: "Error dando like" });

  }
});

/* =========================
   COMENTAR
========================= */

router.post("/:id/comment", async (req, res) => {
  try {

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      userId: req.body.userId,
      username: req.body.username,
      avatar: req.body.avatar,
      avatarColor: req.body.avatarColor,
      text: req.body.text,
      likes: [],
      replies: [],
      createdAt: new Date()
    };

    post.comments.push(comment);

    await post.save();

    const recipient =
  post.players?.find(p => String(p.userId) !== String(req.body.userId))?.userId;

    if (recipient && String(recipient) !== String(req.body.userId)) {

      await addNotification({
        recipient,
        sender: req.body.userId,
        type: "comment",
        postId: post._id,
        commentId: comment._id,
        io,
        onlineUsers
      });

    }

    res.json(comment);

  } catch (err) {

    console.error("COMMENT ERROR:", err);
    res.status(500).json({ error: "Error comentando" });

  }
});

/* =========================
   RESPONDER COMENTARIO
========================= */

router.post("/:id/reply", async (req, res) => {
  try {

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const {
      commentId,
      parentReplyId,
      userId,
      username,
      avatar,
      avatarColor,
      text,
      replyToUsername
    } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      username,
      avatar,
      avatarColor,
      text,
      replyToUsername,
      likes: [],
      replies: [],
      createdAt: new Date()
    };

    if (!parentReplyId) {

      comment.replies.push(reply);

    } else {

      const parent = comment.replies.id(parentReplyId);

      if (!parent) {
        return res.status(404).json({ error: "Respuesta padre no encontrada" });
      }

      parent.replies.push(reply);

    }

    await post.save();

    if (comment.userId && String(comment.userId) !== String(userId)) {

      await addNotification({
        recipient: comment.userId,
        sender: userId,
        type: "reply",
        postId: post._id,
        commentId: comment._id,
        io,
        onlineUsers
      });

    }

    res.json(reply);

  } catch (err) {

    console.error("REPLY ERROR:", err);
    res.status(500).json({ error: "Error respondiendo comentario" });

  }
});

/* =========================
   LIKE COMENTARIO / RESPUESTA
========================= */

router.post("/:postId/comment/:targetId/like", async (req, res) => {
  try {

    const { userId } = req.body;

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    let target = null;

    for (const comment of post.comments) {

      if (String(comment._id) === req.params.targetId) {
        target = comment;
        break;
      }

      for (const reply of comment.replies || []) {

        if (String(reply._id) === req.params.targetId) {
          target = reply;
          break;
        }

      }

    }

    if (!target) {
      return res.status(404).json({ error: "Elemento no encontrado" });
    }

    const alreadyLiked = target.likes.includes(userId);

    if (alreadyLiked) {

      target.likes.pull(userId);

    } else {

      target.likes.push(userId);

      if (target.userId && String(target.userId) !== String(userId)) {

        await addNotification({
          recipient: target.userId,
          sender: userId,
          type: "comment_like",
          postId: post._id,
          io,
          onlineUsers
        });

      }

    }

    await post.save();

    res.json({
      likes: target.likes,
      totalLikes: target.likes.length
    });

  } catch (err) {

    console.error("COMMENT LIKE ERROR:", err);
    res.status(500).json({ error: "Error dando like" });

  }
});

export default router;