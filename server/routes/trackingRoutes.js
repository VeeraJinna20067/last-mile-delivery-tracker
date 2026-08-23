import express from "express";

import {
  updateOrderStatus,
  getTrackingHistory
} from "../controllers/trackingController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();


// --------------------------------
// Update status
// --------------------------------

router.post(
  "/orders/:id/status",
  protect,
  authorize("agent", "admin"),
  updateOrderStatus
);


// --------------------------------
// Get tracking
// --------------------------------

router.get(
  "/orders/:id",
  protect,
  authorize(
    "customer",
    "agent",
    "admin"
  ),
  getTrackingHistory
);


export default router;