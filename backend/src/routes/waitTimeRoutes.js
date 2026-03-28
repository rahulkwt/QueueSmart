import { Router } from "express";
import { getWaitTime } from "../controllers/waitTimeController.js";

const router = Router();

router.get("/queue/wait-time", getWaitTime);

export default router;
