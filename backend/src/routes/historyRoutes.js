// THIRD

import express from "express";
import { getHistory } from "../controllers/historyController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/history — protected: caller must supply a valid Bearer token
router.get("/history", verifyToken, getHistory);

export default router;