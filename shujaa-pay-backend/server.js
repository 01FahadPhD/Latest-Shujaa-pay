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
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Models
import User from "./models/User.js"; // 🎯 Required for seller profile route

// Routes
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import paymentLinkRoutes from "./routes/paymentLinks.js";
import disputeRoutes from "./routes/disputes.js";

// Load env variables first
dotenv.config();

// ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// =============================
// ✅ Uploads Folder Creation
// =============================
const uploadsDir = path.join(__dirname, "uploads/evidence");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads directory created:", uploadsDir);
}

// =============================
// ✅ Security Middleware
// =============================
if (process.env.NODE_ENV === "production") {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api/", apiLimiter);

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
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅ Serve uploaded files
app.use(cookieParser()); // ✅ add this before routes

// =============================
// ✅ Request Logging Middleware
// =============================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Log request body (excluding sensitive fields in production)
  if (process.env.NODE_ENV !== 'production' && req.body) {
    const logBody = { ...req.body };
    // Hide sensitive fields
    if (logBody.password) logBody.password = '***';
    if (logBody.token) logBody.token = '***';
    if (logBody.cardNumber) logBody.cardNumber = '***';
    
    if (Object.keys(logBody).length > 0) {
      console.log('Request body:', logBody);
    }
  }
  next();
});

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
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// =============================
// ✅ API Routes
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/payment-links", paymentLinkRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/disputes", disputeRoutes); // 🆕 Added disputes routes

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
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
});

// =============================
// ❌ 404 API Handler (ENHANCED)
// =============================
app.use(/\/api\/(.*)/, (req, res) => {
  res.status(404).json({
    success: false,
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
      
      // Payment Links
      "POST /api/payment-links/create",
      "GET /api/payment-links/seller/:sellerId",
      "GET /api/payment-links/:linkId",
      "DELETE /api/payment-links/:linkId",
      "PUT /api/payment-links/:linkId/deliver",
      "GET /api/payment-links/seller/:sellerId/orders",
      
      // Payments
      "POST /api/payments/process",
      "GET /api/payments/seller/:sellerId",
      "GET /api/payments/:paymentId",
      
      // 🆕 Enhanced Disputes endpoints
      "GET /api/disputes/seller/:sellerId",
      "GET /api/disputes/:disputeId",
      "POST /api/disputes/:disputeId/seller-evidence",
      "POST /api/disputes/:disputeId/seller-response",
      "POST /api/disputes/",
      "PUT /api/disputes/:disputeId/status (admin)",
      "GET /api/disputes (admin)",
      "GET /api/disputes/stats/seller/:sellerId",
      "POST /api/payment-links/:linkId/dispute",
      "GET /api/disputes/search/global",
      "GET /api/disputes/filters/options"
    ],
    timestamp: new Date().toISOString()
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
// 💥 Error Handling Middleware (ENHANCED)
// =============================
app.use((error, req, res, next) => {
  console.error("💥 Server error:", {
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 10 files allowed.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    });
  }

  // MongoDB duplicate key errors
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found.'
    });
  }

  // MongoDB validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? {} : error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack })
  });
});

// =============================
// 🚀 Global Error Handlers
// =============================

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

// =============================
// 🚀 Start Server
// =============================
const server = app.listen(PORT, () => {
  console.log(`🎉 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`); // ✅ Multer uploads accessible
  console.log(`⚖️ Disputes API: http://localhost:${PORT}/api/disputes`);
  console.log(`🛡️ Rate limiting: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Development mode'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});

export default app;