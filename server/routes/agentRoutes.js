import express from "express";

import {
  createAgent,
  getAgents,
  getAvailableAgents,
  updateAgentLocation,
  updateAgentAvailability,
  getAgentOrders,
  getMyAgentProfile,
  updateAgentOrderStatus
} from "../controllers/agentController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();


// --------------------------------
// ADMIN
// --------------------------------

router.post(
  "/",
  protect,
  authorize("admin"),
  createAgent
);


router.get(
  "/",
  protect,
  authorize("admin"),
  getAgents
);


router.get(
  "/available",
  protect,
  authorize("admin"),
  getAvailableAgents
);


// --------------------------------
// AGENT
// --------------------------------
router.get(
  "/me",
  protect,
  authorize("agent"),
  getMyAgentProfile
);
router.get(
  "/me",
  protect,
  authorize("agent"),
  getMyAgentProfile
);
router.put(
  "/location",
  protect,
  authorize("agent"),
  updateAgentLocation
);


router.put(
  "/availability",
  protect,
  authorize("agent"),
  updateAgentAvailability
);


router.get(
  "/my-orders",
  protect,
  authorize("agent"),
  getAgentOrders
);
router.put(
  "/orders/:id/status",
  protect,
  authorize("agent"),
  updateAgentOrderStatus
);
export default router;