import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  assignAgent,
autoAssignAgent,
rescheduleDelivery
} from "../controllers/orderController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// --------------------------------
// Manual assignment
// --------------------------------

router.post(
  "/:id/assign-agent",
  protect,
  authorize("admin"),
  assignAgent
);
router.post(
  "/:id/reschedule",
  protect,
  authorize("customer", "admin"),
  rescheduleDelivery
);

// --------------------------------
// Automatic assignment
// --------------------------------

router.post(
  "/:id/auto-assign",
  protect,
  authorize("admin"),
  autoAssignAgent
);
// --------------------------------
// Customer creates order
// --------------------------------

router.post(
  "/",
  protect,
  authorize("customer", "admin"),
  createOrder
);


// --------------------------------
// Customer's orders
// --------------------------------

router.get(
  "/my-orders",
  protect,
  authorize("customer"),
  getMyOrders
);


// --------------------------------
// Admin gets all orders
// --------------------------------

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllOrders
);


// --------------------------------
// Single order
// --------------------------------

router.get(
  "/:id",
  protect,
  getOrderById
);


export default router;