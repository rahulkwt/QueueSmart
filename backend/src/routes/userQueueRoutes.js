import express from "express";
import { getQueue, joinQueue, leaveQueue, getMyQueues } from "../controllers/queueController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/queue/my-queues — get all queue entries for the logged-in user
// Must be registered before /:serviceId to avoid being caught as a param
router.get("/queue/my-queues", verifyToken, getMyQueues);

// GET /api/queue/:serviceId — view the queue for a specific service (public)
router.get("/queue/:serviceId", getQueue);

// POST /api/queue/:serviceId/join — join a service's queue
router.post("/queue/:serviceId/join", verifyToken, joinQueue);

// DELETE /api/queue/:serviceId/:entryId/leave — leave a service's queue
router.delete("/queue/:serviceId/:entryId/leave", verifyToken, leaveQueue);

export default router;
