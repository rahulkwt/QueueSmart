import express from "express";
import { getQueue, serveNext, removeFromQueue, moveUp } from "../controllers/queueController.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/admin/queue/:serviceId — view the queue for a specific service
router.get("/queue/:serviceId", getQueue);

// POST /api/admin/queue/:serviceId/serve — protected: serve the next user in a service's queue
router.post("/queue/:serviceId/serve", verifyToken, verifyAdmin, serveNext);

// DELETE /api/admin/queue/:serviceId/:entryId — protected: remove a specific entry
router.delete("/queue/:serviceId/:entryId", verifyToken, verifyAdmin, removeFromQueue);

// PUT /api/admin/queue/:serviceId/:entryId/move-up — protected: move an entry one position toward the front
router.put("/queue/:serviceId/:entryId/move-up", verifyToken, verifyAdmin, moveUp);

export default router;
