import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ShoppingCart, 
  User, 
  Phone, 
  Building, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Shield,
  Loader
} from 'lucide-react';

const BuyerPaymentPage = () => {
  const router = useRouter();
  const { linkId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [currentStep, setCurrentStep] = useState('before_payment');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Simulate fetching product data based on linkId
  useEffect(() => {
    if (linkId) {
      // In real app, this would be an API call to get product details by linkId
      setTimeout(() => {
        setProductData({
          id: linkId,
          productName: 'iPhone 15 Pro',
          productDescription: 'Brand new iPhone 15 Pro with 256GB storage, space black color, factory unlocked.',
          price: 2450000,
          images: [
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'
          ],
          seller: {
            name: 'Sarah Johnson',
            businessName: 'Tech Gadgets Tanzania',
            phone: '+255 712 345 678',
            rating: '4.8',
            completedOrders: 127
          }
        });
        setLoading(false);
      }, 1000);
    }
  }, [linkId]);

  // Payment methods
  const paymentMethods = [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, description: 'Direct bank transfer' },
    { id: 'mobile_money', name: 'Mobile Money', icon: Smartphone, description: 'Pay via mobile money' }
  ];

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    return `Tsh ${amount?.toLocaleString() || '0'}`;
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  // Simulate payment process
  const handleMakePayment = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Simulate payment processing
    setShowPaymentModal(false);
    setCurrentStep('payment_success');
    
    console.log('Payment processed:', {
      linkId,
      method: selectedPaymentMethod,
      amount: productData.price,
      product: productData.productName
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Link</h1>
          <p className="text-gray-600">This payment link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-6 w-6 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Secured by Shujaa Pay Escrow</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">Your payment is protected until you receive your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Product Information */}
          <div className="space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="aspect-w-16 aspect-h-12 mb-4">
                <img
                  src={productData.images[0]}
                  alt={productData.productName}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {productData.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${productData.productName} ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {productData.productName}
              </h1>
              <p className="text-gray-600 mb-4">
                {productData.productDescription}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(productData.price)}
                </span>
              </div>
            </div>

            {/* Safety Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                How Escrow Protects You
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Payment held securely until you confirm delivery</li>
                <li>• Full refund if product doesn't arrive as described</li>
                <li>• 24/7 support for any issues</li>
                <li>• Secure payment processing</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Seller Info & Payment */}
          <div className="space-y-6">
            {/* Seller Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Seller Name</p>
                    <p className="font-medium">{productData.seller.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Business</p>
                    <p className="font-medium">{productData.seller.businessName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{productData.seller.phone}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                  <span>Rating: ⭐ {productData.seller.rating}/5</span>
                  <span>Orders: {productData.seller.completedOrders}+</span>
                </div>
              </div>
            </div>

            {/* Payment Action */}
            {currentStep === 'before_payment' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-primary-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Pay Securely - {formatCurrency(productData.price)}</span>
                </button>
                
                <div className="text-center">
                  <button className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-700 mx-auto">
                    <HelpCircle className="h-5 w-5" />
                    <span>Need help? Contact Support</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'payment_success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Payment Successful! 🎉
                </h3>
                <p className="text-green-700 mb-4">
                  Your payment of {formatCurrency(productData.price)} is secured in escrow. 
                  The seller has been notified and will prepare your order.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    You'll receive updates about your order status.
                  </p>
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    View Order Status
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Select Payment Method</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Methods */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`w-full flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-gray-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Button */}
              <button
                onClick={handleMakePayment}
                disabled={!selectedPaymentMethod}
                className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Pay {formatCurrency(productData.price)}
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secured by Shujaa Pay Escrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerPaymentPage;