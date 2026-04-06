import express from "express";
import { getServices, getServicesWithCounts, createService, updateService, deleteService } from "../controllers/servicesController.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/admin/services/with-counts — public: services with live queue counts
router.get("/services/with-counts", getServicesWithCounts);

// GET /api/admin/services — public: anyone can view configured services
router.get("/services", getServices);

// POST /api/admin/services — protected: create a new service (admin only)
router.post("/services", verifyToken, verifyAdmin, createService);

// PUT /api/admin/services/:id — protected: update an existing service (admin only)
router.put("/services/:id", verifyToken, verifyAdmin, updateService);

// DELETE /api/admin/services/:id — protected: remove a service (admin only)
router.delete("/services/:id", verifyToken, verifyAdmin, deleteService);

export default router;
