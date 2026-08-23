import express from "express";
import {
  createRateCard,
  getRateCards,
  getRateCardById,
  updateRateCard,
  deleteRateCard,
  calculateRate
} from "../controllers/rateController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();
router.post(
  "/calculate",
  protect,
  calculateRate
);

// Create
router.post(
  "/",
  protect,
  authorize("admin"),
  createRateCard
);


// Read all
router.get(
  "/",
  protect,
  getRateCards
);


// Read one
router.get(
  "/:id",
  protect,
  getRateCardById
);


// Update
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateRateCard
);


// Delete
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteRateCard
);

export default router;