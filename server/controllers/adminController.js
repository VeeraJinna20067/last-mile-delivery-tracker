import User from "../models/User.js";
import Order from "../models/Order.js";

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

        orders: {
          created: createdOrders,
          assigned: assignedOrders,
          pickedUp: pickedUpOrders,
          inTransit: inTransitOrders,
          outForDelivery: outForDeliveryOrders,
          delivered: deliveredOrders,
          failed: failedOrders,
          rescheduled: rescheduledOrders
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
      message: "Failed to load admin dashboard"
    });

  }
};

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
      message:
        "Failed to fetch orders"
    });

  }
};
export const getAdminOrderDetails = async (req, res) => {
  try {

    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "customerId",
        "name email phone"
      )
      .populate(
        "agentId",
        "name email phone currentLocation isAvailable"
      )
      .populate(
        "pickupZone",
        "name code"
      )
      .populate(
        "dropZone",
        "name code"
      );


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {

    console.error(
      "Get admin order details error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch order details"
    });

  }
};