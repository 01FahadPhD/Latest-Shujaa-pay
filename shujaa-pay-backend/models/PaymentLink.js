import mongoose from 'mongoose';

const paymentLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productDescription: {
    type: String,
    required: true,
    trim: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productImages: {
    type: [String],
    default: []
  },
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  buyerPhone: {
    type: String,
    required: true,
    trim: true
  },
  buyerEmail: {
    type: String,
    trim: true,
    default: ''
  },
  shippingAddress: {
    type: String,
    trim: true,
    default: 'Address not provided'
  },
  
  // ✅ UPDATED: Consistent status names matching frontend
  status: {
    type: String,
    enum: ['waiting_payment', 'in_escrow', 'paid', 'delivered', 'completed', 'canceled'],
    default: 'waiting_payment'
  },
  
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  sellerName: {
    type: String,
    required: true,
    trim: true
  },
  sellerEmail: {
    type: String,
    trim: true,
    default: ''
  },
  sellerPhone: {
    type: String,
    trim: true,
    default: ''
  },
  
  // ✅ EXISTING FIELDS - KEEP AS IS
  sellerLocation: {
    type: String,
    trim: true,
    default: 'Location not specified'
  },
  sellerBusinessType: {
    type: String,
    trim: true,
    default: 'Not specified'
  },
  sellerBusinessName: {
    type: String,
    trim: true,
    default: 'Individual Seller'
  },
  
  // ✅ PAYMENT PROCESSING FIELDS
  paymentMethod: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentId: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date
  },
  
  // ✅ EXPIRATION FIELD
  expiresAt: {
    type: Date,
    default: function() {
      // Default to 24 hours from creation
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  
  // ✅ DELIVERY INFORMATION - ENHANCED STRUCTURE
  deliveryInfo: {
    destination: {
      type: String,
      trim: true,
      required: function() {
        return this.status === 'delivered' || this.status === 'completed';
      }
    },
    estimatedArrival: {
      type: Date,
      required: function() {
        return this.status === 'delivered' || this.status === 'completed';
      }
    },
    deliveryCompany: {
      type: String,
      trim: true,
      required: function() {
        return this.status === 'delivered' || this.status === 'completed';
      }
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    receipt: {
      filename: {
        type: String,
        default: ''
      },
      originalName: {
        type: String,
        default: ''
      },
      path: {
        type: String,
        default: ''
      },
      uploadedAt: {
        type: Date,
        default: null
      }
    }
  },
  
  // ✅ METADATA FOR ADDITIONAL INFORMATION
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
  
}, {
  timestamps: true
});

// ✅ ADD INDEXES FOR BETTER PERFORMANCE
paymentLinkSchema.index({ sellerId: 1, createdAt: -1 });
paymentLinkSchema.index({ status: 1 });
paymentLinkSchema.index({ expiresAt: 1 });
paymentLinkSchema.index({ buyerPhone: 1 });
paymentLinkSchema.index({ createdAt: -1 });

// ✅ VIRTUAL FOR CHECKING IF LINK IS EXPIRED
paymentLinkSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// ✅ VIRTUAL FOR ORDER AGE IN DAYS
paymentLinkSchema.virtual('ageInDays').get(function() {
  const created = new Date(this.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ✅ METHOD TO UPDATE STATUS
paymentLinkSchema.methods.updateStatus = function(newStatus, options = {}) {
  this.status = newStatus;
  
  // Update timestamps based on status
  if (newStatus === 'paid') {
    this.paidAt = new Date();
  }
  
  if (newStatus === 'delivered') {
    this.deliveryInfo.deliveredAt = new Date();
    
    // Auto-complete after 3 days if not already completed
    setTimeout(async () => {
      try {
        const updatedOrder = await this.model('PaymentLink').findById(this._id);
        if (updatedOrder && updatedOrder.status === 'delivered') {
          updatedOrder.status = 'completed';
          await updatedOrder.save();
        }
      } catch (error) {
        console.error('Error auto-completing order:', error);
      }
    }, 3 * 24 * 60 * 60 * 1000); // 3 days
  }
  
  if (newStatus === 'completed') {
    this.deliveryInfo.deliveredAt = this.deliveryInfo.deliveredAt || new Date();
  }
  
  return this.save(options);
};

// ✅ METHOD TO MARK AS DELIVERED WITH DELIVERY INFO
paymentLinkSchema.methods.markAsDelivered = function(deliveryData, receiptInfo = null) {
  this.status = 'delivered';
  this.deliveryInfo = {
    ...this.deliveryInfo,
    destination: deliveryData.destination,
    estimatedArrival: deliveryData.estimatedArrival,
    deliveryCompany: deliveryData.deliveryCompany,
    trackingNumber: deliveryData.trackingNumber || '',
    notes: deliveryData.notes || '',
    deliveredAt: new Date()
  };
  
  // Add receipt information if provided
  if (receiptInfo) {
    this.deliveryInfo.receipt = {
      filename: receiptInfo.filename,
      originalName: receiptInfo.originalName,
      path: receiptInfo.path,
      uploadedAt: new Date()
    };
  }
  
  return this.save();
};

// ✅ METHOD TO CANCEL ORDER
paymentLinkSchema.methods.cancelOrder = function(reason = '') {
  this.status = 'canceled';
  if (reason) {
    this.metadata.cancellationReason = reason;
    this.metadata.cancelledAt = new Date();
  }
  return this.save();
};

// ✅ METHOD TO COMPLETE ORDER
paymentLinkSchema.methods.completeOrder = function() {
  this.status = 'completed';
  return this.save();
};

// ✅ METHOD TO CHECK IF ORDER CAN BE DELETED
paymentLinkSchema.methods.canBeDeleted = function() {
  return this.status === 'waiting_payment' && !this.isExpired;
};

// ✅ STATIC METHOD TO FIND BY SELLER
paymentLinkSchema.statics.findBySeller = function(sellerId, options = {}) {
  const query = { sellerId };
  
  // Add status filter if provided
  if (options.status) {
    query.status = options.status;
  }
  
  // Add date range filter if provided
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) query.createdAt.$lte = new Date(options.endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('sellerId', 'name email phone')
    .exec();
};

// ✅ STATIC METHOD TO FIND BY BUYER PHONE OR EMAIL
paymentLinkSchema.statics.findByBuyer = function(buyerIdentifier) {
  return this.find({
    $or: [
      { buyerPhone: buyerIdentifier },
      { buyerEmail: buyerIdentifier }
    ]
  })
  .sort({ createdAt: -1 })
  .exec();
};

// ✅ STATIC METHOD TO FIND ACTIVE LINKS (waiting_payment and not expired)
paymentLinkSchema.statics.findActive = function() {
  return this.find({ 
    status: 'waiting_payment',
    expiresAt: { $gt: new Date() }
  })
  .sort({ createdAt: -1 })
  .exec();
};

// ✅ STATIC METHOD TO FIND EXPIRED LINKS (based on expiresAt)
paymentLinkSchema.statics.findExpired = function() {
  return this.find({
    status: 'waiting_payment',
    expiresAt: { $lt: new Date() }
  })
  .sort({ createdAt: -1 })
  .exec();
};

// ✅ STATIC METHOD TO FIND ORDERS NEEDING DELIVERY
paymentLinkSchema.statics.findPendingDelivery = function() {
  return this.find({
    status: { $in: ['paid', 'in_escrow'] }
  })
  .sort({ paidAt: 1 })
  .exec();
};

// ✅ STATIC METHOD TO FIND DELIVERED ORDERS
paymentLinkSchema.statics.findDelivered = function() {
  return this.find({
    status: 'delivered'
  })
  .sort({ 'deliveryInfo.deliveredAt': -1 })
  .exec();
};

// ✅ STATIC METHOD TO GET ORDER STATISTICS
paymentLinkSchema.statics.getStats = async function(sellerId = null) {
  const matchStage = sellerId ? { sellerId: new mongoose.Types.ObjectId(sellerId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$productPrice' }
      }
    }
  ]);
  
  // Calculate additional stats
  const totalOrders = await this.countDocuments(matchStage);
  const totalSales = await this.aggregate([
    { $match: { ...matchStage, status: { $in: ['paid', 'delivered', 'completed'] } } },
    { $group: { _id: null, total: { $sum: '$productPrice' } } }
  ]);
  
  const waitingPayment = await this.aggregate([
    { $match: { ...matchStage, status: 'waiting_payment' } },
    { $group: { _id: null, total: { $sum: '$productPrice' } } }
  ]);
  
  const inEscrow = await this.aggregate([
    { $match: { ...matchStage, status: { $in: ['in_escrow', 'paid'] } } },
    { $group: { _id: null, total: { $sum: '$productPrice' } } }
  ]);
  
  return {
    byStatus: stats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, value: stat.totalValue };
      return acc;
    }, {}),
    totals: {
      orders: totalOrders,
      sales: totalSales[0]?.total || 0,
      waitingPayment: waitingPayment[0]?.total || 0,
      inEscrow: inEscrow[0]?.total || 0
    }
  };
};

