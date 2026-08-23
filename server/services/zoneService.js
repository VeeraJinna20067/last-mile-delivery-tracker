import Zone from "../models/Zone.js";

export const findZoneByPincode = async (pincode) => {
  if (!pincode) {
    return null;
  }

  const normalizedPincode = String(pincode).trim();

  const zone = await Zone.findOne({
    isActive: true,
    "areas.pincode": normalizedPincode
  });

  return zone;
};