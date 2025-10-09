// Load env variables first
import dotenv from 'dotenv';
dotenv.config();

// =============================
// ✅ Imports & Config
// =============================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


// Models
import User from "./models/User.js";
import PaymentLink from "./models/PaymentLink.js"; // 🆕 Added for payouts route

// Routes
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import paymentLinkRoutes from "./routes/paymentLinks.js";
import disputeRoutes from "./routes/disputes.js";

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
// 🔍 Enhanced Request Logging Middleware
// =============================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔍 [${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Log request parameters and query
  if (Object.keys(req.params).length > 0) {
    console.log(`📋 Params:`, req.params);
  }
  if (Object.keys(req.query).length > 0) {
    console.log(`❓ Query:`, req.query);
  }
  
  // Log request body (excluding sensitive fields in production)
  if (process.env.NODE_ENV !== 'production' && req.body) {
    const logBody = { ...req.body };
    // Hide sensitive fields
    if (logBody.password) logBody.password = '***';
    if (logBody.token) logBody.token = '***';
    if (logBody.cardNumber) logBody.cardNumber = '***';
    if (logBody.cvv) logBody.cvv = '***';
    
    if (Object.keys(logBody).length > 0) {
      console.log('📦 Request body:', logBody);
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
app.use("/api/disputes", disputeRoutes);

// =============================
// ✅ Payouts Routes (NEW)
// =============================
app.get("/api/payouts/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    console.log(`📊 Fetching payouts for seller: ${sellerId}`);
    
    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID format"
      });
    }

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Get payment links for this seller
    const paymentLinks = await PaymentLink.find({ seller: sellerId })
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${paymentLinks.length} payment links for seller ${sellerId}`);

    // Calculate payout stats based on business logic
    const payoutStats = {
      available: 0,
      inEscrow: 0,
      refunded: 0,
      withdrawn: 0,
      totalSales: 0
    };

    // Transform payment links to payout format
    const payouts = paymentLinks.map(link => {
      const amount = parseInt(link.productPrice) || 0;
      let status = 'in_escrow';
      let payoutStatus = 'pending';

      // Calculate stats and determine payout status
      if (link.status === 'completed' && !link.payoutProcessed) {
        payoutStats.available += amount;
        status = 'available';
        payoutStatus = 'ready_for_withdrawal';
      } else if (['paid', 'delivered', 'disputed'].includes(link.status)) {
        payoutStats.inEscrow += amount;
        status = 'in_escrow';
        payoutStatus = 'held';
      } else if (link.status === 'refunded') {
        payoutStats.refunded += amount;
        status = 'refunded';
        payoutStatus = 'refunded';
      } else if (link.status === 'completed' && link.payoutProcessed) {
        payoutStats.withdrawn += amount;
        status = 'withdrawn';
        payoutStatus = 'completed';
      }

      // Always add to total sales
      payoutStats.totalSales += amount;

      return {
        id: `PYT-${link._id}`,
        orderId: link._id,
        product: link.productName || 'Unknown Product',
        amount: amount,
        method: 'mobile_money', // Default method
        status: status,
        payoutStatus: payoutStatus,
        date: link.updatedAt || link.createdAt,
        provider: 'M-Pesa', // Default provider
        phoneNumber: seller.phone || '+255 XXX XXX XXX',
        originalOrder: {
          status: link.status,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt
        },
        source: 'api'
      };
    });

    res.json({
      success: true,
      message: "Payouts data retrieved successfully",
      payoutStats,
      payouts,
      sellerInfo: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        businessName: seller.businessName
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error fetching payouts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payout data",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Withdrawal processing endpoint
app.post("/api/payouts/withdraw", async (req, res) => {
  try {
    const { sellerId, amount, method, provider, phoneNumber } = req.body;

    console.log(`💳 Withdrawal request from seller ${sellerId}: ${amount} via ${method}`);

    // Validate required fields
    if (!sellerId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: sellerId, amount, method"
      });
    }

    // Validate seller
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID"
      });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // In a real implementation, you would:
    // 1. Check available balance
    // 2. Process the withdrawal with payment provider
    // 3. Update database records
    // 4. Send confirmation

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create withdrawal record (in real app, save to database)
    const withdrawalRecord = {
      id: `WTH-${Date.now()}`,
      sellerId: sellerId,
      amount: parseInt(amount),
      method: method,
      provider: provider || 'M-Pesa',
      phoneNumber: phoneNumber,
      status: 'processed',
      processedAt: new Date().toISOString(),
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    console.log(`✅ Withdrawal processed: ${withdrawalRecord.transactionId}`);

    res.json({
      success: true,
      message: "Withdrawal processed successfully",
      withdrawal: withdrawalRecord,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error processing withdrawal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process withdrawal",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Seller profile route
app.get("/api/sellers/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    console.log(`👤 Fetching seller profile: ${sellerId}`);
    
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
    console.error("❌ Error fetching seller profile:", error);
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
  console.log(`❌ 404 - API Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`❌ Request details:`, {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
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
      
      // 🆕 Payouts endpoints
      "GET /api/payouts/seller/:sellerId",
      "POST /api/payouts/withdraw",
      
      // Disputes endpoints
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
    ]
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
  
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // MongoDB CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
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

  // Default error response
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : error.message,
    error: process.env.NODE_ENV === "production" && statusCode === 500 ? {} : error.message,
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
  console.log(`\n🎉 ==========================================`);
  console.log(`🎉 Server running on port ${PORT}`);
  console.log(`🎉 ==========================================`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`💰 Payouts API: http://localhost:${PORT}/api/payouts/seller/:sellerId`);
  console.log(`💳 Withdrawals: http://localhost:${PORT}/api/payouts/withdraw`);
  console.log(`⚖️ Disputes API: http://localhost:${PORT}/api/disputes`);
  console.log(`🛡️ Rate limiting: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Development mode'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🎉 ==========================================\n`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
});

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export default app;