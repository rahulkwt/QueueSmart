// THIRD

import express from "express";
import { 
    getHistory,
    getHistoryByUser,
    addHistory,
    deleteHistory
} from "../controllers/historyController.js";

const router = express.Router();

router.get("/history", getHistory);
router.get("/history/:userId",  getHistoryByUser);
router.post("/history",         addHistory);
router.delete("/history/:id",   deleteHistory);

export default router;