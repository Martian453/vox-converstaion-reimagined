import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { translateText } from "../translator/translator.service.js";


// Get users for sidebar (all except self)

export const getUsersForSidebar = async (req, res) => {
  try {
    const me = req.user._id;
    const users = await User.find({ _id: { $ne: me } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("getUsersForSidebar error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between logged in user and another user
export const getMessages = async (req, res) => {
  try {
    const otherId = req.params.id;
    const me = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: otherId },
        { senderId: otherId, receiverId: me },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message (text + optional image, with async translation)

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?._id || req.body.senderId;
    const receiverId = req.params.id || req.body.receiverId;
    const text = (req.body.text || "").trim();
    const rawImage = req.body.image;

    if (!senderId || !receiverId || !text) {
      return res
        .status(400)
        .json({ error: "senderId, receiverId and text are required" });
    }

    // Upload image if provided
    let imageUrl = "";
    if (rawImage) {
      try {
        const upload = await cloudinary.uploader.upload(rawImage);
        imageUrl = upload.secure_url;
      } catch (e) {
        console.error("Cloudinary upload failed:", e.message);
      }
    }

    // Languages
    const sender = await User.findById(senderId).select("preferredLanguage");
    const receiver = await User.findById(receiverId).select("preferredLanguage");
    const sourceLang = sender?.preferredLanguage || "auto";
    const targetLang = receiver?.preferredLanguage || "en";

    //Save message immediately with null translation
    const saved = await Message.create({
      senderId,
      receiverId,
      originalText: text,
      translatedText: null,
      targetLang,
      image: imageUrl,
    });

    // Payload for sockets/clients
    const payload = {
      _id: String(saved._id),
      senderId: String(senderId),
      receiverId: String(receiverId),
      originalText: saved.originalText,
      translatedText: null,
      targetLang: saved.targetLang,
      image: saved.image,
      createdAt: saved.createdAt,
    };

    // Emit immediately so receiver sees it fast
    const receiverSocketId = getReceiverSocketId?.(String(receiverId));
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", payload);

    // Return response to sender (so no duplicate socket to self)
    res.status(201).json(payload);

    //Translate in background (don’t block user)
    translateText(text, sourceLang, targetLang)
      .then(async (result) => {
        if (!result) return;
        await Message.findByIdAndUpdate(saved._id, { translatedText: result });
        // notify receiver with updated translation
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageUpdated", {
            id: String(saved._id),
            translatedText: result,
          });
        }
      })
      .catch((e) => {
        console.warn("Translation failed:", e.message);
      });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
