// THIRD

import express from "express";
import { getHistory, addHistory, updateHistoryEntry } from "../controllers/historyController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/user/history — returns history for the authenticated user
router.get("/history", verifyToken, getHistory);

// POST /api/user/history — creates a history entry for the authenticated user
router.post("/history", verifyToken, addHistory);

// PATCH /api/user/history/:id — updates the status of a history entry owned by the user
router.patch("/history/:id", verifyToken, updateHistoryEntry);

export default router;
