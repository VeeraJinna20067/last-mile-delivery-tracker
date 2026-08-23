import Order from "../models/Order.js";
import User from "../models/User.js";

import {
  addTrackingEvent
} from "./trackingService.js";


// -----------------------------------------
// RESCHEDULE ORDER
// -----------------------------------------

export const rescheduleOrder = async ({
  orderId,
  newDeliveryDate,
  actorId,
  actorRole
}) => {

  const order =
    await Order.findById(orderId);


  if (!order) {
    throw new Error(
      "Order not found"
    );
  }


  if (order.status !== "FAILED") {
    throw new Error(
      "Only failed orders can be rescheduled"
    );
  }
if (order.rescheduleCount >= 3) {
  throw new Error(
    "Maximum reschedule attempts reached"
  );
}

  const selectedDate =
    new Date(newDeliveryDate);


  if (
    Number.isNaN(
      selectedDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid delivery date"
    );
  }


  // Prevent past dates
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  selectedDate.setHours(
    0,
    0,
    0,
    0
  );


  if (selectedDate < today) {
    throw new Error(
      "Delivery date cannot be in the past"
    );
  }


  // --------------------------------
  // Release previous agent
  // --------------------------------

  if (order.agentId) {

    await User.findByIdAndUpdate(
      order.agentId,
      {
        isAvailable: true
      }
    );
  }


  // --------------------------------
  // Update order
  // --------------------------------

  order.status =
    "RESCHEDULED";

  order.rescheduledDate =
    selectedDate;

  order.rescheduleCount += 1;

  order.agentId = null;


  await order.save();


  // --------------------------------
  // Tracking
  // --------------------------------

  await addTrackingEvent({
    orderId: order._id,

    status: "RESCHEDULED",

    actorId,

    actorRole,

    remarks:
      `Delivery rescheduled to ${selectedDate.toDateString()}`
  });


  return order;
};