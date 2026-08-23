import nodemailer from "nodemailer";

import User from "../models/User.js";
import Notification from "../models/Notification.js";


// -----------------------------------------
// Email transporter
// -----------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,

  secure:
    Number(process.env.EMAIL_PORT) === 465,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// -----------------------------------------
// Notification messages
// -----------------------------------------

const notificationMessages = {
  ORDER_CREATED: {
    title: "Order Created",
    subject: "Your delivery order has been created"
  },

  AGENT_ASSIGNED: {
    title: "Agent Assigned",
    subject: "An agent has been assigned to your order"
  },

  PICKED_UP: {
    title: "Package Picked Up",
    subject: "Your package has been picked up"
  },

  IN_TRANSIT: {
    title: "Order In Transit",
    subject: "Your package is in transit"
  },

  OUT_FOR_DELIVERY: {
    title: "Out for Delivery",
    subject: "Your package is out for delivery"
  },

  DELIVERED: {
    title: "Order Delivered",
    subject: "Your package has been delivered"
  },

  FAILED: {
    title: "Delivery Failed",
    subject: "Your delivery could not be completed"
  },

  RESCHEDULED: {
    title: "Delivery Rescheduled",
    subject: "Your delivery has been rescheduled"
  }
};


// -----------------------------------------
// Create in-app notification
// -----------------------------------------

export const createNotification = async ({
  userId,
  orderId,
  type,
  message
}) => {

  console.log("================================");
  console.log("CREATING NOTIFICATION");
  console.log("userId:", userId);
  console.log("orderId:", orderId);
  console.log("type:", type);
  console.log("message:", message);
  console.log("================================");


  const config =
    notificationMessages[type];


  if (!config) {

    throw new Error(
      `Unknown notification type: ${type}`
    );

  }


  const notification =
    await Notification.create({

      userId,

      orderId,

      type,

      title: config.title,

      message

    });


  console.log(
    "NOTIFICATION CREATED:",
    notification._id
  );


  return notification;
};

// -----------------------------------------
// Send email
// -----------------------------------------

export const sendEmailNotification = async ({
  userId,
  orderId,
  type,
  message
}) => {

  const user =
    await User.findById(userId);

  if (!user) {
    return null;
  }

  if (!user.email) {
    return null;
  }

  const config =
    notificationMessages[type];

  if (!config) {
    throw new Error(
      `Unknown notification type: ${type}`
    );
  }

  // Don't fail the whole order workflow
  // if email credentials are not configured.
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    console.log(
      "Email credentials not configured. Skipping email."
    );

    return null;
  }

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER,

    to: user.email,

    subject:
      `${config.subject} - ${orderId || ""}`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
        color: #1f2937;
      ">

        <h2 style="
          margin-bottom: 16px;
        ">
          ${config.title}
        </h2>

        <p style="
          line-height: 1.6;
        ">
          ${message}
        </p>

        ${
          orderId
            ? `
              <p style="
                margin-top: 24px;
                font-size: 14px;
                color: #6b7280;
              ">
                Order ID: ${orderId}
              </p>
            `
            : ""
        }

        <p style="
          margin-top: 32px;
          font-size: 13px;
          color: #6b7280;
        ">
          Last-Mile Delivery Tracker
        </p>

      </div>
    `
  };

  const result =
    await transporter.sendMail(
      mailOptions
    );

  console.log(
    `Email sent to ${user.email}`
  );

  return result;
};


// -----------------------------------------
// Notify customer
// -----------------------------------------

export const notifyCustomer = async ({
  order,
  type,
  message
}) => {

  console.log(
    "--------------------------------"
  );

  console.log(
    "notifyCustomer() CALLED"
  );

  console.log(
    "Order:",
    order?._id
  );

  console.log(
    "Customer:",
    order?.customerId
  );

  console.log(
    "Type:",
    type
  );

  console.log(
    "--------------------------------"
  );


  if (!order || !order.customerId) {

    console.log(
      "NO CUSTOMER ID - notification skipped"
    );

    return;

  }


  const userId =
    order.customerId?._id ||
    order.customerId;


  console.log(
    "Notification userId:",
    userId
  );


  await createNotification({

    userId,

    orderId:
      order._id,

    type,

    message

  });


  try {

    await sendEmailNotification({

      userId,

      orderId:
        order.orderNumber,

      type,

      message

    });

  } catch (error) {

    console.error(
      "Email notification failed:",
      error.message
    );

  }

};