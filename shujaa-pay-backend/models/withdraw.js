// models/Withdrawal.js
const withdrawalSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  withdrawalId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true, enum: ['mobile_money', 'bank_transfer'] },
  provider: String, // M-Pesa, Airtel, etc.
  phoneNumber: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: String, // From payment gateway
  adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);