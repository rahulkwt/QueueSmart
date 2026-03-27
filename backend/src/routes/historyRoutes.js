// THIRD

import express from "express";
import { getHistory, getHistoryByUser, addHistory, deleteHistory } from "../controllers/historyController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/history — protected: caller must supply a valid Bearer token
router.get("/history", verifyToken, getHistory);
router.get("/history/:userId", verifyToken, getHistoryByUser);
router.post("/history", verifyToken, addHistory);
router.delete("/history/:id", verifyToken, deleteHistory);

export default router;