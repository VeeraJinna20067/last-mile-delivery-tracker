import express from "express";

import {
  getAdminDashboard,
   getAllOrders
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();


// -----------------------------------------
// ADMIN DASHBOARD
// -----------------------------------------

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getAdminDashboard
);
// -----------------------------------------
// ALL ORDERS
// -----------------------------------------

router.get(
  "/orders",
  protect,
  authorize("admin"),
  getAllOrders
);


export default router;