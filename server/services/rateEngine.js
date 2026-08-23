import RateCard from "../models/RateCard.js";
import { findZoneByPincode } from "./zoneService.js";

const calculateVolumetricWeight = (
  length,
  breadth,
  height
) => {
  return (length * breadth * height) / 5000;
};

const roundWeight = (weight) => {
  return Math.round(weight * 100) / 100;
};

export const calculateDeliveryRate = async ({
  pickupPincode,
  dropPincode,
  length,
  breadth,
  height,
  actualWeight,
  orderType,
  paymentType
}) => {

  // --------------------------------
  // 1. Find pickup zone
  // --------------------------------

  const pickupZone =
    await findZoneByPincode(pickupPincode);

  if (!pickupZone) {
    throw new Error(
      `No zone found for pickup pincode ${pickupPincode}`
    );
  }


  // --------------------------------
  // 2. Find drop zone
  // --------------------------------

  const dropZone =
    await findZoneByPincode(dropPincode);

  if (!dropZone) {
    throw new Error(
      `No zone found for drop pincode ${dropPincode}`
    );
  }


  // --------------------------------
  // 3. Calculate volumetric weight
  // --------------------------------

  const volumetricWeight =
    calculateVolumetricWeight(
      Number(length),
      Number(breadth),
      Number(height)
    );


  // --------------------------------
  // 4. Calculate chargeable weight
  // --------------------------------

  const chargeableWeight = Math.max(
    Number(actualWeight),
    volumetricWeight
  );


  // --------------------------------
  // 5. Find rate card
  // --------------------------------

  const rateCard = await RateCard.findOne({
    fromZone: pickupZone._id,
    toZone: dropZone._id,
    orderType,
    isActive: true
  });

  if (!rateCard) {
    throw new Error(
      `No rate card found for ${pickupZone.code} → ${dropZone.code} (${orderType})`
    );
  }


  // --------------------------------
  // 6. Find weight slab
  // --------------------------------

  const slab = rateCard.weightSlabs.find(
    (item) =>
      chargeableWeight >= item.minWeight &&
      chargeableWeight <= item.maxWeight
  );


  // --------------------------------
  // 7. Calculate delivery charge
  // --------------------------------

  let deliveryCharge = 0;

  if (slab) {

    deliveryCharge = slab.rate;

  } else {

    /*
      If the weight exceeds the configured
      slabs, calculate additional weight.
    */

    const highestSlab =
      rateCard.weightSlabs[
        rateCard.weightSlabs.length - 1
      ];

    if (
      highestSlab &&
      chargeableWeight > highestSlab.maxWeight
    ) {

      const extraWeight =
        chargeableWeight -
        highestSlab.maxWeight;

      const extraCharge =
        Math.ceil(extraWeight) *
        rateCard.additionalWeightRate;

      deliveryCharge =
        highestSlab.rate +
        extraCharge;

    } else {

      throw new Error(
        "No suitable weight slab found"
      );
    }
  }


  // --------------------------------
  // 8. COD surcharge
  // --------------------------------

  let codSurcharge = 0;

  if (paymentType === "COD") {
    codSurcharge = rateCard.codSurcharge;
  }


  // --------------------------------
  // 9. Final amount
  // --------------------------------

  const totalAmount =
    deliveryCharge +
    codSurcharge;


  return {
    pickupZone: {
      id: pickupZone._id,
      name: pickupZone.name,
      code: pickupZone.code
    },

    dropZone: {
      id: dropZone._id,
      name: dropZone.name,
      code: dropZone.code
    },

    actualWeight:
      roundWeight(Number(actualWeight)),

    volumetricWeight:
      roundWeight(volumetricWeight),

    chargeableWeight:
      roundWeight(chargeableWeight),

    orderType,

    paymentType,

    deliveryCharge:
      roundWeight(deliveryCharge),

    codSurcharge:
      roundWeight(codSurcharge),

    totalAmount:
      roundWeight(totalAmount)
  };
};