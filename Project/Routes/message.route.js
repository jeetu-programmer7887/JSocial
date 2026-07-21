import express from "express";
import { sendMessage, getMessages, getConversations } from "../Controller/message.controller.js";
import upload from "../Middleware/multer.js";
import { ProtectedRoute } from "../Middleware/ProtectedRoute.js";

const router = express.Router();

// 1. EXACT MATCHES MUST GO FIRST
router.get("/conversations", ProtectedRoute, getConversations);

// 2. DYNAMIC PARAMS (:id) MUST GO LAST
router.get("/:id", ProtectedRoute, getMessages);
router.post("/send/:id", ProtectedRoute, upload.single("image"), sendMessage);

export default router;