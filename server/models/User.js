import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true
  },

  avatar: String,

  avatarColor: {
    type: String,
    default: "#1d9bf0"
  }

});

export default mongoose.models.User || mongoose.model("User", UserSchema);