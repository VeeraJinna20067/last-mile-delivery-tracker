import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Order from "../models/Order.js";


// -----------------------------------------
// CREATE AGENT
// -----------------------------------------

export const createAgent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      latitude,
      longitude
    } = req.body;


    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required"
      });
    }


    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });


    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }


    const agent = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: "agent",

      currentLocation: {
        latitude:
          latitude !== undefined
            ? Number(latitude)
            : null,

        longitude:
          longitude !== undefined
            ? Number(longitude)
            : null
      },

      isAvailable: true,
      isActive: true
    });


    res.status(201).json({
      success: true,

      message: "Agent created successfully",

      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        role: agent.role,
        currentLocation:
          agent.currentLocation,
        isAvailable:
          agent.isAvailable,
        isActive:
          agent.isActive
      }
    });

  } catch (error) {

    console.error(
      "Create agent error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create agent"
    });
  }
};


// -----------------------------------------
// GET ALL AGENTS
// -----------------------------------------

export const getAgents = async (req, res) => {
  try {

    const agents = await User.find({
      role: "agent"
    })
      .select("-password")
      .sort({
        createdAt: -1
      });


    res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });

  } catch (error) {

    console.error(
      "Get agents error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch agents"
    });
  }
};


// -----------------------------------------
// GET AVAILABLE AGENTS
// -----------------------------------------

export const getAvailableAgents = async (
  req,
  res
) => {
  try {

    const agents = await User.find({
      role: "agent",

      isActive: true,

      isAvailable: true,

      "currentLocation.latitude": {
        $ne: null
      },

      "currentLocation.longitude": {
        $ne: null
      }
    }).select("-password");


    res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });

  } catch (error) {

    console.error(
      "Get available agents error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch available agents"
    });
  }
};


// -----------------------------------------
// UPDATE AGENT LOCATION
// -----------------------------------------

export const updateAgentLocation = async (
  req,
  res
) => {
  try {

    const {
      latitude,
      longitude
    } = req.body;


    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }


    const agent = await User.findOne({
      _id: req.user.userId,
      role: "agent"
    });


    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }


    agent.currentLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude)
    };


    await agent.save();


    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: agent.currentLocation
    });

  } catch (error) {

    console.error(
      "Update location error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update location"
    });
  }
};


// -----------------------------------------
// UPDATE AGENT AVAILABILITY
// -----------------------------------------

export const updateAgentAvailability = async (
  req,
  res
) => {
  try {

    const {
      isAvailable
    } = req.body;


    if (
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false"
      });
    }


    const agent = await User.findOne({
      _id: req.user.userId,
      role: "agent"
    });


    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }


    agent.isAvailable = isAvailable;

    await agent.save();


    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      isAvailable: agent.isAvailable
    });

  } catch (error) {

    console.error(
      "Availability error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update availability"
    });
  }
};


// -----------------------------------------
// GET AGENT ORDERS
// -----------------------------------------

export const getAgentOrders = async (
  req,
  res
) => {
  try {

    const orders = await Order.find({
      agentId: req.user.userId
    })
      .populate(
        "customerId",
        "name phone email"
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
      "Get agent orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch agent orders"
    });
  }
};
// -----------------------------------------
// UPDATE AGENT ORDER STATUS
// -----------------------------------------

export const updateAgentOrderStatus = async (
  req,
  res
) => {
  try {

    const { status } = req.body;

    const allowedStatuses = [
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status"
      });
    }


    const order = await Order.findOne({
      _id: req.params.id,
      agentId: req.user.userId
    });


    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or not assigned to you"
      });
    }


    // -----------------------------------------
    // Validate status transition
    // -----------------------------------------

    const validTransitions = {
      ASSIGNED: "PICKED_UP",
      PICKED_UP: "IN_TRANSIT",
      IN_TRANSIT: "OUT_FOR_DELIVERY",
      OUT_FOR_DELIVERY: "DELIVERED"
    };


    const nextStatus =
      validTransitions[order.status];


    if (nextStatus !== status) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot move order from ${order.status} to ${status}`
      });
    }


    // -----------------------------------------
    // Update order
    // -----------------------------------------

    order.status = status;

    await order.save();


    // -----------------------------------------
    // Add tracking event
    // -----------------------------------------

    await addTrackingEvent({
      orderId: order._id,
      status,
      actorId: req.user.userId,
      actorRole: "agent",
      remarks:
        `Order status updated to ${status} by agent`
    });


    // -----------------------------------------
    // Return latest order
    // -----------------------------------------

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


    res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      order: updatedOrder
    });


  } catch (error) {

    console.error(
      "Update agent order status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update order status"
    });

  }
};
// -----------------------------------------
// GET MY AGENT PROFILE
// -----------------------------------------

export const getMyAgentProfile = async (
  req,
  res
) => {

  try {

    const agent = await User.findOne({
      _id: req.user.userId,
      role: "agent"
    }).select("-password");


    if (!agent) {

      return res.status(404).json({

        success: false,

        message: "Agent not found"

      });

    }


    res.status(200).json({

      success: true,

      agent

    });

  } catch (error) {

    console.error(
      "Get agent profile error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch agent profile"

    });

  }

};