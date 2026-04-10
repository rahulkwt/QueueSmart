import express from "express";
import { getHistory, addHistory, updateHistoryEntry } from "../controllers/historyController.js";
import { getNotifications, createNotification, markAllRead, clearAllNotifications } from "../controllers/notificationsData.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/history", verifyToken, getHistory);
router.post("/history", verifyToken, addHistory);
router.patch("/history/:id", verifyToken, updateHistoryEntry);

router.get("/notifications", verifyToken, getNotifications);
router.post("/notifications", verifyToken, createNotification);
router.patch("/notifications/read-all", verifyToken, markAllRead);
router.delete("/notifications", verifyToken, clearAllNotifications);

export default router;
