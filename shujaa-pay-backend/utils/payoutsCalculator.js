// utils/payoutsCalculator.js
const calculateSellerPayouts = async (sellerId) => {
  const orders = await PaymentLink.find({ sellerId });
  
  let available = 0;
  let inEscrow = 0;
  let refunded = 0;
  
  orders.forEach(order => {
    const amount = order.productPrice || 0;
    
    // Available = completed orders
    if (order.status === 'completed') {
      available += amount;
    }
    
    // In Escrow = paid, delivered, disputed
    if (['paid', 'delivered', 'disputed'].includes(order.status)) {
      inEscrow += amount;
    }
    
    // Refunded = refunded orders
    if (order.status === 'refunded') {
      refunded += amount;
    }
  });
  
  return { available, inEscrow, refunded };
};