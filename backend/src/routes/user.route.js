import express from "express";
import { getUserProfile, updateLanguage, getUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//  get all users except self
router.get("/", protectRoute, getUsers);

// get profile of current user
router.get("/me", protectRoute, getUserProfile);

// update preferred language
router.put("/language", protectRoute, updateLanguage);

export default router;
