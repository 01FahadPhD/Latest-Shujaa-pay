// routes/disputes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Dispute from "../models/Dispute.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// =============================
// ✅ Multer Setup for Evidence Upload
// =============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join("uploads", "evidence");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, uniqueSuffix + "-" + sanitizedName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg", 
    "image/png", 
    "image/jpg", 
    "image/gif",
    "image/webp",
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images, PDF, and Word documents allowed.`), false);
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 10 // 10 files max
  },
  fileFilter,
});

// =============================
// ✅ Error Handling Middleware
// =============================
const handleError = (error, req, res, next) => {
  console.error('❌ Dispute Route Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 10MB per file.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Too many files. Maximum 10 files allowed.' 
      });
    }
  }
  
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// =============================
// ✅ Create a new Dispute
// =============================
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { 
      order_id, 
      seller_id, 
      buyer_id, 
      buyer_name, 
      buyer_phone, 
      product_name, 
      amount, 
      reason, 
      description,
      linkId,
      buyer_email,
      seller_name,
      product_description 
    } = req.body;

    // Validate required fields
    const requiredFields = ['order_id', 'seller_id', 'buyer_id', 'buyer_name', 'buyer_phone', 'product_name', 'amount', 'reason', 'description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    console.log('🔄 Creating new dispute for order:', order_id);

    // Create dispute with enhanced data
    const disputeData = {
      order_id,
      seller_id,
      buyer_id,
      buyer_name,
      buyer_phone,
      product_name,
      amount: parseFloat(amount),
      reason,
      description,
      linkId: linkId || order_id,
      buyer_email: buyer_email || '',
      seller_name: seller_name || 'Seller',
      product_description: product_description || '',
      status: 'opened',
      timeline: [
        {
          action: "Dispute opened by buyer",
          date: new Date().toISOString(),
          user: buyer_name,
          user_type: "buyer",
          details: `Reason: ${reason}`
        }
      ]
    };

    const dispute = await Dispute.create(disputeData);

    console.log('✅ New dispute created:', dispute.dispute_id);

    res.status(201).json({ 
      success: true, 
      message: 'Dispute created successfully',
      dispute 
    });
  } catch (error) {
    console.error('❌ Error creating dispute:', error);
    next(error);
  }
});

// =============================
// ✅ Get all disputes (admin)
// =============================
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, sort = '-created_at' } = req.query;
    
    console.log('🔄 Fetching all disputes');

    // Build query
    let query = {};
    if (status && ['opened', 'in_review', 'resolved', 'disputed'].includes(status)) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const disputes = await Dispute.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Dispute.countDocuments(query);

    console.log(`✅ Found ${disputes.length} disputes out of ${total} total`);

    res.json({ 
      success: true, 
      count: disputes.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      disputes 
    });
  } catch (error) {
    console.error('❌ Error fetching all disputes:', error);
    next(error);
  }
});

// =============================
// ✅ Get dispute by ID
// =============================
router.get("/:disputeId", authenticateToken, async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    
    console.log('🔄 Fetching dispute:', disputeId);

    const dispute = await Dispute.findOne({ 
      $or: [
        { dispute_id: disputeId },
        { _id: disputeId }
      ]
    });

    if (!dispute) {
      console.log('❌ Dispute not found:', disputeId);
      return res.status(404).json({ 
        success: false, 
        message: "Dispute not found" 
      });
    }

    console.log('✅ Dispute found:', dispute.dispute_id);

    res.json({ 
      success: true, 
      dispute 
    });
  } catch (error) {
    console.error('❌ Error fetching dispute:', error);
    next(error);
  }
});

// =============================
// ✅ Get all disputes for a seller
// =============================
router.get("/seller/:sellerId", authenticateToken, async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    console.log('🔄 Fetching disputes for seller:', sellerId);

    // Build query
    let query = { seller_id: sellerId };
    if (status && ['opened', 'in_review', 'resolved', 'disputed'].includes(status)) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const disputes = await Dispute.find(query)
      .sort({ created_at: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Dispute.countDocuments(query);

    console.log(`✅ Found ${disputes.length} disputes for seller ${sellerId}`);

    res.json({ 
      success: true, 
      count: disputes.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      disputes 
    });
  } catch (error) {
    console.error('❌ Error fetching seller disputes:', error);
    next(error);
  }
});

// =============================
// ✅ Get all disputes for a buyer
// =============================
router.get("/buyer/:buyerId", authenticateToken, async (req, res, next) => {
  try {
    const { buyerId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    console.log('🔄 Fetching disputes for buyer:', buyerId);

    // Build query
    let query = { buyer_id: buyerId };
    if (status && ['opened', 'in_review', 'resolved', 'disputed'].includes(status)) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const disputes = await Dispute.find(query)
      .sort({ created_at: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Dispute.countDocuments(query);

    console.log(`✅ Found ${disputes.length} disputes for buyer ${buyerId}`);

    res.json({ 
      success: true, 
      count: disputes.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      disputes 
    });
  } catch (error) {
    console.error('❌ Error fetching buyer disputes:', error);
    next(error);
  }
});

// =============================
// ✅ Upload seller evidence
// =============================
router.post("/:disputeId/seller-evidence", authenticateToken, upload.array("evidence", 10), async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { sellerId, submittedAt } = req.body;
    
    console.log('🔄 Uploading seller evidence for dispute:', disputeId);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No files uploaded" 
      });
    }

    const dispute = await Dispute.findOne({ 
      $or: [
        { dispute_id: disputeId },
        { _id: disputeId }
      ]
    });

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: "Dispute not found" 
      });
    }

    // Process uploaded files
    const evidence = req.files.map(file => ({
      type: file.mimetype.startsWith("image/") ? "image" : "document",
      url: `/uploads/evidence/${file.filename}`,
      name: file.originalname,
      uploaded_at: submittedAt || new Date().toISOString()
    }));

    // Add to seller evidence array
    if (!dispute.seller_evidence) {
      dispute.seller_evidence = [];
    }
    dispute.seller_evidence.push(...evidence);

    // Add to timeline
    dispute.timeline.push({
      action: "Seller uploaded evidence",
      date: new Date().toISOString(),
      user: sellerId || dispute.seller_id.toString(),
      user_type: "seller",
      details: `Uploaded ${evidence.length} file(s) as evidence`
    });

    dispute.updated_at = new Date();
    await dispute.save();

    console.log('✅ Seller evidence uploaded:', evidence.length, 'files');

    res.json({ 
      success: true, 
      message: "Evidence uploaded successfully",
      evidence,
      dispute 
    });
  } catch (error) {
    console.error('❌ Error uploading seller evidence:', error);
    next(error);
  }
});

// =============================
// ✅ Add seller response
// =============================
router.post("/:disputeId/seller-response", authenticateToken, async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { response, sellerId, respondedAt } = req.body;
    
    console.log('🔄 Submitting seller response for dispute:', disputeId);

    if (!response || response.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Response cannot be empty" 
      });
    }

    const dispute = await Dispute.findOne({ 
      $or: [
        { dispute_id: disputeId },
        { _id: disputeId }
      ]
    });

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: "Dispute not found" 
      });
    }

    // Update dispute
    dispute.seller_response = response.trim();
    dispute.responded_at = respondedAt || new Date().toISOString();
    dispute.status = 'in_review'; // Move to review after seller responds

    // Add to timeline
    dispute.timeline.push({
      action: "Seller submitted response",
      date: new Date().toISOString(),
      user: sellerId || dispute.seller_id.toString(),
      user_type: "seller",
      details: "Response submitted for admin review"
    });

    dispute.updated_at = new Date();
    await dispute.save();

    console.log('✅ Seller response submitted');

    res.json({ 
      success: true, 
      message: "Response submitted successfully", 
      seller_response: dispute.seller_response,
      dispute 
    });
  } catch (error) {
    console.error('❌ Error submitting seller response:', error);
    next(error);
  }
});

// =============================
// ✅ Update dispute status (admin only)
// =============================
router.put("/:disputeId/status", authenticateToken, async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { status, admin_comment, resolution, assigned_admin } = req.body;
    
    console.log('🔄 Updating dispute status:', disputeId, 'to', status);

    if (!status || !["opened", "in_review", "resolved", "disputed"].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be one of: opened, in_review, resolved, disputed" 
      });
    }

    const dispute = await Dispute.findOne({ 
      $or: [
        { dispute_id: disputeId },
        { _id: disputeId }
      ]
    });

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: "Dispute not found" 
      });
    }

    // Update fields
    dispute.status = status;
    if (admin_comment) dispute.admin_comment = admin_comment;
    if (resolution) dispute.resolution = resolution;
    if (assigned_admin) dispute.assigned_admin = assigned_admin;

    // Set resolved date if status is resolved
    if (status === 'resolved') {
      dispute.resolved_at = new Date().toISOString();
    }

    // Add to timeline
    dispute.timeline.push({
      action: `Dispute status updated to ${status}`,
      date: new Date().toISOString(),
      user: assigned_admin || "Admin",
      user_type: "admin",
      details: admin_comment || `Status changed to ${status}`
    });

    dispute.updated_at = new Date();
    await dispute.save();

    console.log('✅ Dispute status updated to:', status);

    res.json({ 
      success: true, 
      message: "Dispute status updated successfully", 
      dispute 
    });
  } catch (error) {
    console.error('❌ Error updating dispute status:', error);
    next(error);
  }
});

// =============================
// ✅ Get dispute stats for a seller
// =============================
router.get("/stats/seller/:sellerId", authenticateToken, async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    
    console.log('📊 Fetching dispute stats for seller:', sellerId);

    const totalDisputes = await Dispute.countDocuments({ seller_id: sellerId });
    const resolved = await Dispute.countDocuments({ 
      seller_id: sellerId, 
      status: "resolved" 
    });
    const opened = await Dispute.countDocuments({ 
      seller_id: sellerId, 
      status: { $in: ["opened", "disputed"] } 
    });
    const inReview = await Dispute.countDocuments({ 
      seller_id: sellerId, 
      status: "in_review" 
    });

    const stats = {
      total: totalDisputes,
      opened: opened,
      in_review: inReview,
      resolved: resolved
    };

    console.log('✅ Dispute stats:', stats);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching dispute stats:', error);
    next(error);
  }
});

// =============================
// ✅ Get dispute stats for a buyer
// =============================
router.get("/stats/buyer/:buyerId", authenticateToken, async (req, res, next) => {
  try {
    const { buyerId } = req.params;
    
    console.log('📊 Fetching dispute stats for buyer:', buyerId);

    const totalDisputes = await Dispute.countDocuments({ buyer_id: buyerId });
    const resolved = await Dispute.countDocuments({ 
      buyer_id: buyerId, 
      status: "resolved" 
    });
    const opened = await Dispute.countDocuments({ 
      buyer_id: buyerId, 
      status: { $in: ["opened", "disputed"] } 
    });
    const inReview = await Dispute.countDocuments({ 
      buyer_id: buyerId, 
      status: "in_review" 
    });

    const stats = {
      total: totalDisputes,
      opened: opened,
      in_review: inReview,
      resolved: resolved
    };

    console.log('✅ Buyer dispute stats:', stats);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching buyer dispute stats:', error);
    next(error);
  }
});

// =============================
// ✅ Search disputes globally
// =============================
router.get("/search/global", authenticateToken, async (req, res, next) => {
  try {
    const { query, status, limit = 50 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    console.log('🔍 Searching disputes for:', query);

    // Build search query
    let searchQuery = {
      $or: [
        { dispute_id: { $regex: query, $options: "i" } },
        { order_id: { $regex: query, $options: "i" } },
        { buyer_name: { $regex: query, $options: "i" } },
        { product_name: { $regex: query, $options: "i" } },
        { seller_name: { $regex: query, $options: "i" } },
        { reason: { $regex: query, $options: "i" } }
      ]
    };

    // Add status filter if provided
    if (status && ['opened', 'in_review', 'resolved', 'disputed'].includes(status)) {
      searchQuery.status = status;
    }

    const disputes = await Dispute.find(searchQuery)
      .limit(parseInt(limit))
      .sort({ created_at: -1 })
      .lean();

    console.log(`✅ Search found ${disputes.length} disputes`);

    res.json({ 
      success: true, 
      count: disputes.length, 
      disputes 
    });
  } catch (error) {
    console.error('❌ Error searching disputes:', error);
    next(error);
  }
});

// =============================
// ✅ Upload buyer evidence
// =============================
router.post("/:disputeId/buyer-evidence", authenticateToken, upload.array("evidence", 10), async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { buyerId, submittedAt } = req.body;
    
    console.log('🔄 Uploading buyer evidence for dispute:', disputeId);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No files uploaded" 
      });
    }

    const dispute = await Dispute.findOne({ 
      $or: [
        { dispute_id: disputeId },
        { _id: disputeId }
      ]
    });

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: "Dispute not found" 
      });
    }

    // Process uploaded files
    const evidence = req.files.map(file => ({
      type: file.mimetype.startsWith("image/") ? "image" : "document",
      url: `/uploads/evidence/${file.filename}`,
      name: file.originalname,
      uploaded_at: submittedAt || new Date().toISOString()
    }));

    // Add to buyer evidence array
    if (!dispute.buyer_evidence) {
      dispute.buyer_evidence = [];
    }
    dispute.buyer_evidence.push(...evidence);

    // Add to timeline
    dispute.timeline.push({
      action: "Buyer uploaded additional evidence",
      date: new Date().toISOString(),
      user: buyerId || dispute.buyer_id.toString(),
      user_type: "buyer",
      details: `Uploaded ${evidence.length} additional file(s)`
    });

    dispute.updated_at = new Date();
    await dispute.save();

    console.log('✅ Buyer evidence uploaded:', evidence.length, 'files');

    res.json({ 
      success: true, 
      message: "Evidence uploaded successfully",
      evidence,
      dispute 
    });
  } catch (error) {
    console.error('❌ Error uploading buyer evidence:', error);
    next(error);
  }
});

// =============================
// ✅ Use error handling middleware
// =============================
router.use(handleError);

export default router;