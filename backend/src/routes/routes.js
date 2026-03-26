import express from "express";
import { getService, addService,leaveService } from "../controllers/serviceController.js";
import { getHistory } from "../controllers/historyController.js";
import { getNotifications } from "../controllers/notificationsData.js";

const router = express.Router();

router.get("/services", getService);
router.post("/services", addService);
router.patch("/services/:id/leave", leaveService);

router.get("/history", getHistory);
router.get("/notifications", getNotifications);

export default router;