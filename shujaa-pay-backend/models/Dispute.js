// models/Dispute.js
import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    enum: ['buyer', 'seller', 'admin', 'system'],
    required: true
  },
  details: {
    type: String,
    default: ''
  }
});

const evidenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'document'],
    required: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  },
  file_size: {
    type: Number,
    default: 0
  },
  mime_type: {
    type: String,
    default: ''
  }
});

const disputeSchema = new mongoose.Schema({
  // Basic dispute information
  dispute_id: {
    type: String,
    unique: true,
    sparse: true
  },
  order_id: {
    type: String,
    required: true,
    index: true
  },
  linkId: {
    type: String,
    required: true,
    index: true
  },

  // Buyer information
  buyer_id: {
    type: String,
    required: true,
    index: true
  },
  buyer_name: {
    type: String,
    required: true
  },
  buyer_phone: {
    type: String,
    required: true
  },
  buyer_email: {
    type: String,
    default: ''
  },

  // Seller information
  seller_id: {
    type: String,
    required: true,
    index: true
  },
  seller_name: {
    type: String,
    default: 'Seller'
  },
  seller_phone: {
    type: String,
    default: ''
  },
  seller_email: {
    type: String,
    default: ''
  },

  // Product information
  product_name: {
    type: String,
    required: true
  },
  product_price: {
    type: Number,
    required: true,
    min: 0
  },
  product_description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Dispute details
  reason: {
    type: String,
    required: true,
    enum: [
      'Product not as described',
      'Product damaged or defective',
      'Wrong product received',
      'Product never delivered',
      'Seller not responsive',
      'Quality issues',
      'Others'
    ]
  },
  description: {
    type: String,
    required: true
  },
  other_reason: {
    type: String,
    default: ''
  },

  // Evidence
  buyer_evidence: [evidenceSchema],
  seller_evidence: [evidenceSchema],

  // Responses and communication
  buyer_response: {
    type: String,
    default: ''
  },
  seller_response: {
    type: String,
    default: ''
  },
  admin_comment: {
    type: String,
    default: ''
  },

  // Status and resolution
  status: {
    type: String,
    enum: ['opened', 'in_review', 'resolved', 'disputed'],
    default: 'opened',
    index: true
  },
  resolution: {
    type: String,
    enum: ['refund_buyer', 'release_seller', 'partial_refund', 'other', ''],
    default: ''
  },
  resolution_details: {
    type: String,
    default: ''
  },

  // Timeline of events
  timeline: [timelineSchema],

  // Dates
  submitted_at: {
    type: Date,
    default: Date.now
  },
  responded_at: {
    type: Date
  },
  resolved_at: {
    type: Date
  },
  updated_at: {
    type: Date,
    default: Date.now
  },

  // Admin management
  assigned_admin: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Additional metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },

  // Escrow and payment information
  escrow_status: {
    type: String,
    enum: ['held', 'released', 'refunded', 'partial_refund', ''],
    default: ''
  },
  payment_released: {
    type: Boolean,
    default: false
  },
  refund_processed: {
    type: Boolean,
    default: false
  },

  // Communication flags
  buyer_notified: {
    type: Boolean,
    default: false
  },
  seller_notified: {
    type: Boolean,
    default: false
  },
  admin_assigned: {
    type: Boolean,
    default: false
  },

  // System fields
  is_active: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for dispute age in days
disputeSchema.virtual('age_in_days').get(function() {
  return Math.floor((Date.now() - this.submitted_at) / (1000 * 60 * 60 * 24));
});

// Virtual for is_urgent based on priority and age
disputeSchema.virtual('is_urgent').get(function() {
  if (this.priority === 'urgent') return true;
  if (this.priority === 'high' && this.age_in_days > 3) return true;
  if (this.age_in_days > 7) return true;
  return false;
});

// Virtual for evidence count
disputeSchema.virtual('total_evidence').get(function() {
  return (this.buyer_evidence?.length || 0) + (this.seller_evidence?.length || 0);
});

// Pre-save middleware to generate dispute_id and update timestamps
disputeSchema.pre('save', function(next) {
  // Generate dispute_id if not present
  if (!this.dispute_id) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    this.dispute_id = `DSP-${timestamp}-${random}`.toUpperCase();
  }

  // Update updated_at timestamp
  this.updated_at = new Date();

  // Update timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      user: 'system',
      user_type: 'system',
      details: `Automated status update`
    });
  }

  next();
});

