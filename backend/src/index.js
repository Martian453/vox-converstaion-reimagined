import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import translatorRoutes from "./translator/translator.route.js";
import userRoutes from "./routes/user.route.js";

import app, { server } from "./lib/socket.js";

// Load environment variables
dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.set("trust proxy", 1); // Trust Render's proxy for secure cookies
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://192.168.") ||
        origin === process.env.CLIENT_URL
      ) {
        callback(null, true);
      } else {
        console.log("❌ CORS Blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/translate", translatorRoutes);
app.use("/api/users", userRoutes);
// Removed static file serving for hybrid deployment

// Start the server and connect to DB
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔍 ENV CHECK: NODE_ENV=${process.env.NODE_ENV}`);
    console.log(`🔍 ENV CHECK: CLIENT_URL=${process.env.CLIENT_URL}`);
  });
});
