import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   GET ALL USERS
========================= */

router.get("/", async (req, res) => {

  try {

    const users = await User.find();

    res.json(users);

  } catch (err) {

    console.error("Error getting users:", err);
    res.status(500).json({ error: "Server error" });

  }

});

export default router;