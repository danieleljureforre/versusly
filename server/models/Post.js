import mongoose from "mongoose";

/* =========================
   REPLY
========================= */

const ReplySchema = new mongoose.Schema(
  {
    userId: String,
    username: String,
    avatar: String,
    avatarColor: String,
    text: String,
    replyToUsername: String,

    likes: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   COMMENT
========================= */

const CommentSchema = new mongoose.Schema(
  {
    userId: String,
    username: String,
    avatar: String,
    avatarColor: String,
    text: String,

    likes: {
      type: [String],
      default: []
    },

    replies: {
      type: [ReplySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   POST
========================= */

const PostSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true
    },

    players: [
      {
        userId: String,
        username: String,
        avatar: String,
        avatarColor: String
      }
    ],

    messages: [
      {
        senderId: String,
        text: String,
        timestamp: Number
      }
    ],

    likes: {
      type: [String],
      default: []
    },

    poll: {
      votesA: { type: Number, default: 0 },
      votesB: { type: Number, default: 0 }
    },

    comments: {
      type: [CommentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);