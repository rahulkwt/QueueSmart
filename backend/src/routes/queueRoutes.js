import express from "express";
import { getQueue, serveNext, removeFromQueue, moveUp } from "../controllers/queueController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/admin/queue — view the current queue
router.get("/queue", getQueue);

// POST /api/admin/queue/serve — protected: remove and return the first entry
router.post("/queue/serve", verifyToken, serveNext);

// DELETE /api/admin/queue/:id — protected: remove a specific entry
router.delete("/queue/:id", verifyToken, removeFromQueue);

// PUT /api/admin/queue/:id/move-up — protected: move an entry one position toward the front
router.put("/queue/:id/move-up", verifyToken, moveUp);

export default router;
