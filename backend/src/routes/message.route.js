// backend/src/routes/message.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

//  Sidebar users
router.get("/users", protectRoute, getUsersForSidebar);

//  Conversation messages
router.get("/:id", protectRoute, getMessages);

//  Send message (only one correct route)
router.post("/send/:id", protectRoute, sendMessage);

export default router;