// ✅ STATIC METHOD TO GET RECENT ORDERS
paymentLinkSchema.statics.getRecentOrders = function(limit = 10, sellerId = null) {
  const query = sellerId ? { sellerId } : {};
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sellerId', 'name email phone')
    .exec();
};

// ✅ STATIC METHOD TO CLEAN UP EXPIRED ORDERS
paymentLinkSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    {
      status: 'waiting_payment',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'canceled' },
      $setOnInsert: { 
        'metadata.autoCancelledAt': new Date(),
        'metadata.autoCancelledReason': 'Order expired automatically'
      }
    }
  );
  
  return result;
};

// ✅ MIDDLEWARE TO AUTO-CANCEL EXPIRED ORDERS ON SAVE
paymentLinkSchema.pre('save', function(next) {
  // If status is waiting_payment and order is expired, auto-cancel
  if (this.status === 'waiting_payment' && this.expiresAt < new Date()) {
    this.status = 'canceled';
    this.metadata.autoCancelledAt = new Date();
    this.metadata.autoCancelledReason = 'Order expired automatically';
  }
  
  // Validate delivery info when status is delivered or completed
  if ((this.status === 'delivered' || this.status === 'completed') && this.isModified('status')) {
    if (!this.deliveryInfo.destination || !this.deliveryInfo.estimatedArrival || !this.deliveryInfo.deliveryCompany) {
      return next(new Error('Delivery information (destination, estimated arrival, and delivery company) is required when marking order as delivered'));
    }
  }
  
  next();
});

