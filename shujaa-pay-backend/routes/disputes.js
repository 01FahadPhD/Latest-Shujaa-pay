// routes/disputes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import Dispute from "../models/Dispute.js";
import PaymentLink from "../models/PaymentLink.js";
import { authenticateToken as auth } from "../middleware/auth.js";

const router = express.Router();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------- Multer Setup ---------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/evidence/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and documents (PDF, DOC, DOCX) are allowed'));
    }
  }
});

// --------------------- Helper Functions ---------------------
const formatTimelineEntry = (action, user, type, details = null) => ({
  action,
  date: new Date(),
  user,
  type,
  details: details || action
});

// Generate unique dispute ID
const generateDisputeId = () => {
  return 'DSP-' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
};

// Validate dispute data
const validateDisputeData = (data) => {
  const { order_id, seller_id, buyer_name, buyer_phone, product_name, amount, reason, description } = data;
  
  if (!order_id || !seller_id || !buyer_name || !buyer_phone || !product_name || !amount || !reason) {
    return { valid: false, message: 'Missing required fields' };
  }
  
  if (typeof amount !== 'number' || amount <= 0) {
    return { valid: false, message: 'Invalid amount' };
  }
  
  return { valid: true };
};

// --------------------- Enhanced Routes ---------------------

// ✅ GET /api/disputes/seller/:sellerId - Get all disputes for a seller (ENHANCED)
router.get('/seller/:sellerId', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, page = 1, limit = 20, search } = req.query;

    console.log('🔄 Fetching disputes for seller:', sellerId, 'with search:', search);

    // Verify access rights
    if (req.user._id.toString() !== sellerId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your own disputes.' 
      });
    }

    // Build query with search functionality
    let query = { seller_id: sellerId };
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality - enhanced for frontend
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { dispute_id: searchRegex },
        { order_id: searchRegex },
        { buyer_name: searchRegex },
        { product_name: searchRegex },
        { reason: searchRegex },
        { buyer_phone: searchRegex }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch disputes with pagination and sorting
    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Enhanced data processing for frontend compatibility
    const processedDisputes = disputes.map(dispute => ({
      ...dispute,
      // Ensure frontend compatibility
      _id: dispute._id.toString(),
      dispute_id: dispute.dispute_id || dispute._id.toString(),
      order_id: dispute.order_id,
      buyer_name: dispute.buyer_name,
      product_name: dispute.product_name,
      amount: dispute.amount,
      reason: dispute.reason,
      description: dispute.description,
      status: dispute.status,
      created_at: dispute.createdAt || dispute.created_at,
      buyer_evidence: dispute.buyer_evidence || [],
      seller_evidence: dispute.seller_evidence || [],
      seller_response: dispute.seller_response,
      admin_comment: dispute.admin_comment,
      timeline: dispute.timeline || [],
      // Add calculated fields for frontend
      formattedAmount: `Tsh ${parseInt(dispute.amount).toLocaleString()}`,
      formattedDate: new Date(dispute.createdAt).toLocaleDateString('en-US')
    }));

    // Get total count for pagination
    const total = await Dispute.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    console.log(`✅ Found ${processedDisputes.length} disputes for seller ${sellerId}`);

    res.json({ 
      success: true, 
      disputes: processedDisputes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalDisputes: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      search: search || '',
      filters: {
        status: status || 'all',
        search: search || ''
      }
    });

  } catch (error) {
    console.error('❌ Error fetching disputes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch disputes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET /api/disputes/:disputeId - Get single dispute by ID (ENHANCED)
router.get('/:disputeId', auth, async (req, res) => {
  try {
    const { disputeId } = req.params;

    console.log('🔄 Fetching dispute:', disputeId);

    const dispute = await Dispute.findOne({ 
      $or: [
        { _id: disputeId }, 
        { dispute_id: disputeId },
        { order_id: disputeId }
      ] 
    }).populate('seller_id', 'name email phone businessName')
      .populate('buyer_id', 'name email phone');

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispute not found' 
      });
    }

    // Check access rights
    const isSeller = dispute.seller_id && dispute.seller_id._id.toString() === req.user._id.toString();
    const isBuyer = dispute.buyer_id && dispute.buyer_id._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isBuyer && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to view this dispute.' 
      });
    }

    // Enhanced response for frontend compatibility
    const enhancedDispute = {
      ...dispute.toObject(),
      // Frontend compatibility fields
      buyer_name: dispute.buyer_name || (dispute.buyer_id && dispute.buyer_id.name) || 'Buyer',
      buyer_phone: dispute.buyer_phone || (dispute.buyer_id && dispute.buyer_id.phone) || 'Not provided',
      product_name: dispute.product_name,
      amount: dispute.amount,
      seller_name: dispute.seller_id ? dispute.seller_id.businessName || dispute.seller_id.name : 'Seller',
      seller_phone: dispute.seller_id ? dispute.seller_id.phone : 'Not provided',
      seller_email: dispute.seller_id ? dispute.seller_id.email : 'Not provided',
      // Timeline enhancement
      timeline: (dispute.timeline || []).map(entry => ({
        ...entry,
        formattedDate: new Date(entry.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })),
      // Evidence enhancement
      buyer_evidence: (dispute.buyer_evidence || []).map(evidence => ({
        ...evidence,
        formattedDate: new Date(evidence.uploaded_at).toLocaleDateString('en-US')
      })),
      seller_evidence: (dispute.seller_evidence || []).map(evidence => ({
        ...evidence,
        formattedDate: new Date(evidence.uploaded_at).toLocaleDateString('en-US')
      }))
    };

    console.log('✅ Dispute fetched successfully:', dispute.dispute_id);

    res.json({ 
      success: true, 
      dispute: enhancedDispute
    });

  } catch (error) {
    console.error('❌ Error fetching dispute:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dispute details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ POST /api/disputes/:disputeId/seller-evidence - Submit seller evidence (ENHANCED)
router.post('/:disputeId/seller-evidence', auth, upload.array('evidence', 10), async (req, res) => {
  try {
    const { disputeId } = req.params;
    const files = req.files;
    const { sellerId, submittedAt } = req.body;

    console.log('🔄 Submitting seller evidence for dispute:', disputeId, 'Files:', files?.length);

    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded. Please select at least one file.' 
      });
    }

    // Find dispute
    const dispute = await Dispute.findOne({ 
      $or: [{ _id: disputeId }, { dispute_id: disputeId }] 
    });

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispute not found' 
      });
    }

    // Verify seller ownership
    if (dispute.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only submit evidence for your own disputes.' 
      });
    }

    // Process uploaded files with enhanced metadata
    const evidenceFiles = files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      url: `/uploads/evidence/${file.filename}`,
      name: file.originalname,
      uploaded_at: new Date(),
      size: file.size,
      mimetype: file.mimetype,
      formattedSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      formattedDate: new Date().toLocaleDateString('en-US')
    }));

    // Add evidence to dispute
    dispute.seller_evidence.push(...evidenceFiles);
    
    // Enhanced timeline entry
    dispute.timeline.push(formatTimelineEntry(
      `Seller submitted ${files.length} evidence file(s)`,
      req.user.name || req.user.businessName || 'Seller',
      'seller',
      `Submitted ${files.length} file(s): ${files.map(f => f.originalname).join(', ')}`
    ));

    // Update status if needed - enhanced status flow
    if (dispute.status === 'opened' || dispute.status === 'disputed') {
      dispute.status = 'in_review';
      dispute.timeline.push(formatTimelineEntry(
        'Dispute status updated to In Review',
        'System',
        'system',
        'Status changed due to seller evidence submission'
      ));
    }

    dispute.updatedAt = new Date();
    await dispute.save();

    console.log(`✅ Seller evidence submitted successfully for dispute ${dispute.dispute_id}`);

    // Enhanced response for frontend
    res.json({ 
      success: true, 
      message: `Evidence submitted successfully. ${files.length} file(s) uploaded.`,
      dispute: {
        ...dispute.toObject(),
        seller_evidence: dispute.seller_evidence,
        timeline: dispute.timeline
      },
      uploadedFiles: evidenceFiles,
      statusUpdate: dispute.status
    });

  } catch (error) {
    console.error('❌ Error submitting seller evidence:', error);
    
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
      message: 'Failed to submit evidence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ POST /api/disputes/:disputeId/seller-response - Submit seller response (ENHANCED)
router.post('/:disputeId/seller-response', auth, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { response, sellerId, respondedAt } = req.body;

    console.log('🔄 Submitting seller response for dispute:', disputeId);

    if (!response || !response.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response is required. Please provide your response to the dispute.' 
      });
    }

    if (response.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response is too short. Please provide a detailed response (minimum 10 characters).' 
      });
    }

    // Find dispute
    const dispute = await Dispute.findOne({ 
      $or: [{ _id: disputeId }, { dispute_id: disputeId }] 
    });

    if (!dispute) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispute not found' 
      });
    }

    // Verify seller ownership
    if (dispute.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only respond to your own disputes.' 
      });
    }

    // Update dispute with seller response
    dispute.seller_response = response.trim();
    
    // Enhanced timeline entry
    dispute.timeline.push(formatTimelineEntry(
      'Seller submitted formal response',
      req.user.name || req.user.businessName || 'Seller',
      'seller',
      `Response submitted: ${response.substring(0, 150)}${response.length > 150 ? '...' : ''}`
    ));

    // Enhanced status update logic
    if (dispute.status === 'opened' || dispute.status === 'disputed') {
      dispute.status = 'in_review';
      dispute.timeline.push(formatTimelineEntry(
        'Dispute status updated to In Review',
        'System',
        'system',
        'Status changed due to seller response submission'
      ));
    }

    dispute.updatedAt = new Date();
    await dispute.save();

    console.log(`✅ Seller response submitted successfully for dispute ${dispute.dispute_id}`);

    // Enhanced response for frontend
    res.json({ 
      success: true, 
      message: 'Response submitted successfully. Our team will review it shortly.',
      dispute: {
        ...dispute.toObject(),
        seller_response: dispute.seller_response,
        timeline: dispute.timeline,
        status: dispute.status
      },
      statusUpdate: dispute.status
    });

  } catch (error) {
    console.error('❌ Error submitting seller response:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ POST /api/disputes - Create a new dispute (from buyer) - ENHANCED
router.post('/', auth, upload.array('evidence', 10), async (req, res) => {
  try {
    const {
      order_id,
      seller_id,
      buyer_name,
      buyer_phone,
      product_name,
      amount,
      reason,
      description,
      otherReason,
      linkId
    } = req.body;

    const files = req.files;

    console.log('🔄 Creating new dispute for order:', order_id || linkId);

    // Use linkId if order_id not provided (compatibility with [linkId].jsx)
    const actualOrderId = order_id || linkId;

    // Enhanced validation
    const validation = validateDisputeData({
      order_id: actualOrderId,
      seller_id,
      buyer_name,
      buyer_phone,
      product_name,
      amount: parseFloat(amount),
      reason: otherReason || reason,
      description
    });

    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.message 
      });
    }

    // Check if dispute already exists for this order
    const existingDispute = await Dispute.findOne({ 
      order_id: actualOrderId,
      status: { $in: ['opened', 'disputed', 'in_review'] }
    });

    if (existingDispute) {
      return res.status(409).json({ 
        success: false, 
        message: 'A dispute is already open for this order. Please check your existing disputes.' 
      });
    }

    // Verify the order exists and belongs to the buyer
    const paymentLink = await PaymentLink.findOne({ 
      $or: [
        { _id: actualOrderId },
        { linkId: actualOrderId }
      ] 
    });

    if (!paymentLink) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found. Please check the order ID and try again.' 
      });
    }

    // Enhanced buyer verification
    const isBuyerVerified = paymentLink.buyerPhone === buyer_phone || 
                           paymentLink.buyerName === buyer_name ||
                           (req.user._id && paymentLink.buyer_id && paymentLink.buyer_id.toString() === req.user._id.toString());

    if (!isBuyerVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Order verification failed. Please ensure the order details match your information.' 
      });
    }

    // Process evidence files with enhanced metadata
    const evidenceFiles = (files || []).map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      url: `/uploads/evidence/${file.filename}`,
      name: file.originalname,
      uploaded_at: new Date(),
      size: file.size,
      mimetype: file.mimetype,
      formattedSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      formattedDate: new Date().toLocaleDateString('en-US')
    }));

    // Create new dispute with enhanced data
    const disputeData = {
      dispute_id: generateDisputeId(),
      order_id: actualOrderId,
      seller_id,
      buyer_id: req.user._id,
      buyer_name,
      buyer_phone,
      product_name,
      amount: parseFloat(amount),
      reason: otherReason || reason,
      description: description || `Dispute regarding ${product_name}`,
      buyer_evidence: evidenceFiles,
      status: 'opened',
      timeline: [
        formatTimelineEntry(
          'Dispute opened by buyer',
          buyer_name,
          'buyer',
          `Reason: ${otherReason || reason} | Description: ${description || 'No additional description'}`
        )
      ],
      // Additional fields for better tracking
      openedAt: new Date(),
      lastActivity: new Date()
    };

    const dispute = new Dispute(disputeData);
    await dispute.save();

    // Update payment link status to disputed with enhanced info
    await PaymentLink.findOneAndUpdate(
      { $or: [{ _id: actualOrderId }, { linkId: actualOrderId }] },
      { 
        status: 'disputed',
        disputeInfo: {
          disputeId: dispute._id,
          dispute_id: dispute.dispute_id,
          reason: otherReason || reason,
          submittedAt: new Date(),
          description: description
        },
        updatedAt: new Date()
      }
    );

    console.log(`✅ New dispute created: ${dispute.dispute_id} for order ${actualOrderId}`);

    // Enhanced response for frontend
    res.status(201).json({ 
      success: true, 
      message: 'Dispute submitted successfully. Our team will review your case within 24-48 hours.',
      dispute: {
        ...dispute.toObject(),
        // Frontend compatibility
        linkId: actualOrderId,
        formattedAmount: `Tsh ${parseInt(amount).toLocaleString()}`,
        formattedDate: new Date().toLocaleDateString('en-US')
      },
      nextSteps: [
        'Our support team will contact you within 24 hours',
        'Please keep your evidence ready for verification',
        'Check your email for dispute confirmation'
      ]
    });

  } catch (error) {
    console.error('❌ Error creating dispute:', error);
    
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
      message: 'Failed to create dispute. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET /api/disputes/stats/seller/:sellerId - Get dispute statistics for seller (ENHANCED)
router.get('/stats/seller/:sellerId', auth, async (req, res) => {
  try {
    const { sellerId } = req.params;

    console.log('🔄 Fetching dispute stats for seller:', sellerId);

    if (req.user._id.toString() !== sellerId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Enhanced stats aggregation with better error handling
    const stats = await Dispute.aggregate([
      { $match: { seller_id: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const total = await Dispute.countDocuments({ seller_id: sellerId });
    const totalAmount = await Dispute.aggregate([
      { $match: { seller_id: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Enhanced stat calculation for frontend
    const opened = stats.find(s => s._id === 'opened')?.count || 0;
    const in_review = stats.find(s => s._id === 'in_review')?.count || 0;
    const resolved = stats.find(s => s._id === 'resolved')?.count || 0;
    const disputed = stats.find(s => s._id === 'disputed')?.count || 0;
    
    const totalDisputedAmount = totalAmount[0]?.total || 0;

    console.log(`✅ Stats fetched for seller ${sellerId}:`, { total, opened, in_review, resolved });

    res.json({
      success: true,
      stats: {
        total,
        opened: opened + disputed, // Combine opened and disputed for frontend
        in_review,
        resolved,
        totalDisputedAmount,
        averageDisputeAmount: total > 0 ? totalDisputedAmount / total : 0
      },
      // Additional metadata for frontend
      lastUpdated: new Date(),
      timeRange: 'all-time'
    });

  } catch (error) {
    console.error('❌ Error fetching dispute stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dispute statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ NEW: GET /api/disputes/search - Enhanced search for disputes
router.get('/search/global', auth, async (req, res) => {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log('🔄 Global dispute search:', q);

    // Build search query
    let query = {
      $or: [
        { dispute_id: { $regex: q.trim(), $options: 'i' } },
        { order_id: { $regex: q.trim(), $options: 'i' } },
        { buyer_name: { $regex: q.trim(), $options: 'i' } },
        { product_name: { $regex: q.trim(), $options: 'i' } },
        { reason: { $regex: q.trim(), $options: 'i' } },
        { buyer_phone: { $regex: q.trim(), $options: 'i' } }
      ]
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Role-based access control
    if (req.user.role === 'seller') {
      query.seller_id = req.user._id;
    } else if (req.user.role === 'buyer') {
      query.buyer_id = req.user._id;
    }
    // Admin can see all disputes

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Dispute.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Enhanced response for frontend
    res.json({
      success: true,
      disputes: disputes.map(dispute => ({
        ...dispute,
        // Frontend compatibility
        formattedAmount: `Tsh ${parseInt(dispute.amount).toLocaleString()}`,
        formattedDate: new Date(dispute.createdAt).toLocaleDateString('en-US')
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalDisputes: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      search: {
        query: q,
        status: status || 'all',
        results: disputes.length,
        totalResults: total
      }
    });

  } catch (error) {
    console.error('❌ Error in global search:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ NEW: GET /api/disputes/filters/options - Get filter options for frontend
router.get('/filters/options', auth, async (req, res) => {
  try {
    const { sellerId } = req.query;
    
    let query = {};
    if (req.user.role === 'seller' && sellerId) {
      query.seller_id = sellerId;
    }

    // Get unique statuses
    const statuses = await Dispute.distinct('status', query);
    
    // Get date range for filter
    const dateRange = await Dispute.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          minDate: { $min: '$createdAt' },
          maxDate: { $max: '$createdAt' }
        }
      }
    ]);

    res.json({
      success: true,
      filters: {
        status: statuses,
        dateRange: dateRange[0] || { minDate: new Date(), maxDate: new Date() },
        // Additional filter options
        reasons: [
          'Product not as described',
          'Product damaged or defective',
          'Wrong product received',
          'Product never delivered',
          'Seller not responsive',
          'Quality issues',
          'Others'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options'
    });
  }
});

export default router;