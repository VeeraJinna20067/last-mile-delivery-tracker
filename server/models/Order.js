import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pickupAddress: {
      type: String,
      required: true,
      trim: true
    },
    pickupLocation: {
  latitude: {
    type: Number,
    default: null
  },

  longitude: {
    type: Number,
    default: null
  }
},

    dropAddress: {
      type: String,
      required: true,
      trim: true
    },

    pickupPincode: {
      type: String,
      required: true,
      trim: true
    },

    dropPincode: {
      type: String,
      required: true,
      trim: true
    },

    pickupZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true
    },

    dropZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true
    },

    package: {
      length: {
        type: Number,
        required: true
      },

      breadth: {
        type: Number,
        required: true
      },

      height: {
        type: Number,
        required: true
      },

      actualWeight: {
        type: Number,
        required: true
      },

      volumetricWeight: {
        type: Number,
        required: true
      },

      chargeableWeight: {
        type: Number,
        required: true
      }
    },

    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true
    },

    paymentType: {
      type: String,
      enum: ["PREPAID", "COD"],
      required: true
    },

    deliveryCharge: {
      type: Number,
      required: true,
      min: 0
    },

    codSurcharge: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED",
        "RESCHEDULED"
      ],
      default: "CREATED"
    },

    rescheduleCount: {
      type: Number,
      default: 0
    },
    failureReason: {
  type: String,
  default: ""
},

failedAt: {
  type: Date,
  default: null
},

rescheduledDate: {
  type: Date,
  default: null
},
    estimatedDeliveryDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;