// ✅ MIDDLEWARE TO UPDATE TIMESTAMPS
paymentLinkSchema.pre('save', function(next) {
  if (this.status === 'delivered' && this.isModified('status') && !this.deliveryInfo.deliveredAt) {
    this.deliveryInfo.deliveredAt = new Date();
  }
  next();
});

// ✅ INSTANCE METHOD TO GET ORDER SUMMARY
paymentLinkSchema.methods.getSummary = function() {
  return {
    id: this.linkId,
    productName: this.productName,
    buyerName: this.buyerName,
    price: this.productPrice,
    status: this.status,
    createdAt: this.createdAt,
    expiresAt: this.expiresAt,
    isExpired: this.isExpired,
    deliveryInfo: this.deliveryInfo,
    seller: {
      name: this.sellerName,
      phone: this.sellerPhone,
      email: this.sellerEmail
    }
  };
};

// ✅ STATIC METHOD TO SEARCH ORDERS
paymentLinkSchema.statics.searchOrders = function(searchTerm, sellerId = null) {
  const query = {
    $or: [
      { linkId: { $regex: searchTerm, $options: 'i' } },
      { productName: { $regex: searchTerm, $options: 'i' } },
      { buyerName: { $regex: searchTerm, $options: 'i' } },
      { buyerPhone: { $regex: searchTerm, $options: 'i' } },
      { 'deliveryInfo.trackingNumber': { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (sellerId) {
    query.sellerId = sellerId;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .exec();
};

// ✅ HOOK TO GENERATE LINK ID IF NOT PROVIDED
paymentLinkSchema.pre('save', async function(next) {
  if (!this.linkId) {
    // Generate a unique link ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.linkId = `ORD-${timestamp}-${randomStr}`.toUpperCase();
  }
  next();
});

const PaymentLink = mongoose.model('PaymentLink', paymentLinkSchema);

export default PaymentLink;