// routes/translator.route.js
import express from "express";
import { handleTranslation } from "./translator.controller.js";

const router = express.Router();

// POST /api/translate
router.post("/", handleTranslation);

export default router;
