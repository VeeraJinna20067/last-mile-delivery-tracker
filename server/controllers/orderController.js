import Order from "../models/Order.js";
import Tracking from "../models/Tracking.js";
import User from "../models/User.js";
import {
  notifyCustomer
} from "../services/notificationService.js";
import {
  assignNearestAgent
} from "../services/assignmentService.js";
import {
  calculateDeliveryRate
} from "../services/rateEngine.js";

import {
  addTrackingEvent
} from "../services/trackingService.js";
import {
  rescheduleOrder
} from "../services/rescheduleService.js";

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now()
    .toString()
    .slice(-8);

  const random = Math.floor(
    100 + Math.random() * 900
  );

  return `ORD${timestamp}${random}`;
};


// -----------------------------------------
// CREATE ORDER
// -----------------------------------------

export const createOrder = async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      pickupPincode,
      dropPincode,
        pickupLatitude,
  pickupLongitude,
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
      !pickupAddress ||
      !dropAddress ||
      !pickupPincode ||
      !dropPincode ||
      length === undefined ||
      breadth === undefined ||
      height === undefined ||
      pickupLatitude === undefined ||
pickupLongitude === undefined ||
      actualWeight === undefined ||
      !orderType ||
      !paymentType
    ) {
      return res.status(400).json({
        success: false,
        message: "All order fields are required"
      });
    }


    // -----------------------------
    // Calculate rate
    // -----------------------------

    const calculation =
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
    // Generate order number
    // -----------------------------

    const orderNumber =
      generateOrderNumber();


    // -----------------------------
    // Create order
    // -----------------------------

    const order = await Order.create({
      orderNumber,

      customerId: req.user.userId,

      pickupAddress,
      pickupLocation: {
  latitude: Number(pickupLatitude),
  longitude: Number(pickupLongitude)
},
      dropAddress,

      pickupPincode,
      dropPincode,

      pickupZone:
        calculation.pickupZone.id,

      dropZone:
        calculation.dropZone.id,

      package: {
        length: Number(length),
        breadth: Number(breadth),
        height: Number(height),

        actualWeight:
          calculation.actualWeight,

        volumetricWeight:
          calculation.volumetricWeight,

        chargeableWeight:
          calculation.chargeableWeight
      },

      orderType,

      paymentType,

      deliveryCharge:
        calculation.deliveryCharge,

      codSurcharge:
        calculation.codSurcharge,

      totalAmount:
        calculation.totalAmount,

      status: "CREATED"
    });


    // -----------------------------
    // Add initial tracking event
    // -----------------------------

    await addTrackingEvent({
      orderId: order._id,

      status: "CREATED",

      actorId: req.user.userId,

      actorRole: req.user.role,

      remarks: "Order created successfully"
    });
    // -----------------------------------------
// Automatically assign nearest agent
// -----------------------------------------

let assignment = null;

try {

  assignment = await assignNearestAgent({
    orderId: order._id,

    pickupLatitude:
      Number(pickupLatitude),

    pickupLongitude:
      Number(pickupLongitude),

    actorId:
      req.user.userId,

    actorRole:
      req.user.role
  });

  console.log(
    "Nearest agent assigned:",
    assignment.agent.name
  );

  console.log(
    "Distance:",
    assignment.distance,
    "km"
  );
   // -----------------------------------------
// Notify customer about agent assignment
// -----------------------------------------

try {

  await notifyCustomer({

    order: assignment.order,

    type: "AGENT_ASSIGNED",

    message:
      `Agent ${assignment.agent.name} has been assigned to your order ${order.orderNumber}.`

  });

} catch (notificationError) {

  console.error(
    "Agent assignment notification failed:",
    notificationError.message
  );
}
} catch (assignmentError) {

  console.log(
    "Automatic agent assignment skipped:",
    assignmentError.message
  );

}
    await notifyCustomer({
  order,

  type: "ORDER_CREATED",

  message:
    `Your order ${order.orderNumber} has been created successfully.`
});

    // -----------------------------
    // Return populated order
    // -----------------------------

    const populatedOrder =
      await Order.findById(order._id)
        .populate(
          "customerId",
          "name email phone"
        )
        .populate(
          "pickupZone",
          "name code"
        )
        .populate(
          "dropZone",
          "name code"
        );
   const updatedOrder =
  await Order.findById(order._id)
    .populate(
      "customerId",
      "name email phone"
    )
    .populate(
      "pickupZone",
      "name code"
    )
    .populate(
      "dropZone",
      "name code"
    )
    .populate(
      "agentId",
      "name email phone currentLocation"
    );
    return res.status(201).json({
  success: true,
  message: "Order created successfully",
  order: updatedOrder
});

    
  } catch (error) {

    console.error(
      "Create order error:",
      error
    );

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// -----------------------------------------
// GET CUSTOMER ORDERS
// -----------------------------------------

export const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      customerId: req.user.userId
    })
      .populate(
        "pickupZone",
        "name code"
      )
      .populate(
        "dropZone",
        "name code"
      )
      .populate(
        "agentId",
        "name phone"
      )
      .sort({
        createdAt: -1
      });


    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {

    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};


