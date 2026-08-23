import User from "../models/User.js";
import Order from "../models/Order.js";

import {
  addTrackingEvent
} from "./trackingService.js";


// -----------------------------------------
// Haversine distance
// -----------------------------------------

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {

  const earthRadius = 6371;

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };


  const dLat = toRadians(
    lat2 - lat1
  );

  const dLon = toRadians(
    lon2 - lon1
  );


  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +

    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *

    Math.sin(dLon / 2) *
      Math.sin(dLon / 2);


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return earthRadius * c;
};


// -----------------------------------------
// Find nearest agent
// -----------------------------------------

export const findNearestAgent = async ({
  latitude,
  longitude
}) => {

  const agents = await User.find({
    role: "agent",

    isActive: true,

    isAvailable: true,

    "currentLocation.latitude": {
      $ne: null
    },

    "currentLocation.longitude": {
      $ne: null
    }
  });


  if (agents.length === 0) {
    return null;
  }


  let nearestAgent = null;

  let shortestDistance = Infinity;


  for (const agent of agents) {

    const agentLatitude =
      agent.currentLocation.latitude;

    const agentLongitude =
      agent.currentLocation.longitude;


    const distance =
      calculateDistance(
        latitude,
        longitude,
        agentLatitude,
        agentLongitude
      );


    if (
      distance < shortestDistance
    ) {

      shortestDistance = distance;

      nearestAgent = {
        agent,
        distance
      };
    }
  }


  return nearestAgent;
};


// -----------------------------------------
// Assign nearest agent
// -----------------------------------------

export const assignNearestAgent = async ({
  orderId,
  pickupLatitude,
  pickupLongitude,
  actorId,
  actorRole
}) => {

  const result =
    await findNearestAgent({
      latitude: pickupLatitude,
      longitude: pickupLongitude
    });


  if (!result) {
    throw new Error(
      "No available agent found"
    );
  }


  const {
    agent,
    distance
  } = result;


  const order =
    await Order.findById(orderId);


  if (!order) {
    throw new Error(
      "Order not found"
    );
  }


  if (order.agentId) {
    throw new Error(
      "Order already has an assigned agent"
    );
  }


  // Assign agent
  order.agentId = agent._id;

  order.status = "ASSIGNED";

  await order.save();


  // Make agent unavailable
  agent.isAvailable = false;

  await agent.save();


  // Add tracking event
  await addTrackingEvent({
    orderId: order._id,

    status: "ASSIGNED",

    actorId,

    actorRole,

    remarks:
      `Agent ${agent.name} assigned automatically. Distance: ${distance.toFixed(2)} km`
  });


  return {
    order,

    agent,

    distance:
      Math.round(distance * 100) / 100
  };
};