import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
  {
    areaName: {
      type: String,
      required: true,
      trim: true
    },

    pincode: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false
  }
);

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    areas: {
      type: [areaSchema],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;