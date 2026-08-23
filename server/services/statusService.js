const allowedTransitions = {
  CREATED: ["ASSIGNED"],

  ASSIGNED: ["PICKED_UP"],

  PICKED_UP: ["IN_TRANSIT"],

  IN_TRANSIT: ["OUT_FOR_DELIVERY"],

  OUT_FOR_DELIVERY: [
    "DELIVERED",
    "FAILED"
  ],

  DELIVERED: [],

  FAILED: [
    "RESCHEDULED"
  ],

  RESCHEDULED: [
    "ASSIGNED"
  ]
};

export const isValidStatusTransition = (
  currentStatus,
  newStatus
) => {
  const allowed =
    allowedTransitions[currentStatus] || [];

  return allowed.includes(newStatus);
};

export const getAllowedNextStatuses = (
  currentStatus
) => {
  return allowedTransitions[currentStatus] || [];
};