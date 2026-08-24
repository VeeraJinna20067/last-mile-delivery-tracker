import express from "express";

import {
  getAdminDashboard,
    getAllOrders,
     getAdminOrderDetails
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getAdminDashboard
);
router.get(
  "/orders",
  protect,
  authorize("admin"),
  getAllOrders
);
router.get(
  "/orders/:id",
  protect,
  authorize("admin"),
  getAdminOrderDetails
);
export default router;