import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    preferredLanguage: {
      type: String,
      default: "en", // English by default
      enum: ["en", "hi", "fr", "es", "de", "it", "ta", "te", "bn", "mr","ja","ko","zh-Hans"] // extend as needed
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
