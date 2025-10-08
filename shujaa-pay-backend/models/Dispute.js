// routes/disputes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Dispute from "../models/Dispute.js";
import User from "../models/User.js";

const router = express.Router();

// =============================
// ✅ Multer Setup for Evidence Upload
// =============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join("uploads", "evidence");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, PDF, and Word documents allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB max per file, 10 files max
  fileFilter,
});

// =============================
// ✅ Create a new Dispute
// =============================
router.post("/", async (req, res, next) => {
  try {
    const { order_id, seller_id, buyer_id, buyer_name, buyer_phone, product_name, amount, reason, description } = req.body;

    if (!order_id || !seller_id || !buyer_id || !buyer_name || !buyer_phone || !product_name || !amount || !reason || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const dispute = await Dispute.create({
      order_id,
      seller_id,
      buyer_id,
      buyer_name,
      buyer_phone,
      product_name,
      amount,
      reason,
      description,
      timeline: [
        {
          action: "Dispute created",
          date: new Date().toISOString(),
          user: buyer_name,
          type: "buyer",
        },
      ],
    });

    res.status(201).json({ success: true, dispute });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Get all disputes (admin)
// =============================
router.get("/", async (req, res, next) => {
  try {
    const disputes = await Dispute.find().sort({ created_at: -1 });
    res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Get dispute by ID
// =============================
router.get("/:disputeId", async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ dispute_id: req.params.disputeId });
    if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });
    res.json({ success: true, dispute });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Get all disputes for a seller
// =============================
router.get("/seller/:sellerId", async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ seller_id: req.params.sellerId }).sort({ created_at: -1 });
    res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Upload seller evidence
// =============================
router.post("/:disputeId/seller-evidence", upload.array("files", 10), async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ dispute_id: req.params.disputeId });
    if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const evidence = req.files.map(file => ({
      type: file.mimetype.startsWith("image/") ? "image" : "document",
      url: `/uploads/evidence/${file.filename}`,
      name: file.originalname,
    }));

    dispute.seller_evidence.push(...evidence);
    dispute.timeline.push({
      action: "Seller uploaded evidence",
      date: new Date().toISOString(),
      user: dispute.seller_id.toString(),
      type: "seller",
      details: `Uploaded ${evidence.length} file(s)`,
    });

    dispute.updated_at = Date.now();
    await dispute.save();

    res.json({ success: true, message: "Evidence uploaded", evidence });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Add seller response
// =============================
router.post("/:disputeId/seller-response", async (req, res, next) => {
  try {
    const { response } = req.body;
    if (!response || response.trim() === "") {
      return res.status(400).json({ success: false, message: "Response cannot be empty" });
    }

    const dispute = await Dispute.findOne({ dispute_id: req.params.disputeId });
    if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

    dispute.seller_response = response;
    dispute.timeline.push({
      action: "Seller responded to dispute",
      date: new Date().toISOString(),
      user: dispute.seller_id.toString(),
      type: "seller",
    });
    dispute.updated_at = Date.now();

    await dispute.save();

    res.json({ success: true, message: "Response submitted", seller_response: dispute.seller_response });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Update dispute status (admin only)
// =============================
router.put("/:disputeId/status", async (req, res, next) => {
  try {
    const { status, admin_comment, resolution } = req.body;
    if (!status || !["opened", "in_review", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const dispute = await Dispute.findOne({ dispute_id: req.params.disputeId });
    if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

    dispute.status = status;
    if (admin_comment) dispute.admin_comment = admin_comment;
    if (resolution) dispute.resolution = resolution;

    dispute.timeline.push({
      action: `Dispute marked as ${status}`,
      date: new Date().toISOString(),
      user: "Admin",
      type: "admin",
      details: admin_comment || "",
    });

    dispute.updated_at = Date.now();
    await dispute.save();

    res.json({ success: true, message: "Dispute status updated", dispute });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Get dispute stats for a seller
// =============================
router.get("/stats/seller/:sellerId", async (req, res, next) => {
  try {
    const totalDisputes = await Dispute.countDocuments({ seller_id: req.params.sellerId });
    const resolved = await Dispute.countDocuments({ seller_id: req.params.sellerId, status: "resolved" });
    const opened = await Dispute.countDocuments({ seller_id: req.params.sellerId, status: "opened" });
    const inReview = await Dispute.countDocuments({ seller_id: req.params.sellerId, status: "in_review" });

    res.json({
      success: true,
      stats: { totalDisputes, resolved, opened, inReview },
    });
  } catch (error) {
    next(error);
  }
});

// =============================
// ✅ Search disputes globally
// =============================
router.get("/search/global", async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Search query is required" });

    const disputes = await Dispute.find({
      $or: [
        { dispute_id: { $regex: query, $options: "i" } },
        { order_id: { $regex: query, $options: "i" } },
        { buyer_name: { $regex: query, $options: "i" } },
        { product_name: { $regex: query, $options: "i" } },
      ],
    }).limit(50).sort({ created_at: -1 });

    res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    next(error);
  }
});

export default router;
