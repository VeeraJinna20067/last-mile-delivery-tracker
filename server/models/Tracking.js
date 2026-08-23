import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true
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
      required: true
    },

    timestamp: {
      type: Date,
      default: Date.now
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    actorRole: {
      type: String,
      enum: ["customer", "agent", "admin"],
      required: true
    },

    remarks: {
      type: String,
      default: ""
    },

    location: {
      latitude: {
        type: Number,
        default: null
      },

      longitude: {
        type: Number,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

const Tracking = mongoose.model(
  "Tracking",
  trackingSchema
);

export default Tracking;