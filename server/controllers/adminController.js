import User from "../models/User.js";
import Order from "../models/Order.js";

// -----------------------------------------
// ADMIN DASHBOARD
// -----------------------------------------

export const getAdminDashboard = async (req, res) => {
  try {

    const [
      totalOrders,
      createdOrders,
      assignedOrders,
      pickedUpOrders,
      inTransitOrders,
      outForDeliveryOrders,
      deliveredOrders,
      failedOrders,
      rescheduledOrders,
      totalCustomers,
      totalAgents,
      availableAgents
    ] = await Promise.all([

      // -------------------------------
      // ORDERS
      // -------------------------------

      Order.countDocuments(),

      Order.countDocuments({
        status: "CREATED"
      }),

      Order.countDocuments({
        status: "ASSIGNED"
      }),

      Order.countDocuments({
        status: "PICKED_UP"
      }),

      Order.countDocuments({
        status: "IN_TRANSIT"
      }),

      Order.countDocuments({
        status: "OUT_FOR_DELIVERY"
      }),

      Order.countDocuments({
        status: "DELIVERED"
      }),

      Order.countDocuments({
        status: "FAILED"
      }),

      Order.countDocuments({
        status: "RESCHEDULED"
      }),

      // -------------------------------
      // USERS
      // -------------------------------

      User.countDocuments({
        role: "customer"
      }),

      User.countDocuments({
        role: "agent"
      }),

      User.countDocuments({
        role: "agent",
        isActive: true,
        isAvailable: true
      })

    ]);


    res.status(200).json({

      success: true,

      stats: {

        totalOrders,

        orderStatus: {

          created: createdOrders,

          assigned: assignedOrders,

          pickedUp: pickedUpOrders,

          inTransit: inTransitOrders,

          outForDelivery:
            outForDeliveryOrders,

          delivered:
            deliveredOrders,

          failed: failedOrders,

          rescheduled:
            rescheduledOrders

        },

        users: {

          totalCustomers,

          totalAgents,

          availableAgents

        }

      }

    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to load admin dashboard"

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