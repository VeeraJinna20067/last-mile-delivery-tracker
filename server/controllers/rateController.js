import RateCard from "../models/RateCard.js";
import Zone from "../models/Zone.js";
import { calculateDeliveryRate } from "../services/rateEngine.js";

// CREATE RATE CARD
export const createRateCard = async (req, res) => {
  try {
    const {
      fromZone,
      toZone,
      orderType,
      baseRate,
      additionalWeightRate,
      codSurcharge,
      weightSlabs
    } = req.body;

    if (
      !fromZone ||
      !toZone ||
      !orderType ||
      baseRate === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required rate card fields are missing"
      });
    }

    if (!["B2B", "B2C"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Order type must be B2B or B2C"
      });
    }

    const sourceZone = await Zone.findById(fromZone);
    const destinationZone = await Zone.findById(toZone);

    if (!sourceZone || !destinationZone) {
      return res.status(404).json({
        success: false,
        message: "Source or destination zone not found"
      });
    }

    const existingRateCard = await RateCard.findOne({
      fromZone,
      toZone,
      orderType
    });

    if (existingRateCard) {
      return res.status(409).json({
        success: false,
        message: "Rate card already exists for this route and order type"
      });
    }

    const rateCard = await RateCard.create({
      fromZone,
      toZone,
      orderType,
      baseRate,
      additionalWeightRate:
        additionalWeightRate || 0,
      codSurcharge:
        codSurcharge || 0,
      weightSlabs:
        weightSlabs || []
    });

    const populatedRateCard =
      await RateCard.findById(rateCard._id)
        .populate("fromZone", "name code")
        .populate("toZone", "name code");

    res.status(201).json({
      success: true,
      message: "Rate card created successfully",
      rateCard: populatedRateCard
    });

  } catch (error) {
    console.error("Create rate card error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create rate card"
    });
  }
};


// GET ALL RATE CARDS
export const getRateCards = async (req, res) => {
  try {
    const rateCards = await RateCard.find()
      .populate("fromZone", "name code")
      .populate("toZone", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rateCards.length,
      rateCards
    });

  } catch (error) {
    console.error("Get rate cards error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch rate cards"
    });
  }
};


// GET SINGLE RATE CARD
export const getRateCardById = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(req.params.id)
      .populate("fromZone", "name code")
      .populate("toZone", "name code");

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate card not found"
      });
    }

    res.status(200).json({
      success: true,
      rateCard
    });

  } catch (error) {
    console.error("Get rate card error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch rate card"
    });
  }
};


// UPDATE RATE CARD
export const updateRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(
      req.params.id
    );

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate card not found"
      });
    }

    const {
      baseRate,
      additionalWeightRate,
      codSurcharge,
      weightSlabs,
      isActive
    } = req.body;

    if (baseRate !== undefined) {
      rateCard.baseRate = baseRate;
    }

    if (additionalWeightRate !== undefined) {
      rateCard.additionalWeightRate =
        additionalWeightRate;
    }

    if (codSurcharge !== undefined) {
      rateCard.codSurcharge = codSurcharge;
    }

    if (weightSlabs !== undefined) {
      rateCard.weightSlabs = weightSlabs;
    }

    if (isActive !== undefined) {
      rateCard.isActive = isActive;
    }

    await rateCard.save();

    const updatedRateCard =
      await RateCard.findById(rateCard._id)
        .populate("fromZone", "name code")
        .populate("toZone", "name code");

    res.status(200).json({
      success: true,
      message: "Rate card updated successfully",
      rateCard: updatedRateCard
    });

  } catch (error) {
    console.error("Update rate card error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update rate card"
    });
  }
};


// DELETE RATE CARD
export const deleteRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(
      req.params.id
    );

    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: "Rate card not found"
      });
    }

    await rateCard.deleteOne();

    res.status(200).json({
      success: true,
      message: "Rate card deleted successfully"
    });

  } catch (error) {
    console.error("Delete rate card error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete rate card"
    });
  }
};
export const calculateRate = async (req, res) => {
  try {
    const {
      pickupPincode,
      dropPincode,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType
    } = req.body;


    // -----------------------------
    // Validate required fields
    // -----------------------------

    if (
      !pickupPincode ||
      !dropPincode ||
      length === undefined ||
      breadth === undefined ||
      height === undefined ||
      actualWeight === undefined ||
      !orderType ||
      !paymentType
    ) {
      return res.status(400).json({
        success: false,
        message: "All rate calculation fields are required"
      });
    }


    // -----------------------------
    // Validate numbers
    // -----------------------------

    if (
      Number(length) <= 0 ||
      Number(breadth) <= 0 ||
      Number(height) <= 0 ||
      Number(actualWeight) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Dimensions and weight must be greater than zero"
      });
    }


    // -----------------------------
    // Validate order type
    // -----------------------------

    if (!["B2B", "B2C"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Order type must be B2B or B2C"
      });
    }


    // -----------------------------
    // Validate payment type
    // -----------------------------

    if (!["PREPAID", "COD"].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Payment type must be PREPAID or COD"
      });
    }


    // -----------------------------
    // Calculate
    // -----------------------------

    const result =
      await calculateDeliveryRate({
        pickupPincode,
        dropPincode,
        length,
        breadth,
        height,
        actualWeight,
        orderType,
        paymentType
      });


    // -----------------------------
    // Response
    // -----------------------------

    res.status(200).json({
      success: true,
      message: "Delivery rate calculated successfully",
      calculation: result
    });

  } catch (error) {

    console.error(
      "Calculate rate error:",
      error
    );

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};