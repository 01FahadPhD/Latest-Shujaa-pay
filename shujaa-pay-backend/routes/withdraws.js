// routes/withdrawals.js
router.post('/withdrawals', auth, async (req, res) => {
  try {
    const { sellerId, amount, method, provider, phoneNumber } = req.body;
    
    // Validate available balance
    const availableBalance = await calculateAvailableBalance(sellerId);
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal'
      });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      sellerId,
      amount,
      method,
      provider,
      phoneNumber,
      status: 'pending',
      withdrawalId: `WTH-${Date.now()}`
    });

    await withdrawal.save();
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error processing withdrawal'
    });
  }
});

// Get seller's withdrawal history
router.get('/withdrawals/seller/:sellerId', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ sellerId: req.params.sellerId })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});