// Pre-save middleware for timeline updates
disputeSchema.pre('save', function(next) {
  // Add timeline entry for new disputes
  if (this.isNew) {
    this.timeline.unshift({
      action: 'Dispute created',
      user: this.buyer_name,
      user_type: 'buyer',
      details: `Reason: ${this.reason}`
    });
  }

  // Add timeline entry for responses
  if (this.isModified('seller_response') && this.seller_response) {
    this.timeline.push({
      action: 'Seller submitted response',
      user: this.seller_name,
      user_type: 'seller',
      details: 'Response submitted for review'
    });
  }

  // Add timeline entry for evidence uploads
  if (this.isModified('buyer_evidence') && this.buyer_evidence.length > this.previous('buyer_evidence')?.length) {
    const newEvidence = this.buyer_evidence.length - (this.previous('buyer_evidence')?.length || 0);
    this.timeline.push({
      action: 'Buyer uploaded evidence',
      user: this.buyer_name,
      user_type: 'buyer',
      details: `Added ${newEvidence} file(s)`
    });
  }

  if (this.isModified('seller_evidence') && this.seller_evidence.length > this.previous('seller_evidence')?.length) {
    const newEvidence = this.seller_evidence.length - (this.previous('seller_evidence')?.length || 0);
    this.timeline.push({
      action: 'Seller uploaded evidence',
      user: this.seller_name,
      user_type: 'seller',
      details: `Added ${newEvidence} file(s)`
    });
  }

  next();
});

// Static methods
disputeSchema.statics.findBySeller = function(sellerId, status = null) {
  const query = { seller_id: sellerId, is_active: true };
  if (status) query.status = status;
  return this.find(query).sort({ created_at: -1 });
};

disputeSchema.statics.findByBuyer = function(buyerId, status = null) {
  const query = { buyer_id: buyerId, is_active: true };
  if (status) query.status = status;
  return this.find(query).sort({ created_at: -1 });
};

disputeSchema.statics.findByOrder = function(orderId) {
  return this.findOne({ order_id: orderId, is_active: true });
};

disputeSchema.statics.getStats = async function(sellerId = null, buyerId = null) {
  const matchStage = { is_active: true };
  
  if (sellerId) matchStage.seller_id = sellerId;
  if (buyerId) matchStage.buyer_id = buyerId;

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        opened: {
          $sum: { $cond: [{ $in: ['$status', ['opened', 'disputed']] }, 1, 0] }
        },
        in_review: {
          $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        urgent: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        high_priority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    opened: 0,
    in_review: 0,
    resolved: 0,
    urgent: 0,
    high_priority: 0
  };
};

// Instance methods
disputeSchema.methods.addTimelineEvent = function(action, user, user_type, details = '') {
  this.timeline.push({
    action,
    date: new Date(),
    user,
    user_type,
    details
  });
  return this.save();
};

disputeSchema.methods.uploadBuyerEvidence = function(files) {
  files.forEach(file => {
    this.buyer_evidence.push({
      name: file.originalname,
      url: file.path || file.url,
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      file_size: file.size,
      mime_type: file.mimetype
    });
  });
  
  this.addTimelineEvent(
    'Buyer uploaded evidence',
    this.buyer_name,
    'buyer',
    `Uploaded ${files.length} file(s)`
  );
  
  return this.save();
};

disputeSchema.methods.uploadSellerEvidence = function(files) {
  files.forEach(file => {
    this.seller_evidence.push({
      name: file.originalname,
      url: file.path || file.url,
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      file_size: file.size,
      mime_type: file.mimetype
    });
  });
  
  this.addTimelineEvent(
    'Seller uploaded evidence',
    this.seller_name,
    'seller',
    `Uploaded ${files.length} file(s)`
  );
  
  return this.save();
};

disputeSchema.methods.submitSellerResponse = function(response, sellerId = null) {
  this.seller_response = response;
  this.responded_at = new Date();
  this.status = 'in_review';
  
  this.addTimelineEvent(
    'Seller submitted response',
    sellerId || this.seller_id,
    'seller',
    'Response submitted for admin review'
  );
  
  return this.save();
};

disputeSchema.methods.resolveDispute = function(resolution, admin_comment, assigned_admin = 'System') {
  this.status = 'resolved';
  this.resolution = resolution;
  this.admin_comment = admin_comment;
  this.assigned_admin = assigned_admin;
  this.resolved_at = new Date();
  
  this.addTimelineEvent(
    'Dispute resolved',
    assigned_admin,
    'admin',
    `Resolution: ${resolution}. ${admin_comment}`
  );
  
  return this.save();
};

// Indexes for better query performance
disputeSchema.index({ seller_id: 1, status: 1 });
disputeSchema.index({ buyer_id: 1, status: 1 });
disputeSchema.index({ order_id: 1 });
disputeSchema.index({ dispute_id: 1 });
disputeSchema.index({ submitted_at: -1 });
disputeSchema.index({ status: 1, priority: -1 });
disputeSchema.index({ seller_id: 1, created_at: -1 });
disputeSchema.index({ buyer_id: 1, created_at: -1 });

// Compound indexes for common queries
disputeSchema.index({ seller_id: 1, status: 1, created_at: -1 });
disputeSchema.index({ buyer_id: 1, status: 1, created_at: -1 });
disputeSchema.index({ status: 1, priority: 1, created_at: -1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;