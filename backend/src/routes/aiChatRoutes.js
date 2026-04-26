import express from "express";
import { handleChat } from "../controllers/aiChatController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// POST /api/ai/chat — any authenticated user (admin now, users later)
router.post("/chat", verifyToken, handleChat);

export default router;
