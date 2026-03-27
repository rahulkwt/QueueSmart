import express from "express";
import { getWaitTime } from "../controllers/waitTimeController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/queue/wait-time?position=N&avgDuration=M&isOpen=true
router.get("/queue/wait-time", verifyToken, getWaitTime);

export default router;
