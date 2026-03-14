import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

/* =========================
   GET USER NOTIFICATIONS
========================= */

router.get("/:userId", async (req, res) => {

  try {

    const notifications = await Notification
      .find({ recipient: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "username avatar avatarColor");

    res.json(notifications);

  } catch (err) {

    console.error("Error getting notifications:", err);

    res.status(500).json({
      error: "Server error"
    });

  }

});

export default router;