import express from 'express';
import PaymentLink from '../models/PaymentLink.js';
import Dispute from '../models/Dispute.js'; // ✅ Added Dispute model import
import { authenticateToken } from '../middleware/auth.js';
import { upload, handleUploadErrors } from '../middleware/upload.js';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * @route   POST /api/payment-links/create
 * @desc    Create a new payment link
 */
router.post('/create', async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      productImages,
      buyerName,
      buyerPhone,
      buyerEmail,
      sellerId,
      sellerName,
      sellerEmail,
      sellerPhone,
      sellerLocation,
      sellerBusinessType,
      sellerBusinessName
    } = req.body;

    // ✅ Validate required fields
    if (!productName || !productDescription || !productPrice || !buyerName || !buyerPhone || !sellerId || !sellerName) {
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be filled',
        required: [
          'productName', 'productDescription', 'productPrice',
          'buyerName', 'buyerPhone', 'sellerId', 'sellerName'
        ]
      });
    }

    // ✅ Validate price
    const price = parseFloat(productPrice);
    if (isNaN(price) || price < 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Product price must be a valid number and >= 100' 
      });
    }

    // ✅ Generate unique link ID
    const linkId = 'pl_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

    // ✅ Handle product images
    const imagesArray = Array.isArray(productImages) 
      ? productImages.map(img => typeof img === 'object' ? img.data : img)
      : [];

    // ✅ Create payment link WITH COMPLETE SELLER INFO
    const paymentLink = new PaymentLink({
      linkId,
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      productPrice: price,
      productImages: imagesArray,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: (buyerEmail || '').trim(),
      sellerId: sellerId.toString(),
      sellerName: sellerName.trim(),
      sellerEmail: (sellerEmail || '').trim(),
      sellerPhone: (sellerPhone || '').trim(),
      sellerLocation: (sellerLocation || '').trim(),
      sellerBusinessType: (sellerBusinessType || '').trim(),
      sellerBusinessName: (sellerBusinessName || 'Individual Seller').trim(),
      status: 'waiting_payment'
    });

    await paymentLink.save();

    // ✅ Generate frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentUrl = `${frontendUrl}/buyer/pay/${linkId}`;

    res.status(201).json({
      success: true,
      message: 'Payment link created successfully',
      linkId,
      paymentLink: paymentUrl
    });

  } catch (error) {
    console.error('❌ Create payment link error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating payment link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/payment-links/:linkId/status
 * @desc    Update payment link status (paid status)
 */
router.put('/:linkId/status', async (req, res) => {
  try {
    const { linkId } = req.params;
    const {
      paymentStatus,
      paymentMethod,
      transactionId,
      paymentId,
      amount,
      buyerName,
      buyerPhone,
      buyerEmail,
      productName
    } = req.body;

    console.log('🔄 Updating payment status for:', linkId, {
      paymentStatus,
      paymentMethod,
      transactionId,
      paymentId
    });

    // ✅ Validate required fields
    if (!paymentStatus || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment status and payment method are required'
      });
    }

    // ✅ Find and update the payment link
    const updatedPaymentLink = await PaymentLink.findOneAndUpdate(
      { linkId: linkId },
      {
        status: paymentStatus,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paymentId: paymentId,
        productPrice: amount,
        buyerName: buyerName,
        buyerPhone: buyerPhone,
        buyerEmail: buyerEmail,
        productName: productName,
        paidAt: paymentStatus === 'paid' ? new Date() : null
      },
      { new: true, runValidators: true }
    );

    if (!updatedPaymentLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }

    console.log('✅ Payment status updated successfully:', {
      linkId,
      paymentStatus,
      paymentMethod
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      paymentLink: updatedPaymentLink
    });

  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payment-links/test
 * @desc    Test endpoint
 */
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Payment links route is working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/payment-links/:linkId
 * @desc    Get a single payment link by linkId
 */
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    
    console.log('🔍 Fetching payment link:', linkId);

    const paymentLink = await PaymentLink.findOne({ linkId });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({ 
        success: false, 
        message: 'Payment link not found' 
      });
    }

    console.log('✅ Payment link found:', paymentLink.linkId);

    res.json({
      success: true,
      paymentLink: {
        id: paymentLink._id,
        linkId: paymentLink.linkId,
        productName: paymentLink.productName,
        productDescription: paymentLink.productDescription,
        productPrice: paymentLink.productPrice,
        productImages: paymentLink.productImages,
        buyerName: paymentLink.buyerName,
        buyerPhone: paymentLink.buyerPhone,
        buyerEmail: paymentLink.buyerEmail,
        shippingAddress: paymentLink.shippingAddress,
        status: paymentLink.status,
        paymentMethod: paymentLink.paymentMethod,
        paymentId: paymentLink.paymentId,
        transactionId: paymentLink.transactionId,
        paidAt: paymentLink.paidAt,
        expiresAt: paymentLink.expiresAt,
        createdAt: paymentLink.createdAt,
        updatedAt: paymentLink.updatedAt,
        deliveryInfo: paymentLink.deliveryInfo || null,
        seller: {
          id: paymentLink.sellerId,
          name: paymentLink.sellerName,
          email: paymentLink.sellerEmail,
          phone: paymentLink.sellerPhone,
          location: paymentLink.sellerLocation || '',
          businessType: paymentLink.sellerBusinessType || '',
          businessName: paymentLink.sellerBusinessName || 'Individual Seller'
        },
        metadata: paymentLink.metadata || {}
      }
    });

  } catch (error) {
    console.error('❌ Get payment link error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching payment link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/payment-links/:linkId/receipt-confirmation
 * @desc    Confirm receipt of goods
 */
router.post('/:linkId/receipt-confirmation', async (req, res) => {
  try {
    const { linkId } = req.params;
    const {
      confirmedAt,
      buyerName,
      buyerPhone,
      buyerEmail,
      productName,
      amount,
      sellerId,
      sellerName
    } = req.body;

    console.log('📦 Receipt confirmation request:', { linkId, ...req.body });

    // Update payment link status to 'completed'
    const updatedLink = await PaymentLink.findOneAndUpdate(
      { linkId: linkId },
      { 
        status: 'completed',
        completedAt: confirmedAt
      },
      { new: true }
    );

    if (!updatedLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt confirmed successfully',
      paymentLink: updatedLink
    });

  } catch (error) {
    console.error('Error confirming receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// ✅ FIXED: BUYER CONFIRMATION ROUTES (No authentication required)
// ============================================================================

/**
 * @route   PUT /api/payment-links/:linkId/complete
 * @desc    Mark order as completed when buyer confirms receipt (PUBLIC)
 */
router.put('/:linkId/complete', async (req, res) => {
  try {
    const { linkId } = req.params;
    const {
      status = 'completed',
      completedAt,
      paymentReleased = true,
      paymentReleasedAt,
      releasedAutomatically = false
    } = req.body;

    console.log('✅ Buyer confirming receipt for order:', linkId, {
      status,
      paymentReleased,
      releasedAutomatically
    });

    // Find payment link
    const paymentLink = await PaymentLink.findOne({ linkId: linkId });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }
    
    // Only allow completion for delivered status
    if (paymentLink.status !== 'delivered') {
      console.log('❌ Cannot mark as completed - current status:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: 'Can only confirm receipt for orders in delivered status'
      });
    }
    
    // Update status and payment release info
    paymentLink.status = status;
    paymentLink.completedAt = completedAt ? new Date(completedAt) : new Date();
    paymentLink.paymentReleased = paymentReleased;
    paymentLink.paymentReleasedAt = paymentReleasedAt ? new Date(paymentReleasedAt) : new Date();
    paymentLink.releasedAutomatically = releasedAutomatically;
    
    await paymentLink.save();
    
    console.log('✅ Order marked as completed successfully:', linkId, {
      status: paymentLink.status,
      paymentReleased: paymentLink.paymentReleased,
      releasedAutomatically: paymentLink.releasedAutomatically
    });
    
    res.json({
      success: true,
      message: 'Order completed successfully. Payment has been released to the seller.',
      paymentLink: {
        linkId: paymentLink.linkId,
        status: paymentLink.status,
        completedAt: paymentLink.completedAt,
        paymentReleased: paymentLink.paymentReleased,
        paymentReleasedAt: paymentLink.paymentReleasedAt,
        releasedAutomatically: paymentLink.releasedAutomatically
      }
    });
  } catch (error) {
    console.error('❌ Error completing order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/payment-links/:linkId/release-payment
 * @desc    Automatically release payment after ETA + 24 hours (PUBLIC)
 */
router.put('/:linkId/release-payment', async (req, res) => {
  try {
    const { linkId } = req.params;
    const {
      releasedAt,
      releasedAutomatically = true
    } = req.body;

    console.log('🕒 Auto-releasing payment for order:', linkId, {
      releasedAutomatically
    });

    // Find payment link
    const paymentLink = await PaymentLink.findOne({ linkId: linkId });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }
    
    // Only allow auto-release for delivered status
    if (paymentLink.status !== 'delivered') {
      console.log('❌ Cannot auto-release payment - current status:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: 'Can only auto-release payment for orders in delivered status'
      });
    }
    
    // Check if payment is already released
    if (paymentLink.paymentReleased) {
      console.log('ℹ️ Payment already released for order:', linkId);
      return res.json({
        success: true,
        message: 'Payment was already released',
        paymentLink: {
          linkId: paymentLink.linkId,
          status: paymentLink.status,
          paymentReleased: paymentLink.paymentReleased,
          paymentReleasedAt: paymentLink.paymentReleasedAt
        }
      });
    }
    
    // Update payment release info
    paymentLink.status = 'completed';
    paymentLink.paymentReleased = true;
    paymentLink.paymentReleasedAt = releasedAt ? new Date(releasedAt) : new Date();
    paymentLink.releasedAutomatically = releasedAutomatically;
    paymentLink.completedAt = new Date();
    
    await paymentLink.save();
    
    console.log('✅ Payment auto-released successfully:', linkId, {
      status: paymentLink.status,
      paymentReleased: paymentLink.paymentReleased,
      releasedAutomatically: paymentLink.releasedAutomatically
    });
    
    res.json({
      success: true,
      message: 'Payment automatically released to seller successfully',
      paymentLink: {
        linkId: paymentLink.linkId,
        status: paymentLink.status,
        paymentReleased: paymentLink.paymentReleased,
        paymentReleasedAt: paymentLink.paymentReleasedAt,
        releasedAutomatically: paymentLink.releasedAutomatically,
        completedAt: paymentLink.completedAt
      }
    });
  } catch (error) {
    console.error('❌ Error auto-releasing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-release payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// PROTECTED ROUTES (Authentication required - Seller only)
// ============================================================================

/**
 * @route   GET /api/payment-links/seller/:sellerId
 * @desc    Get all payment links for a seller (with authentication)
 */
router.get('/seller/:sellerId', authenticateToken, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const authenticatedSellerId = req.user._id.toString();

    console.log('🔄 Fetching orders for seller:', sellerId, 'Authenticated:', authenticatedSellerId);

    // Verify the authenticated user is accessing their own orders
    if (sellerId !== authenticatedSellerId) {
      console.log('❌ Access denied - seller ID mismatch');
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    const paymentLinks = await PaymentLink.find({ sellerId })
      .sort({ createdAt: -1 })
      .select('-productImages');

    console.log('✅ Found', paymentLinks.length, 'orders for seller:', sellerId);

    res.json({
      success: true,
      paymentLinks,
      total: paymentLinks.length
    });

  } catch (error) {
    console.error('❌ Get payment links error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching payment links',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/payment-links/:linkId
 * @desc    Delete payment link (only for waiting_payment OR active status)
 */
router.delete('/:linkId', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const sellerId = req.user._id.toString();
    
    console.log('🔄 Attempting to delete payment link:', linkId, 'by seller:', sellerId);

    const paymentLink = await PaymentLink.findOne({ 
      linkId: linkId,
      sellerId: sellerId 
    });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }
    
    // ✅ FIXED: Allow deletion for both waiting_payment AND active status
    if (paymentLink.status !== 'waiting_payment' && paymentLink.status !== 'active') {
      console.log('❌ Cannot delete - status is:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: 'Can only delete orders with waiting payment status'
      });
    }
    
    await PaymentLink.deleteOne({ linkId: linkId });
    
    console.log('✅ Payment link deleted successfully:', linkId);
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting payment link:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/payment-links/:linkId/deliver
 * @desc    Mark order as delivered (for in_escrow or paid status)
 */
router.put('/:linkId/deliver', authenticateToken, upload.array('deliveryReceipt', 5), handleUploadErrors, async (req, res) => {
  try {
    const { linkId } = req.params;
    const sellerId = req.user._id.toString();
    
    console.log('🔄 Marking order as delivered:', linkId, 'by seller:', sellerId);

    // ✅ FIXED: Better handling for both FormData and JSON
    let deliveryData;
    if (req.body.data) {
      // If data comes from FormData
      deliveryData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      console.log('📤 Processing FormData with data field');
    } else {
      // If data comes directly from JSON
      deliveryData = req.body;
      console.log('📤 Processing JSON data directly');
    }

    const { destination, estimatedArrival, deliveryCompany, trackingNumber, notes } = deliveryData;

    console.log('📦 Delivery data received:', {
      destination,
      estimatedArrival,
      deliveryCompany,
      trackingNumber,
      notes,
      hasFiles: req.files ? req.files.length : 0
    });

    // ✅ Find payment link
    const paymentLink = await PaymentLink.findOne({ 
      linkId: linkId,
      sellerId: sellerId 
    });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }
    
    // ✅ Check if order is in a state that can be marked as delivered
    const allowedStatuses = ['in_escrow', 'paid', 'active'];
    if (!allowedStatuses.includes(paymentLink.status)) {
      console.log('❌ Cannot mark as delivered - current status:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: `Can only mark orders as delivered when they are in ${allowedStatuses.join(' or ')} status. Current status: ${paymentLink.status}`
      });
    }
    
    // ✅ Validate required delivery fields
    if (!destination?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Destination address is required'
      });
    }

    if (!estimatedArrival) {
      return res.status(400).json({
        success: false,
        message: 'Estimated arrival date is required'
      });
    }

    if (!deliveryCompany?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Delivery company name is required'
      });
    }

    // ✅ Update payment link status and delivery info
    paymentLink.status = 'delivered';
    paymentLink.deliveryInfo = {
      destination: destination.trim(),
      estimatedArrival: new Date(estimatedArrival),
      deliveryCompany: deliveryCompany.trim(),
      trackingNumber: trackingNumber?.trim() || '',
      notes: notes?.trim() || '',
      deliveredAt: new Date()
    };
    
    // ✅ Handle multiple file uploads properly
    if (req.files && req.files.length > 0) {
      paymentLink.deliveryInfo.receipts = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      }));
      console.log('📄 Receipt files added:', req.files.length);
    }
    
    await paymentLink.save();
    
    console.log('✅ Order marked as delivered successfully:', linkId);
    
    // ✅ Return the complete updated payment link
    const updatedPaymentLink = await PaymentLink.findOne({ linkId: linkId });
    
    res.json({
      success: true,
      message: 'Order marked as delivered successfully',
      paymentLink: {
        linkId: updatedPaymentLink.linkId,
        status: updatedPaymentLink.status,
        deliveryInfo: updatedPaymentLink.deliveryInfo,
        productName: updatedPaymentLink.productName,
        productPrice: updatedPaymentLink.productPrice,
        buyerName: updatedPaymentLink.buyerName,
        buyerPhone: updatedPaymentLink.buyerPhone,
        shippingAddress: updatedPaymentLink.shippingAddress,
        sellerName: updatedPaymentLink.sellerName
      }
    });
    
  } catch (error) {
    console.error('❌ Error marking order as delivered:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payment-links/seller/:sellerId/orders
 * @desc    Get all orders for a seller (with authentication)
 */
router.get('/seller/:sellerId/orders', authenticateToken, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const authenticatedSellerId = req.user._id.toString();
    
    console.log('🔄 Fetching orders for seller:', sellerId, 'Authenticated:', authenticatedSellerId);

    // Verify the authenticated user is accessing their own orders
    if (sellerId !== authenticatedSellerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }
    
    const paymentLinks = await PaymentLink.find({ 
      sellerId: sellerId 
    }).sort({ createdAt: -1 });
    
    console.log('✅ Found', paymentLinks.length, 'orders for seller:', sellerId);
    
    // Transform the data to match frontend expectations
    const orders = paymentLinks.map(link => ({
      id: link.linkId,
      linkId: link.linkId,
      productName: link.productName,
      buyerName: link.buyerName,
      productPrice: link.productPrice,
      status: link.status,
      originalStatus: link.status,
      createdAt: link.createdAt,
      buyerPhone: link.buyerPhone,
      buyerEmail: link.buyerEmail,
      shippingAddress: link.shippingAddress,
      productImages: link.productImages,
      sellerName: link.sellerName,
      expiresAt: link.expiresAt,
      paymentMethod: link.paymentMethod,
      transactionId: link.transactionId,
      paymentId: link.paymentId,
      paidAt: link.paidAt,
      deliveryInfo: link.deliveryInfo || null,
      ...link._doc
    }));
    
    res.json({
      success: true,
      orders: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/payment-links/:linkId/seller-complete
 * @desc    Mark order as completed by seller (for delivered status) - PROTECTED
 */
router.put('/:linkId/seller-complete', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const sellerId = req.user._id.toString();
    
    console.log('🔄 Seller marking order as completed:', linkId, 'by seller:', sellerId);

    const paymentLink = await PaymentLink.findOne({ 
      linkId: linkId,
      sellerId: sellerId 
    });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }
    
    // Only allow completion for delivered status
    if (paymentLink.status !== 'delivered') {
      console.log('❌ Cannot mark as completed - current status:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: 'Can only mark orders as completed when they are in delivered status'
      });
    }
    
    // Update status to completed
    paymentLink.status = 'completed';
    paymentLink.completedAt = new Date();
    paymentLink.paymentReleased = true;
    paymentLink.paymentReleasedAt = new Date();
    paymentLink.releasedAutomatically = false;
    
    await paymentLink.save();
    
    console.log('✅ Order marked as completed by seller successfully:', linkId);
    
    res.json({
      success: true,
      message: 'Order marked as completed successfully',
      paymentLink: paymentLink
    });
  } catch (error) {
    console.error('❌ Error marking order as completed:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// ✅ NEW: DISPUTE INTEGRATION ROUTES
// ============================================================================

/**
 * @route   PUT /api/payment-links/:linkId/dispute
 * @desc    Update order status to disputed and create dispute record
 */
router.put('/:linkId/dispute', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const sellerId = req.user._id.toString();
    const {
      reason = 'Order issue - needs review',
      description = 'Dispute created from order management'
    } = req.body;

    console.log('🚨 Creating dispute for order:', linkId, 'by seller:', sellerId);

    // Find payment link
    const paymentLink = await PaymentLink.findOne({ 
      linkId: linkId,
      sellerId: sellerId 
    });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }

    // Check if order can be disputed (delivered or completed status)
    const disputableStatuses = ['delivered', 'completed'];
    if (!disputableStatuses.includes(paymentLink.status)) {
      console.log('❌ Cannot create dispute - current status:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: `Can only create disputes for orders in delivered or completed status. Current status: ${paymentLink.status}`
      });
    }

    // Update payment link status to disputed
    paymentLink.status = 'disputed';
    paymentLink.updatedAt = new Date();
    await paymentLink.save();

    // Create dispute record
    const dispute = new Dispute({
      order_id: paymentLink.linkId,
      seller_id: sellerId,
      buyer_id: paymentLink.buyerEmail, // Using email as buyer ID for now
      buyer_name: paymentLink.buyerName,
      buyer_phone: paymentLink.buyerPhone,
      product_name: paymentLink.productName,
      amount: paymentLink.productPrice,
      reason: reason,
      description: description || `Dispute for order ${paymentLink.linkId}: ${paymentLink.productName}`,
      status: 'opened',
      timeline: [{
        action: 'Dispute created from order management',
        date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        user: req.user.name || 'Seller',
        type: 'seller'
      }]
    });

    await dispute.save();

    console.log('✅ Dispute created successfully:', dispute.dispute_id);

    res.json({
      success: true,
      message: 'Dispute created successfully',
      dispute: {
        dispute_id: dispute.dispute_id,
        order_id: dispute.order_id,
        status: dispute.status,
        reason: dispute.reason
      },
      paymentLink: {
        linkId: paymentLink.linkId,
        status: paymentLink.status,
        updatedAt: paymentLink.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error creating dispute:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payment-links/:linkId/dispute-status
 * @desc    Check if an order has an existing dispute
 */
router.get('/:linkId/dispute-status', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const sellerId = req.user._id.toString();

    console.log('🔍 Checking dispute status for order:', linkId);

    // Check if dispute exists for this order
    const existingDispute = await Dispute.findOne({ 
      order_id: linkId,
      seller_id: sellerId 
    });

    const hasDispute = !!existingDispute;

    console.log('✅ Dispute status checked:', { linkId, hasDispute });

    res.json({
      success: true,
      hasDispute: hasDispute,
      dispute: hasDispute ? {
        dispute_id: existingDispute.dispute_id,
        status: existingDispute.status,
        reason: existingDispute.reason,
        created_at: existingDispute.created_at
      } : null
    });

  } catch (error) {
    console.error('❌ Error checking dispute status:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/payment-links
 * @desc    Get all payment links (for admin purposes)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sellerId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (sellerId) query.sellerId = sellerId;

    const paymentLinks = await PaymentLink.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-productImages');

    const total = await PaymentLink.countDocuments(query);

    res.json({
      success: true,
      paymentLinks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('❌ Error fetching payment links:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/payment-links/:linkId/cancel
 * @desc    Cancel a payment link
 */
router.put('/:linkId/cancel', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;
    const sellerId = req.user._id.toString();
    
    console.log('🔄 Canceling payment link:', linkId, 'by seller:', sellerId);

    const paymentLink = await PaymentLink.findOne({ 
      linkId: linkId,
      sellerId: sellerId 
    });
    
    if (!paymentLink) {
      console.log('❌ Payment link not found:', linkId);
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }
    
    // ✅ FIXED: Allow cancellation for both waiting_payment AND active status
    const cancellableStatuses = ['waiting_payment', 'active'];
    if (!cancellableStatuses.includes(paymentLink.status)) {
      console.log('❌ Cannot cancel - current status:', paymentLink.status);
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${paymentLink.status} status`
      });
    }
    
    paymentLink.status = 'canceled';
    paymentLink.canceledAt = new Date();
    await paymentLink.save();
    
    console.log('✅ Payment link canceled successfully:', linkId);
    
    res.json({
      success: true,
      message: 'Order canceled successfully',
      paymentLink: paymentLink
    });
  } catch (error) {
    console.error('❌ Error canceling payment link:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// TEST AUTHENTICATION ROUTE
// ============================================================================

/**
 * @route   GET /api/payment-links/test-auth
 * @desc    Test authentication endpoint
 */
router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication is working!',
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    },
    timestamp: new Date().toISOString()
  });
});

export default router;