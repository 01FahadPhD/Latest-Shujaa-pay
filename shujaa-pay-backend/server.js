// =============================
// ✅ Imports & Config
// =============================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// Models
import User from "./models/User.js"; // 🎯 Required for seller profile route

// Routes
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import paymentLinkRoutes from "./routes/paymentLinks.js";

// Load env variables first
dotenv.config();

// ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// =============================
// ✅ Database Connection
// =============================
await connectDB();

// =============================
// ✅ Middleware
// =============================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // Handle large JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Static uploads
app.use(cookieParser()); // ✅ add this before routes

// =============================
// ✅ Health & Test Routes
// =============================
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// =============================
// ✅ API Routes
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/payment-links", paymentLinkRoutes);
app.use("/api/payments", paymentRoutes);

// Seller profile route (requires User model)
app.get("/api/sellers/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await User.findById(sellerId).select("-password");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.json({
      success: true,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        location: seller.location || "Location not specified",
        businessType: seller.businessType || "Not specified",
        businessName: seller.businessName || "Individual Seller",
        rating: seller.rating || 0,
        totalRatings: seller.totalRatings || 0,
        completedOrders: seller.completedOrders || 0,
        profileImage: seller.profileImage,
        createdAt: seller.createdAt,
        accountStatus: seller.accountStatus || "active",
      },
    });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller profile",
      error: error.message,
    });
  }
});

// =============================
// ❌ 404 API Handler
// =============================
app.use(/\/api\/(.*)/, (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
    availableEndpoints: [
      "GET /api/test",
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/profile",
      "PUT /api/auth/profile",
      "GET /api/auth/check-email/:email",
      "GET /api/sellers/:sellerId",
      "POST /api/payment-links/create",
      "GET /api/payment-links/seller/:sellerId",
      "GET /api/payment-links/:linkId",
      "DELETE /api/payment-links/:linkId",
      "PUT /api/payment-links/:linkId/deliver",
      "GET /api/payment-links/seller/:sellerId/orders",
    ],
  });
});

// =============================
// 🌍 Production: Serve React App
// =============================
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// =============================
// 💥 Error Handling Middleware
// =============================
app.use((error, req, res, next) => {
  console.error("💥 Server error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? {} : error.message,
  });
});

// =============================
// 🚀 Start Server
// =============================
app.listen(PORT, () => {
  console.log(`🎉 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});
