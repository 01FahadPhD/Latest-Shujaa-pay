// routes/payments.js
import express from 'express';
import PaymentLink from '../models/PaymentLink.js';

const router = express.Router();

// Process payment
router.post('/process', async (req, res) => {
  try {
    const {
      linkId,
      paymentMethod,
      amount,
      buyerName,
      buyerPhone,
      buyerEmail,
      productName
    } = req.body;

    console.log('💰 Payment processing request:', {
      linkId,
      paymentMethod,
      amount,
      buyerName
    });

    // Validate required fields
    if (!linkId || !paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields'
      });
    }

    // Find the payment link
    const paymentLink = await PaymentLink.findOne({ linkId });
    
    if (!paymentLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }

    // Check if payment link is still active
    if (paymentLink.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already completed',
        paymentId: paymentLink.paymentId,
        transactionId: paymentLink.transactionId,
        amount: paymentLink.productPrice,
        productName: paymentLink.productName,
        buyerName: paymentLink.buyerName,
        status: 'paid'
      });
    }

    if (paymentLink.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This payment link is no longer active'
      });
    }

    // Simulate payment processing (replace with real gateway integration)
    const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
    const transactionId = 'txn_' + Math.random().toString(36).substr(2, 9);

    // Update payment link status to 'paid'
    paymentLink.status = 'paid';
    paymentLink.paymentMethod = paymentMethod;
    paymentLink.paidAt = new Date();
    paymentLink.paymentId = paymentId;
    paymentLink.transactionId = transactionId;

    await paymentLink.save();

    console.log('✅ Payment processed successfully:', {
      linkId,
      paymentId,
      transactionId,
      status: 'paid'
    });

    // Success response
    res.json({
      success: true,
      message: 'Payment processed successfully!',
      paymentId,
      transactionId,
      amount: paymentLink.productPrice,
      productName: paymentLink.productName,
      buyerName: paymentLink.buyerName,
      status: 'paid'
    });

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update payment status - NEW ENDPOINT
router.put('/payment-links/:linkId/status', async (req, res) => {
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

    // Validate required fields
    if (!paymentStatus || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment status and payment method are required'
      });
    }

    // Find and update the payment link
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

// Get payment details by paymentId or transactionId
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentLink = await PaymentLink.findOne({
      $or: [
        { paymentId },
        { transactionId: paymentId }
      ]
    });

    if (!paymentLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: {
        paymentId: paymentLink.paymentId,
        transactionId: paymentLink.transactionId,
        amount: paymentLink.productPrice,
        productName: paymentLink.productName,
        buyerName: paymentLink.buyerName,
        buyerPhone: paymentLink.buyerPhone,
        buyerEmail: paymentLink.buyerEmail,
        status: paymentLink.status,
        paymentMethod: paymentLink.paymentMethod,
        paidAt: paymentLink.paidAt,
        createdAt: paymentLink.createdAt
      }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details'
    });
  }
});

export default router;