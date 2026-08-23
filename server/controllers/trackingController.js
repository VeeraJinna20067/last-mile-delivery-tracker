import Order from "../models/Order.js";
import Tracking from "../models/Tracking.js";

import {
  addTrackingEvent
} from "../services/trackingService.js";

import {
  isValidStatusTransition
} from "../services/statusService.js";
import {
  notifyCustomer
} from "../services/notificationService.js";
const statusMessages = {
  PICKED_UP:
    "Your package has been picked up and is now with the delivery agent.",

  IN_TRANSIT:
    "Your package is currently in transit.",

  OUT_FOR_DELIVERY:
    "Your package is out for delivery.",

  DELIVERED:
    "Your package has been delivered successfully.",

  FAILED:
    "Your delivery could not be completed. Please choose a new delivery date.",

  RESCHEDULED:
    "Your delivery has been rescheduled successfully."
};

// -----------------------------------------
// UPDATE ORDER STATUS
// -----------------------------------------

export const updateOrderStatus = async (
  req,
  res
) => {
  try {

    const {
      status,
      remarks,
      latitude,
      longitude
    } = req.body;


    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }


    // --------------------------------
    // Find order
    // --------------------------------

    const order =
      await Order.findById(
        req.params.id
      );


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    // --------------------------------
    // Only assigned agent can update
    // --------------------------------

    if (
      req.user.role === "agent" &&
      (!order.agentId ||
        order.agentId.toString() !==
          req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this order"
      });
    }


    // --------------------------------
    // Validate transition
    // --------------------------------

    if (
      !isValidStatusTransition(
        order.status,
        status
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          `Invalid status transition: ${order.status} → ${status}`
      });
    }


    // --------------------------------
    // Update order
    // --------------------------------

    order.status = status;
    order.status = status;

if (status === "FAILED") {
  order.failureReason =
    remarks || "Delivery failed";

  order.failedAt = new Date();
}
    await order.save();


    // --------------------------------
    // Tracking event
    // --------------------------------

    await addTrackingEvent({
      orderId: order._id,

      status,

      actorId:
        req.user.userId,

      actorRole:
        req.user.role,

      remarks:
        remarks || "",

      location: {
        latitude:
          latitude !== undefined
            ? Number(latitude)
            : null,

        longitude:
          longitude !== undefined
            ? Number(longitude)
            : null
      }
    });
  if (statusMessages[status]) {

  await notifyCustomer({
    order,

    type: status,

    message:
      statusMessages[status]
  });
}

    // --------------------------------
    // Free agent after delivery
    // --------------------------------

   if (status === "DELIVERED") {

  const agentId = order.agentId;

  if (agentId) {

    const User =
      (await import("../models/User.js"))
        .default;

    await User.findByIdAndUpdate(
      agentId,
      {
        isAvailable: true
      }
    );
  }
}
if (status === "FAILED") {

  const agentId = order.agentId;

  if (agentId) {

    const User =
      (await import("../models/User.js"))
        .default;

    await User.findByIdAndUpdate(
      agentId,
      {
        isAvailable: true
      }
    );
  }
}

    res.status(200).json({
      success: true,

      message:
        `Order status updated to ${status}`,

      order
    });

  } catch (error) {

    console.error(
      "Update status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update order status",
      error: error.message
    });
  }
};


// -----------------------------------------
// GET TRACKING HISTORY
// -----------------------------------------

export const getTrackingHistory = async (
  req,
  res
) => {
  try {

    const order =
      await Order.findById(
        req.params.id
      );


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    // Customer can only view own order
    if (
      req.user.role === "customer" &&
      order.customerId.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot access this tracking history"
      });
    }


    // Agent can only view assigned order
    if (
      req.user.role === "agent" &&
      (!order.agentId ||
        order.agentId.toString() !==
          req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this order"
      });
    }


    const tracking =
      await Tracking.find({
        orderId: order._id
      })
        .populate(
          "actorId",
          "name role"
        )
        .sort({
          timestamp: 1
        });


    res.status(200).json({
      success: true,

      orderNumber:
        order.orderNumber,

      currentStatus:
        order.status,

      tracking
    });

  } catch (error) {

    console.error(
      "Get tracking error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch tracking history"
    });
  }
};