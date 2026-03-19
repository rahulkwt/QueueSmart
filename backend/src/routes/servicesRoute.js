import express from "express";
import { getServices, createService, updateService } from "../controllers/servicesController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/admin/services — public: anyone can view configured services
router.get("/services", getServices);

// POST /api/admin/services — protected: create a new service
router.post("/services", verifyToken, createService);

// PUT /api/admin/services/:id — protected: update an existing service
router.put("/services/:id", verifyToken, updateService);

export default router;