// -----------------------------------------
// GET SINGLE ORDER
// -----------------------------------------

export const getOrderById = async (req, res) => {
  try {

    const order =
      await Order.findById(req.params.id)
        .populate(
          "customerId",
          "name email phone"
        )
        .populate(
          "pickupZone",
          "name code"
        )
        .populate(
          "dropZone",
          "name code"
        )
        .populate(
          "agentId",
          "name phone"
        );


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    // Customer can only view own orders
    if (
      req.user.role === "customer" &&
      order.customerId._id.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this order"
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

      order,

      tracking
    });

  } catch (error) {

    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
};


// -----------------------------------------
// GET ALL ORDERS - ADMIN
// -----------------------------------------

export const getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate(
        "customerId",
        "name email phone"
      )
      .populate(
        "agentId",
        "name phone"
      )
      .populate(
        "pickupZone",
        "name code"
      )
      .populate(
        "dropZone",
        "name code"
      )
      .sort({
        createdAt: -1
      });


    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {

    console.error(
      "Get all orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

// -----------------------------------------
// MANUAL AGENT ASSIGNMENT
// -----------------------------------------

export const assignAgent = async (req, res) => {
  try {

    const {
      agentId
    } = req.body;


    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "Agent ID is required"
      });
    }


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


    if (order.agentId) {
      return res.status(400).json({
        success: false,
        message: "Order already has an agent"
      });
    }


    const agent =
      await User.findOne({
        _id: agentId,
        role: "agent",
        isActive: true,
        isAvailable: true
      });


    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Available agent not found"
      });
    }


    order.agentId = agent._id;

    order.status = "ASSIGNED";

    await order.save();


    agent.isAvailable = false;

    await agent.save();


    await addTrackingEvent({
      orderId: order._id,

      status: "ASSIGNED",

      actorId: req.user.userId,

      actorRole: req.user.role,

      remarks:
        `Agent ${agent.name} assigned manually`
    });
     await notifyCustomer({
  order,

  type: "AGENT_ASSIGNED",

  message:
    `Agent ${agent.name} has been assigned to your order ${order.orderNumber}.`
});

    res.status(200).json({
      success: true,

      message:
        "Agent assigned successfully",

      order
    });

  } catch (error) {

    console.error(
      "Assign agent error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to assign agent"
    });
  }
};

// -----------------------------------------
// AUTOMATIC AGENT ASSIGNMENT
// -----------------------------------------

export const autoAssignAgent = async (
  req,
  res
) => {
  try {

    const {
      pickupLatitude,
      pickupLongitude
    } = req.body;


    if (
      pickupLatitude === undefined ||
      pickupLongitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pickup latitude and longitude are required"
      });
    }


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


    if (order.agentId) {
      return res.status(400).json({
        success: false,
        message:
          "Order already has an assigned agent"
      });
    }


    const result =
      await assignNearestAgent({
        orderId: order._id,

        pickupLatitude:
          Number(pickupLatitude),

        pickupLongitude:
          Number(pickupLongitude),

        actorId:
          req.user.userId,

        actorRole:
          req.user.role
      });
     await notifyCustomer({
  order: result.order,

  type: "AGENT_ASSIGNED",

  message:
    `Agent ${result.agent.name} has been assigned to your order ${result.order.orderNumber}.`
});

    res.status(200).json({
      success: true,

      message:
        "Nearest agent assigned successfully",

      assignment: {
        agent: {
          id: result.agent._id,
          name: result.agent.name,
          phone: result.agent.phone
        },

        distance:
          result.distance
      },

      order: result.order
    });

  } catch (error) {

    console.error(
      "Auto assign error:",
      error
    );

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// -----------------------------------------
// RESCHEDULE ORDER
// -----------------------------------------

export const rescheduleDelivery = async (
  req,
  res
) => {
  try {

    const {
      newDeliveryDate
    } = req.body;


    if (!newDeliveryDate) {
      return res.status(400).json({
        success: false,
        message:
          "New delivery date is required"
      });
    }


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


    // Only the customer who owns
    // the order can reschedule it.

    if (
      req.user.role === "customer" &&
      order.customerId.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot reschedule this order"
      });
    }


    if (order.status !== "FAILED") {
      return res.status(400).json({
        success: false,
        message:
          "Only failed orders can be rescheduled"
      });
    }


    const updatedOrder =
      await rescheduleOrder({
        orderId: order._id,

        newDeliveryDate,

        actorId:
          req.user.userId,

        actorRole:
          req.user.role
      });
     await notifyCustomer({
  order: updatedOrder,

  type: "RESCHEDULED",

  message:
    `Your order ${updatedOrder.orderNumber} has been rescheduled for ${new Date(newDeliveryDate).toDateString()}.`
});

    res.status(200).json({
      success: true,

      message:
        "Order rescheduled successfully",

      order: updatedOrder
    });

  } catch (error) {

    console.error(
      "Reschedule error:",
      error
    );

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
