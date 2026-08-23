import Tracking from "../models/Tracking.js";

export const addTrackingEvent = async ({
  orderId,
  status,
  actorId,
  actorRole,
  remarks = "",
  location = {}
}) => {
  const tracking = await Tracking.create({
    orderId,
    status,
    actorId,
    actorRole,
    remarks,
    location
  });

  return tracking;
};