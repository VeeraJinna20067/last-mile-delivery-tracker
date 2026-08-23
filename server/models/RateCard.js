import mongoose from "mongoose";

const weightSlabSchema = new mongoose.Schema(
  {
    minWeight: {
      type: Number,
      required: true,
      min: 0
    },

    maxWeight: {
      type: Number,
      required: true,
      min: 0
    },

    rate: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const rateCardSchema = new mongoose.Schema(
  {
    fromZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true
    },

    toZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true
    },

    orderType: {
      type: String,
      enum: ["B2B", "B2C"],
      required: true
    },

    baseRate: {
      type: Number,
      required: true,
      min: 0
    },

    additionalWeightRate: {
      type: Number,
      default: 0,
      min: 0
    },

    codSurcharge: {
      type: Number,
      default: 0,
      min: 0
    },

    weightSlabs: {
      type: [weightSlabSchema],
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

rateCardSchema.index(
  {
    fromZone: 1,
    toZone: 1,
    orderType: 1
  },
  {
    unique: true
  }
);

const RateCard = mongoose.model(
  "RateCard",
  rateCardSchema
);

export default RateCard;