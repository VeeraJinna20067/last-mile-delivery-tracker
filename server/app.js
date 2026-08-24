import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";
import rateRoutes from "./routes/rateRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();


// ===============================
// Global Middleware
// ===============================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    credentials: true
  })
);


// Parse JSON request bodies
app.use(
  express.json()
);


// Parse URL-encoded request bodies
app.use(
  express.urlencoded({
    extended: true
  })
);


// Parse cookies
app.use(
  cookieParser()
);


// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {

  res.json({

    success: true,

    message:
      "Last-Mile Delivery API is running"

  });

});


// ===============================
// API Routes
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/zones",
  zoneRoutes
);

app.use(
  "/api/rate-cards",
  rateRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/agents",
  agentRoutes
);

app.use(
  "/api/tracking",
  trackingRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);
app.use("/api/admin", adminRoutes);

export default app;