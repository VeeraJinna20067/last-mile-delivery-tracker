import express from "express";

import {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone,
  detectZone
} from "../controllers/zoneController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();


// Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  createZone
);


// Everyone authenticated can view zones
router.get(
  "/",
  protect,
  getZones
);


// Detect zone from pincode
router.get(
  "/detect/:pincode",
  protect,
  detectZone
);


// Get one zone
router.get(
  "/:id",
  protect,
  getZoneById
);


// Admin only
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateZone
);


// Admin only
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteZone
);

export default router;