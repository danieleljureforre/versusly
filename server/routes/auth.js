import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ===============================
   USER MODEL
=============================== */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  avatar: {
    type: String,
    default: ""
  },

  avatarColor: {
    type: String,
    default: "#1d9bf0"
  },

  bio: {
    type: String,
    default: ""
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

/* ===============================
   📝 REGISTER
=============================== */

router.post("/register", async (req, res) => {
  try {
    let { username, email, password, avatar, avatarColor } = req.body || {};

    username = username?.trim();
    email = email?.trim().toLowerCase();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) {
      return res.status(400).json({ message: "Usuario o email ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashed,
      avatar: avatar || "",
      avatarColor: avatarColor || "#1d9bf0"
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Usuario creado correctamente",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        avatarColor: newUser.avatarColor,
        bio: newUser.bio
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

/* ===============================
   🔐 LOGIN
=============================== */

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body || {};

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        avatarColor: user.avatarColor,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

/* ===============================
   👤 UPDATE PROFILE
=============================== */

router.post("/update-profile", async (req, res) => {
  try {

    const { userId, bio, avatar, avatarColor } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        avatar,
        avatarColor
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      avatarColor: user.avatarColor,
      bio: user.bio
    });

  } catch (error) {

    console.error(error);
    return res.status(500).json({ message: "Error actualizando perfil" });

  }
});

export default router;