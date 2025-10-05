import React, { useState, useEffect, useRef } from 'react';
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
  Loader,
  Image as ImageIcon,
  Mail,
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  Home,
  X,
  Briefcase,
  Navigation,
  Truck,
  Package,
  Download,
  AlertTriangle,
  ThumbsUp,
  Flag,
  FileText,
  Send,
  RotateCcw
} from 'lucide-react';

const BuyerPaymentPage = () => {
  const router = useRouter();
  const { linkId } = router.query;

  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('before_payment');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // ✅ UPDATED STATES FOR OTP AND DISPUTE
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpAction, setOtpAction] = useState(''); // 'confirm_receipt' or 'submit_dispute'
  const [otpLoading, setOtpLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({
    reason: '',
    description: '',
    evidence: [], // ✅ CHANGED: Now an array for multiple images
    otherReason: ''
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  const [showContactSupport, setShowContactSupport] = useState(false); // ✅ NEW: For contact support popup

  const lastFetchRef = useRef(null);

  // ✅ UPDATED: Dispute reasons
  const disputeReasons = [
    'Product not as described',
    'Product damaged or defective',
    'Wrong product received',
    'Product never delivered',
    'Seller not responsive',
    'Quality issues',
    'Others'
  ];

  // Payment methods
  const paymentMethods = [
    { 
      id: 'mobile_money', 
      name: 'Mobile Money', 
      icon: Smartphone, 
      description: 'Pay via M-Pesa, Tigo Pesa, Airtel Money',
      supportedNetworks: ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halotel Pesa']
    },
    { 
      id: 'bank_transfer', 
      name: 'Bank Transfer', 
      icon: Building, 
      description: 'Direct bank transfer',
      supportedBanks: ['CRDB', 'NMB', 'Stanbic', 'Standard Chartered']
    }
  ];

  // ✅ UPDATED: Show notification function
  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // ✅ UPDATED: Send OTP function
  const sendOTP = async (action) => {
    try {
      // For testing, we'll simulate OTP sending
      showNotificationMessage(`OTP sent to your phone. Use 111111 for testing.`, 'success');
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      showNotificationMessage('Failed to send OTP. Please try again.', 'error');
      return false;
    }
  };

  // ✅ UPDATED: Verify OTP function
  const verifyOTP = async () => {
    // For testing, accept 111111 as valid OTP
    if (otp === '111111') {
      return true;
    } else {
      showNotificationMessage('Invalid OTP. Please enter 111111 for testing.', 'error');
      return false;
    }
  };

  // ✅ UPDATED: Handle OTP submission
  const handleOTPSubmit = async () => {
    if (!otp.trim()) {
      showNotificationMessage('Please enter OTP', 'error');
      return;
    }

    setOtpLoading(true);
    const isValid = await verifyOTP();

    if (isValid) {
      if (otpAction === 'confirm_receipt') {
        await confirmReceiptFinal();
      } else if (otpAction === 'submit_dispute') {
        await submitDisputeFinal();
      }
    }
    
    setOtpLoading(false);
  };

  // ✅ UPDATED: Final confirm receipt after OTP
  const confirmReceiptFinal = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payment-links/${linkId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentStep('completed');
          setProductData(prev => ({
            ...prev,
            status: 'completed'
          }));
          setShowOTPModal(false);
          showNotificationMessage('Thank you for confirming receipt! Payment has been released to the seller.', 'success');
        }
      } else {
        throw new Error('Failed to confirm receipt');
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      showNotificationMessage('Failed to confirm receipt. Please try again.', 'error');
    }
  };

  // ✅ UPDATED: Final submit dispute after OTP
  const submitDisputeFinal = async () => {
    try {
      const formData = new FormData();
      formData.append('reason', disputeData.reason === 'Others' ? disputeData.otherReason : disputeData.reason);
      formData.append('description', disputeData.description);
      formData.append('submittedAt', new Date().toISOString());
      formData.append('buyerName', productData.buyerName);
      formData.append('buyerPhone', productData.buyerPhone);
      formData.append('productName', productData.productName);
      formData.append('amount', productData.productPrice);
      
      // ✅ UPDATED: Handle multiple evidence files
      disputeData.evidence.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });

      const response = await fetch(`http://localhost:5000/api/payment-links/${linkId}/dispute`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentStep('disputed');
          setProductData(prev => ({
            ...prev,
            status: 'disputed',
            disputeInfo: data.dispute
          }));
          setShowOTPModal(false);
          setShowDisputeModal(false);
          showNotificationMessage('Dispute submitted successfully! Our team will review your case.', 'success');
        }
      } else {
        throw new Error('Failed to submit dispute');
      }
    } catch (error) {
      console.error('Error submitting dispute:', error);
      showNotificationMessage('Failed to submit dispute. Please try again.', 'error');
    }
  };

  // ✅ UPDATED: Confirm receipt function with OTP
  const confirmReceipt = async () => {
    setOtpAction('confirm_receipt');
    setOtp('');
    const otpSent = await sendOTP('confirm_receipt');
    if (otpSent) {
      setShowOTPModal(true);
    }
  };

  // ✅ UPDATED: Report dispute function with form
  const reportDispute = () => {
    setShowDisputeModal(true);
    setDisputeData({
      reason: '',
      description: '',
      evidence: [], // ✅ CHANGED: Initialize as empty array
      otherReason: ''
    });
  };

  // ✅ UPDATED: Handle dispute form submission
  const handleDisputeSubmit = async () => {
    if (!disputeData.reason) {
      showNotificationMessage('Please select a reason for dispute', 'error');
      return;
    }

    if (!disputeData.description.trim()) {
      showNotificationMessage('Please provide a description of the issue', 'error');
      return;
    }

    if (disputeData.reason === 'Others' && !disputeData.otherReason.trim()) {
      showNotificationMessage('Please specify the reason for dispute', 'error');
      return;
    }

    setOtpAction('submit_dispute');
    setOtp('');
    const otpSent = await sendOTP('submit_dispute');
    if (otpSent) {
      setShowOTPModal(true);
      setShowDisputeModal(false); // ✅ ADDED: Close dispute modal when OTP appears
    }
  };

  // ✅ NEW: Handle multiple image upload for dispute evidence
  const handleEvidenceUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // ✅ Check if adding new files would exceed maximum
    if (disputeData.evidence.length + files.length > 10) {
      showNotificationMessage('Maximum 10 images allowed. Please select fewer files.', 'error');
      return;
    }

    // ✅ Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      showNotificationMessage('Please select valid image files only.', 'error');
      return;
    }

    setDisputeData(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...imageFiles].slice(0, 10) // ✅ Ensure max 10 files
    }));
  };

  // ✅ NEW: Remove individual evidence file
  const removeEvidenceFile = (index) => {
    setDisputeData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  // ✅ NEW: Contact support handler with direct platform links
  const handleContactSupport = () => {
    setShowContactSupport(true);
  };

  // ✅ NEW: Direct contact actions
  const handleCallNow = () => {
    window.open('tel:+255123456789', '_self');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/255123456789', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:support@shujaapay.com', '_self');
  };

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    if (amount == null) return 'Tsh 0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Tsh 0';
    return `Tsh ${num.toLocaleString('en-TZ', { maximumFractionDigits: 0 })}`;
  };

  // Helper to get image src
  const getImageSrc = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (typeof image === 'object') {
      if (image.data) return image.data;
      if (image.url) return image.url;
    }
    return null;
  };

  // Initialize imageLoading mapping
  const initImageLoading = (images) => {
    if (!Array.isArray(images)) return;
    const map = {};
    images.forEach((_, idx) => (map[idx] = true));
    setImageLoading(map);
  };

  // Update payment status in database
  const updatePaymentStatusInDB = async (paymentData) => {
    try {
      console.log('🔄 Attempting to save payment to database:', {
        linkId,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId
      });

      const response = await fetch(`http://localhost:5000/api/payment-links/${linkId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId,
          paymentId: paymentData.paymentId,
          amount: productData.productPrice,
          buyerName: productData.buyerName,
          buyerPhone: productData.buyerPhone,
          buyerEmail: productData.buyerEmail || '',
          productName: productData.productName
        })
      });

      console.log('📡 Database save response status:', response.status);

      const text = await response.text();
      let result;
      try {
        result = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('❌ Failed to parse database response:', parseError, 'Raw response:', text);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('❌ Database save failed with status:', response.status, 'Response:', result);
        throw new Error(result?.message || `Database error: ${response.status}`);
      }

      if (result.success) {
        console.log('✅ Payment status saved to database successfully');
        return true;
      } else {
        console.error('❌ Database save returned success:false:', result.message);
        throw new Error(result.message || 'Unknown database error');
      }
    } catch (error) {
      console.error('❌ Error updating payment status in database:', error);
      throw error;
    }
  };

  // Fetch complete seller profile
  const fetchSellerProfile = async (sellerId) => {
    try {
      console.log('🔄 Fetching complete seller profile for:', sellerId);
      const response = await fetch(`http://localhost:5000/api/sellers/${sellerId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.seller) {
          console.log('✅ Complete seller profile loaded:', data.seller);
          return data.seller;
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Could not fetch complete seller profile:', error);
      return null;
    }
  };

  // ✅ UPDATED: Determine current step based on order status
  const determineCurrentStep = (paymentLink) => {
    if (!paymentLink) return 'before_payment';
    
    console.log('🔍 Determining step for status:', paymentLink.status);
    
    switch (paymentLink.status) {
      case 'waiting_payment':
      case 'active': // Backward compatibility
        return 'before_payment';
      case 'in_escrow':
      case 'paid':
        return 'payment_success';
      case 'delivered':
        return 'delivered';
      case 'completed':
        return 'completed';
      case 'disputed':
        return 'disputed';
      case 'canceled':
      case 'cancelled': // Backward compatibility
        return 'cancelled';
      case 'expired':
        return 'expired';
      case 'deleted': // ✅ NEW: Handle deleted status
        return 'deleted';
      default:
        return 'before_payment';
    }
  };

  // ✅ UPDATED: Check if delivery information exists
  const hasDeliveryInfo = (deliveryInfo) => {
    return deliveryInfo && (
      deliveryInfo.destination || 
      deliveryInfo.estimatedArrival || 
      deliveryInfo.deliveryCompany
    );
  };

  // ✅ UPDATED: Check if receipt exists
  const hasReceipt = (deliveryInfo) => {
    return deliveryInfo && deliveryInfo.deliveryReceipt;
  };

  // ✅ UPDATED: Get receipt URL
  const getReceiptUrl = (deliveryInfo) => {
    if (!deliveryInfo || !deliveryInfo.deliveryReceipt) return null;
    
    if (typeof deliveryInfo.deliveryReceipt === 'string') {
      return deliveryInfo.deliveryReceipt;
    }
    
    if (deliveryInfo.deliveryReceipt.url) {
      return deliveryInfo.deliveryReceipt.url;
    }
    
    if (deliveryInfo.deliveryReceipt.data) {
      return deliveryInfo.deliveryReceipt.data;
    }
    
    return null;
  };

  // ✅ UPDATED: Format delivery date
  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch payment link data with complete seller information
  useEffect(() => {
    if (!linkId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPaymentLinkData = async () => {
      setLoading(true);
      setError('');
      setProductData(null);
      lastFetchRef.current = null;

      try {
        console.log('🔗 Fetching payment link data for:', linkId);
        const res = await fetch(`http://localhost:5000/api/payment-links/${encodeURIComponent(linkId)}`, { signal });

        console.log('📡 Response status:', res.status);

        const text = await res.text();

        if (!res.ok) {
          let parsed = null;
          try { parsed = JSON.parse(text); } catch (_) { /* ignore */ }

          if (res.status === 404) {
            throw new Error(parsed?.message || 'Payment link not found. Please check the link and try again.');
          }
          if (res.status === 410) {
            throw new Error(parsed?.message || 'This payment link has expired. Please contact the seller for a new link.');
          }

          throw new Error(parsed?.message || `Failed to load payment link (status ${res.status}).`);
        }

        let data;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (err) {
          console.error('❌ Failed to parse JSON response:', err, 'raw text:', text);
          throw new Error('Server returned invalid JSON. Please contact support.');
        }

        console.log('📦 Received data:', data);
        lastFetchRef.current = data;

        if (!data || data.success !== true) {
          throw new Error((data && data.message) ? data.message : 'Invalid payment link');
        }

        if (!data.paymentLink) {
          throw new Error('Payment link data is missing from the response.');
        }

        // Process the payment link data
        const paymentLink = data.paymentLink;
        
        // ✅ UPDATED: Determine current step based on actual status
        const step = determineCurrentStep(paymentLink);
        setCurrentStep(step);
        console.log('📊 Setting current step to:', step, 'based on status:', paymentLink.status);
        
        // Fetch complete seller profile for location and business type
        let completeSellerData = null;
        if (paymentLink.seller?.id) {
          completeSellerData = await fetchSellerProfile(paymentLink.seller.id);
        }

        // Process the complete data with proper seller information
        const processedData = {
          ...paymentLink,
          seller: {
            // Basic seller info from payment link
            id: paymentLink.seller?.id || paymentLink.sellerId,
            name: paymentLink.seller?.name || paymentLink.sellerName || 'Seller',
            email: paymentLink.seller?.email || paymentLink.sellerEmail || '',
            phone: paymentLink.seller?.phone || paymentLink.sellerPhone || 'Not provided',
            
            // Enhanced seller info from complete profile
            location: completeSellerData?.location || paymentLink.seller?.location || 'Location not specified',
            businessType: completeSellerData?.businessType || paymentLink.seller?.businessType || 'Not specified',
            businessName: completeSellerData?.businessName || paymentLink.seller?.businessName || 'Individual Seller',
            
            // Ratings and stats
            rating: completeSellerData?.rating || paymentLink.seller?.rating || 0,
            totalRatings: completeSellerData?.totalRatings || paymentLink.seller?.totalRatings || 0,
            completedOrders: completeSellerData?.completedOrders || paymentLink.seller?.completedOrders || 0,
            
            // Additional profile data
            fullName: completeSellerData?.fullName || paymentLink.seller?.name || 'Seller',
            profileImage: completeSellerData?.profileImage,
            createdAt: completeSellerData?.createdAt || paymentLink.seller?.createdAt,
            accountStatus: completeSellerData?.accountStatus || 'active'
          }
        };

        // Set product data and init image loading
        setProductData(processedData);
        initImageLoading(processedData.productImages || []);
        console.log('✅ Payment link data loaded successfully:', {
          linkId: processedData.linkId,
          status: processedData.status,
          step: step,
          hasDeliveryInfo: hasDeliveryInfo(processedData.deliveryInfo),
          hasReceipt: hasReceipt(processedData.deliveryInfo)
        });
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn('Fetch aborted for linkId:', linkId);
          return;
        }
        console.error('❌ Error fetching payment link:', err);
        setError(err.message || 'Failed to load payment link. Please check the link and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentLinkData();

    return () => controller.abort();
  }, [linkId]);

  // Payment method selection
  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  // Make payment - UPDATED TO SAVE TO DATABASE
  const handleMakePayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      setTimeout(() => setError(''), 4000);
      return;
    }
    if (!productData) {
      setError('Payment data missing');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Handle bank transfer - show coming soon message
    if (selectedPaymentMethod === 'bank_transfer') {
      setError('Bank Transfer is coming soon! Please use Mobile Money for now.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Handle mobile money - process payment and save to database
    if (selectedPaymentMethod === 'mobile_money') {
      setProcessingPayment(true);
      
      // Generate payment details
      const paymentDetails = {
        paymentMethod: selectedPaymentMethod,
        paymentId: 'PMT_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        paidAt: new Date().toISOString()
      };

      try {
        console.log('💰 Starting Mobile Money payment process...');
        
        // Save payment status to database FIRST
        const saveSuccess = await updatePaymentStatusInDB(paymentDetails);
        
        if (saveSuccess) {
          // Update UI state only after successful database save
          setShowPaymentModal(false);
          setCurrentStep('payment_success');

          setProductData(prev => ({
            ...prev,
            status: 'paid',
            paymentStatus: 'paid',
            ...paymentDetails
          }));

          console.log('✅ Mobile Money payment successful and saved to database!');
        } else {
          throw new Error('Failed to save payment status to database');
        }
      } catch (error) {
        console.error('❌ Payment processing error:', error);
        setError(`Payment completed but failed to save status: ${error.message}`);
        setTimeout(() => setError(''), 5000);
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    // Original payment processing for other methods
    setProcessingPayment(true);
    setError('');

    try {
      const payload = {
        linkId,
        paymentMethod: selectedPaymentMethod,
        amount: productData.productPrice,
        buyerName: productData.buyerName,
        buyerPhone: productData.buyerPhone,
        buyerEmail: productData.buyerEmail || '',
        productName: productData.productName
      };

      console.log('🔄 Processing payment with payload:', payload);

      const res = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : null; } catch (e) {
        console.error('❌ Payment response JSON parse failed:', e, 'raw:', text);
        throw new Error('Payment gateway returned an invalid response.');
      }

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Payment processing is temporarily unavailable. Please try again later or contact support.');
        }
        throw new Error(json?.message || `Payment failed (${res.status})`);
      }

      if (json?.success) {
        // Save payment status to database
        const saveSuccess = await updatePaymentStatusInDB({
          paymentMethod: selectedPaymentMethod,
          paymentId: json.paymentId || 'N/A',
          transactionId: json.transactionId || 'N/A'
        });

        if (saveSuccess) {
          setShowPaymentModal(false);
          setCurrentStep('payment_success');

          setProductData(prev => ({
            ...prev,
            status: 'paid',
            paymentStatus: 'paid',
            paymentId: json.paymentId || 'N/A',
            transactionId: json.transactionId || 'N/A',
            paymentMethod: selectedPaymentMethod,
            paidAt: new Date().toISOString()
          }));

          console.log('✅ Payment successful and saved to database:', json);
        } else {
          throw new Error('Payment completed but failed to save status');
        }
      } else {
        throw new Error(json?.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Payment failed: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Close payment modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMethod('');
  };

  // Image handlers
  const handleImageLoad = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };
  const handleImageError = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  // UI helpers
  const handleBack = () => router.push('/');
  const handleTryAgain = () => window.location.reload();
  const handleGoHome = () => router.push('/');

  // Format rating display
  const formatRating = (rating, totalRatings) => {
    if (!rating || rating === 0 || totalRatings === 0) return 'No ratings yet';
    return `${rating} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`;
  };

  // Format member since date
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // ✅ UPDATED: Dispute Information Component - Moved to top for disputed orders
  const DisputeInfoSection = () => {
    if (currentStep !== 'disputed') return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-bold text-red-900">Order Disputed</h2>
        </div>
        
        {/* ✅ ADDED: Secured by Shujaa Pay Escrow at top */}
        <div className="flex items-center justify-center space-x-2 mb-4 p-3 bg-white rounded-lg border border-red-100">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 font-medium">Secured by Shujaa Pay Escrow</span>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-red-800">Your dispute is under review by our team</h3>
          <p className="text-red-600 mt-1">We will contact you within 24-48 hours</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-3">Dispute Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-600">Status:</span>
                <span className="font-medium text-red-800">Under Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Submitted:</span>
                <span className="font-medium text-red-800">
                  {productData.disputeInfo?.submittedAt ? 
                    new Date(productData.disputeInfo.submittedAt).toLocaleDateString() : 
                    'Recently'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Case ID:</span>
                <span className="font-mono text-red-800">DSP-{productData.linkId?.substring(-6)}</span>
              </div>
            </div>
          </div>

          {/* ✅ UPDATED: Order Summary with Seller Contact Information */}
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{productData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-green-600">{formatCurrency(productData.productPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seller:</span>
                <span className="font-medium">{productData.seller?.name}</span>
              </div>
              {/* ✅ ADDED: Seller Contact Information */}
              <div className="flex justify-between">
                <span className="text-gray-600">Seller Phone:</span>
                <span className="font-medium">{productData.seller?.phone || 'Not provided'}</span>
              </div>
              {productData.seller?.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller Email:</span>
                  <span className="font-medium">{productData.seller.email}</span>
                </div>
              )}
            </div>
          </div>

          {productData.deliveryInfo && hasDeliveryInfo(productData.deliveryInfo) && (
            <div className="bg-white rounded-lg p-4 border border-red-100">
              <h3 className="font-semibold text-red-800 mb-3">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                {productData.deliveryInfo.deliveryCompany && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Company:</span>
                    <span>{productData.deliveryInfo.deliveryCompany}</span>
                  </div>
                )}
                {productData.deliveryInfo.destination && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Address:</span>
                    <span className="text-right">{productData.deliveryInfo.destination}</span>
                  </div>
                )}
                {productData.deliveryInfo.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-mono">{productData.deliveryInfo.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex-1"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Contact Support</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex-1"
            >
              <FileText className="h-5 w-5" />
              <span>Save Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ UPDATED: Delivery Information Component
  const DeliveryInfoSection = () => {
    if (!productData?.deliveryInfo || !hasDeliveryInfo(productData.deliveryInfo)) {
      return null;
    }

    const { deliveryInfo } = productData;
    const receiptUrl = getReceiptUrl(deliveryInfo);

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Truck className="h-5 w-5 mr-2" />
          Delivery Information
        </h3>
        
        <div className="space-y-3">
          {deliveryInfo.destination && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Delivery Address</p>
                <p className="text-blue-900">{deliveryInfo.destination}</p>
              </div>
            </div>
          )}
          
          {deliveryInfo.estimatedArrival && (
            <div className="flex items-start space-x-3">
              <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Estimated Arrival</p>
                <p className="text-blue-900">{formatDeliveryDate(deliveryInfo.estimatedArrival)}</p>
              </div>
            </div>
          )}
          
          {deliveryInfo.deliveryCompany && (
            <div className="flex items-start space-x-3">
              <Package className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Delivery Company</p>
                <p className="text-blue-900">{deliveryInfo.deliveryCompany}</p>
              </div>
            </div>
          )}
          
          {deliveryInfo.trackingNumber && (
            <div className="flex items-start space-x-3">
              <Navigation className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Tracking Number</p>
                <p className="text-blue-900 font-mono">{deliveryInfo.trackingNumber}</p>
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Delivery Receipt Section */}
          {receiptUrl && (
            <div className="flex items-start space-x-3">
              <Download className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Delivery Receipt</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex items-center space-x-2 bg-white border border-blue-300 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>View Receipt</span>
                  </button>
                  <a
                    href={receiptUrl}
                    download={`delivery-receipt-${productData.linkId}.jpg`}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {deliveryInfo.deliveredAt && (
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Delivered On</p>
                <p className="text-green-900">{formatDeliveryDate(deliveryInfo.deliveredAt)}</p>
              </div>
            </div>
          )}
        </div>
        
        {productData.status === 'delivered' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center mb-3">
              <CheckCircle className="h-4 w-4 mr-2" />
              <strong>Your order has been delivered!</strong> Please confirm receipt to release payment to the seller.
            </p>
            
            {/* ✅ UPDATED: Action Buttons for Delivered Status */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={confirmReceipt}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{loading ? 'Confirming...' : 'Confirm Receipt'}</span>
              </button>
              
              <button
                onClick={reportDispute}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex-1"
              >
                <Flag className="h-4 w-4" />
                <span>Report Dispute</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Payment Link</h2>
          <p className="text-gray-600">Preparing your secure payment page...</p>
        </div>
      </div>
    );
  }

  // Error or missing data UI
  if (error || !productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {error?.toLowerCase().includes('expired') ? 'Link Expired' : 'Invalid Payment Link'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This payment link is invalid or has been deactivated.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact Support</span>
            </button>

            <button
              onClick={handleTryAgain}
              className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors w-full"
            >
              <Loader className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Need Help?</h3>
            <p className="text-xs text-blue-700">
              If you continue to experience issues, please contact our support team with the payment link details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ UPDATED: After payment success or delivery, show appropriate status
  if (currentStep === 'payment_success' || currentStep === 'delivered' || currentStep === 'completed' || currentStep === 'disputed' || currentStep === 'cancelled' || currentStep === 'expired' || currentStep === 'deleted') {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ✅ UPDATED: Custom Notification */}
          {showNotification && (
            <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
              notificationType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            } border rounded-lg shadow-lg p-4 transform transition-transform duration-300 ease-in-out`}>
              <div className="flex items-start space-x-3">
                {notificationType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    notificationType === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notificationMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Show Dispute Info for disputed orders AT THE TOP */}
          {currentStep === 'disputed' && <DisputeInfoSection />}

          {/* Header - Hide for disputed orders since we show it at top */}
          {currentStep !== 'disputed' && (
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Secured by Shujaa Pay Escrow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currentStep === 'payment_success' && 'Payment Successful!'}
                {currentStep === 'delivered' && 'Order Delivered!'}
                {currentStep === 'completed' && 'Order Completed!'}
                {currentStep === 'disputed' && 'Order Disputed'}
                {currentStep === 'cancelled' && 'Order Cancelled'}
                {currentStep === 'expired' && 'Order Expired'}
                {currentStep === 'deleted' && 'Order Deleted'} {/* ✅ NEW: Deleted status */}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {currentStep === 'payment_success' && 'Your payment is secured and the seller has been notified'}
                {currentStep === 'delivered' && 'Your order has been delivered. Please confirm receipt.'}
                {currentStep === 'completed' && 'Thank you for your purchase!'}
                {currentStep === 'disputed' && 'Your dispute is under review by our team'}
                {currentStep === 'cancelled' && 'This order has been cancelled'}
                {currentStep === 'expired' && 'This payment link has expired'}
                {currentStep === 'deleted' && 'This order has been deleted'} {/* ✅ NEW: Deleted message */}
              </p>
            </div>
          )}

          {/* Status-specific content - Hide for disputed orders */}
          {currentStep !== 'disputed' && (
            <div className={`rounded-xl p-4 sm:p-6 text-center max-w-3xl mx-auto ${
              currentStep === 'payment_success' ? 'bg-green-50 border border-green-200' :
              currentStep === 'delivered' ? 'bg-blue-50 border border-blue-200' :
              currentStep === 'completed' ? 'bg-purple-50 border border-purple-200' :
              currentStep === 'deleted' ? 'bg-red-50 border border-red-200' : // ✅ NEW: Deleted styling
              'bg-gray-50 border border-gray-200'
            }`}>
              
              {/* Status Icon */}
              {currentStep === 'payment_success' && <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />}
              {currentStep === 'delivered' && <Truck className="h-16 w-16 text-blue-500 mx-auto mb-4" />}
              {currentStep === 'completed' && <CheckCircle className="h-16 w-16 text-purple-500 mx-auto mb-4" />}
              {currentStep === 'deleted' && <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />} {/* ✅ NEW: Deleted icon */}
              {(currentStep === 'cancelled' || currentStep === 'expired') && <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />}
              
              <h3 className="text-xl font-semibold mb-3" style={{
                color: currentStep === 'payment_success' ? '#065f46' :
                       currentStep === 'delivered' ? '#1e40af' :
                       currentStep === 'completed' ? '#5b21b6' :
                       currentStep === 'deleted' ? '#dc2626' : // ✅ NEW: Deleted color
                       '#374151'
              }}>
                {currentStep === 'payment_success' && 'Payment Successful! 🎉'}
                {currentStep === 'delivered' && 'Order Delivered! 📦'}
                {currentStep === 'completed' && 'Order Completed! ✅'}
                {currentStep === 'deleted' && 'Order Deleted'} {/* ✅ NEW: Deleted title */}
                {currentStep === 'cancelled' && 'Order Cancelled'}
                {currentStep === 'expired' && 'Order Expired'}
              </h3>
              
              <p className="mb-4 text-sm sm:text-base leading-relaxed" style={{
                color: currentStep === 'payment_success' ? '#065f46' :
                       currentStep === 'delivered' ? '#1e40af' :
                       currentStep === 'completed' ? '#5b21b6' :
                       currentStep === 'deleted' ? '#dc2626' : // ✅ NEW: Deleted color
                       '#374151'
              }}>
                {currentStep === 'payment_success' && `Thank you for your payment of `}
                {currentStep === 'delivered' && `Your order has been delivered. `}
                {currentStep === 'completed' && `Thank you for your purchase! `}
                {currentStep === 'deleted' && `This order has been deleted. `} {/* ✅ NEW: Deleted message */}
                {currentStep === 'cancelled' && `This order has been cancelled. `}
                {currentStep === 'expired' && `This payment link has expired. `}
                
                {(currentStep === 'payment_success' || currentStep === 'delivered' || currentStep === 'completed') && (
                  <>
                    <strong>{formatCurrency(productData.productPrice)}</strong> for{" "}
                    <strong>"{productData.productName}"</strong>.
                  </>
                )}
              </p>
              
              {/* Status-specific messages */}
              {currentStep === 'payment_success' && (
                <p className="text-green-600 mb-4 text-sm">
                  Your payment is secured in escrow. The seller has been notified and will prepare your order.
                </p>
              )}
              
              {currentStep === 'delivered' && (
                <p className="text-blue-600 mb-4 text-sm">
                  Your order has been delivered. Please confirm receipt to release payment to the seller.
                </p>
              )}

              {/* ✅ NEW: Deleted order message */}
              {currentStep === 'deleted' && (
                <p className="text-red-600 mb-4 text-sm">
                  This order has been deleted and is no longer accessible. Please contact support if you believe this is an error.
                </p>
              )}
              
              {/* ✅ UPDATED: Show delivery information if available */}
              {(currentStep === 'delivered' || currentStep === 'completed') && productData.deliveryInfo && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-current border-opacity-20">
                  <h4 className="font-semibold mb-3 text-lg">Delivery Details</h4>
                  <div className="space-y-2 text-sm text-left">
                    {productData.deliveryInfo.deliveryCompany && (
                      <div className="flex justify-between">
                        <span className="font-medium">Delivery Company:</span>
                        <span>{productData.deliveryInfo.deliveryCompany}</span>
                      </div>
                    )}
                    {productData.deliveryInfo.destination && (
                      <div className="flex justify-between">
                        <span className="font-medium">Delivery Address:</span>
                        <span className="text-right">{productData.deliveryInfo.destination}</span>
                      </div>
                    )}
                    {productData.deliveryInfo.estimatedArrival && (
                      <div className="flex justify-between">
                        <span className="font-medium">Estimated Arrival:</span>
                        <span>{formatDeliveryDate(productData.deliveryInfo.estimatedArrival)}</span>
                      </div>
                    )}
                    {productData.deliveryInfo.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium">Tracking Number:</span>
                        <span className="font-mono">{productData.deliveryInfo.trackingNumber}</span>
                      </div>
                    )}
                    {productData.deliveryInfo.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="font-medium">Delivered On:</span>
                        <span>{formatDeliveryDate(productData.deliveryInfo.deliveredAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* ✅ UPDATED: Delivery Receipt Section */}
                  {hasReceipt(productData.deliveryInfo) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-semibold mb-3 text-lg">Delivery Receipt</h5>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          onClick={() => setShowReceiptModal(true)}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span>View Receipt</span>
                        </button>
                        <a
                          href={getReceiptUrl(productData.deliveryInfo)}
                          download={`delivery-receipt-${productData.linkId}.jpg`}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download Receipt</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ UPDATED: Only show receipt for payment_success, not for delivered status */}
              {currentStep === 'payment_success' && (
                <div id="receipt-content" className="bg-white rounded-lg p-4 mb-4 border border-current border-opacity-20">
                  {/* Receipt Header */}
                  <div className="text-center mb-4 border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Shield className="h-6 w-6 text-green-500" />
                      <h4 className="text-lg font-bold text-gray-900">Shujaa Pay Receipt</h4>
                    </div>
                    <p className="text-xs text-gray-500">Secure Escrow Payment Confirmation</p>
                  </div>

                  {/* Order Information */}
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Product:</span>
                      <span className="font-semibold text-gray-900">{productData.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Amount Paid:</span>
                      <span className="font-bold text-green-600 text-lg">{formatCurrency(productData.productPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Payment Method:</span>
                      <span className="font-medium text-gray-900">
                        {productData.paymentMethod === 'mobile_money' ? 'Mobile Money' : productData.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Order Status:</span>
                      <span className="font-medium text-gray-900 capitalize">{productData.status}</span>
                    </div>
                  </div>

                  {/* Buyer & Seller Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-left">
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Buyer Information</h5>
                      <p className="text-xs text-gray-700 mb-1"><strong>Name:</strong> {productData.buyerName}</p>
                      <p className="text-xs text-gray-700 mb-1"><strong>Phone:</strong> {productData.buyerPhone}</p>
                      {productData.buyerEmail && (
                        <p className="text-xs text-gray-700"><strong>Email:</strong> {productData.buyerEmail}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm">Seller Information</h5>
                      <p className="text-xs text-gray-700 mb-1"><strong>Name:</strong> {productData.seller?.name || 'Seller'}</p>
                      <p className="text-xs text-gray-700 mb-1"><strong>Phone:</strong> {productData.seller?.phone || 'Not provided'}</p>
                      {productData.seller?.email && (
                        <p className="text-xs text-gray-700"><strong>Email:</strong> {productData.seller.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="border-t border-gray-200 pt-3">
                    <h5 className="font-semibold text-gray-900 mb-2 text-sm">Transaction Details</h5>
                    {productData.paymentId && (
                      <p className="font-mono text-xs text-gray-800 break-all mb-1">
                        <strong>Payment ID:</strong> {productData.paymentId}
                      </p>
                    )}
                    {productData.transactionId && (
                      <p className="font-mono text-xs text-gray-800 break-all mb-1">
                        <strong>Transaction ID:</strong> {productData.transactionId}
                      </p>
                    )}
                    {productData.paidAt && (
                      <p className="text-xs text-gray-800 mb-1">
                        <strong>Date & Time:</strong> {new Date(productData.paidAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-800">
                      <strong>Payment Status:</strong> <span className="text-green-600 font-semibold">Paid</span>
                    </p>
                    <p className="text-xs text-gray-800 mt-1">
                      <strong>Payment Link ID:</strong> {productData.linkId}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 pt-3 mt-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      This payment is secured by Shujaa Pay Escrow
                    </p>
                    <p className="text-xs text-gray-500">
                      Payment held securely until delivery confirmation
                    </p>
                  </div>
                </div>
              )}

              {/* ✅ UPDATED: Action Buttons for Delivered Status */}
              {currentStep === 'delivered' && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                  <h4 className="font-semibold mb-3 text-lg text-blue-900">Next Steps</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Please confirm that you have received your order as expected to release payment to the seller.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={confirmReceipt}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      <span>{loading ? 'Confirming...' : 'Confirm Receipt'}</span>
                    </button>
                    
                    <button
                      onClick={reportDispute}
                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex-1"
                    >
                      <Flag className="h-5 w-5" />
                      <span>Report Dispute</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm" style={{
                  color: currentStep === 'payment_success' ? '#065f46' :
                         currentStep === 'delivered' ? '#1e40af' :
                         currentStep === 'deleted' ? '#dc2626' : // ✅ NEW: Deleted color
                         '#5b21b6'
                }}>
                  {currentStep === 'payment_success' && "You'll receive order updates via SMS and email."}
                  {currentStep === 'delivered' && "Please confirm receipt when you receive your order."}
                  {currentStep === 'completed' && "We hope you enjoy your purchase!"}
                  {currentStep === 'deleted' && "Please contact support if you need assistance."} {/* ✅ NEW: Deleted help message */}
                </p>
                
                {/* Print button for successful orders */}
                {currentStep === 'payment_success' && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => {
                        const printStyles = `
                          @media print {
                            body * {
                              visibility: hidden;
                            }
                            #receipt-content, #receipt-content * {
                              visibility: visible;
                            }
                            #receipt-content {
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 100%;
                              box-shadow: none;
                              border: 1px solid #000;
                            }
                            .no-print {
                              display: none !important;
                            }
                          }
                        `;
                        
                        const styleSheet = document.createElement("style");
                        styleSheet.innerText = printStyles;
                        document.head.appendChild(styleSheet);
                        
                        window.print();
                        
                        setTimeout(() => {
                          document.head.removeChild(styleSheet);
                        }, 100);
                      }}
                      className="flex items-center space-x-2 font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-lg no-print"
                      style={{
                        backgroundColor: '#059669',
                        color: 'white'
                      }}
                    >
                      <span>🖨️ Save Receipt</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Support Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 no-print">
                <p className="text-xs text-blue-700">
                  <strong>Need help?</strong> Contact Shujaa Pay Support: 
                  support@shujaapay.com | +255 123 456 789
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ✅ UPDATED: Receipt Modal */}
        {showReceiptModal && productData.deliveryInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Receipt</h2>
                  <p className="text-gray-600 text-sm mt-1">Order: {productData.linkId}</p>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col items-center">
                  <img
                    src={getReceiptUrl(productData.deliveryInfo)}
                    alt="Delivery Receipt"
                    className="max-w-full h-auto max-h-[60vh] rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('receipt-error').style.display = 'block';
                    }}
                  />
                  <div id="receipt-error" className="hidden text-center p-8 bg-gray-100 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Unable to load receipt image</p>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <a
                      href={getReceiptUrl(productData.deliveryInfo)}
                      download={`delivery-receipt-${productData.linkId}.jpg`}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Receipt</span>
                    </a>
                    <button
                      onClick={() => setShowReceiptModal(false)}
                      className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: OTP Modal with Cancel Option */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Enter OTP</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {otpAction === 'confirm_receipt' 
                      ? 'Enter OTP to confirm receipt and release payment' 
                      : 'Enter OTP to submit dispute'}
                  </p>
                </div>
                <button
                  onClick={() => setShowOTPModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 111111 for testing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg font-mono"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    For testing, use: <strong>111111</strong>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOTPModal(false)}
                    className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  
                  <button
                    onClick={() => sendOTP(otpAction)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Resend OTP</span>
                  </button>
                  
                  <button
                    onClick={handleOTPSubmit}
                    disabled={!otp.trim() || otpLoading}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  >
                    {otpLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{otpLoading ? 'Verifying...' : 'Submit'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: Dispute Modal with Cancel Option and Multiple Image Upload */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Report Dispute</h2>
                    <p className="text-gray-600 text-sm mt-1">Order: {productData.linkId}</p>
                  </div>
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Dispute *
                  </label>
                  <select
                    value={disputeData.reason}
                    onChange={(e) => setDisputeData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a reason</option>
                    {disputeReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                {disputeData.reason === 'Others' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specify Reason *
                    </label>
                    <input
                      type="text"
                      value={disputeData.otherReason}
                      onChange={(e) => setDisputeData(prev => ({ ...prev, otherReason: e.target.value }))}
                      placeholder="Please specify the reason for dispute"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Issue *
                  </label>
                  <textarea
                    value={disputeData.description}
                    onChange={(e) => setDisputeData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="Please provide detailed information about the issue..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence (Optional) - Max 10 images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload images as evidence (Maximum 10 images)
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {disputeData.evidence.length}/10 images selected
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEvidenceUpload}
                      className="hidden"
                      id="evidence-upload"
                      multiple
                    />
                    <label
                      htmlFor="evidence-upload"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Choose Images
                    </label>
                    
                    {/* ✅ UPDATED: Show selected images */}
                    {disputeData.evidence.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {disputeData.evidence.map((file, index) => (
                            <div key={index} className="relative border rounded-lg p-1">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Evidence ${index + 1}`}
                                className="w-full h-16 object-cover rounded"
                              />
                              <button
                                onClick={() => removeEvidenceFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                style={{ width: '20px', height: '20px' }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Important</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        By submitting this dispute, you agree that our support team will review your case 
                        and may contact both parties for resolution. Please provide accurate information.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDisputeSubmit}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Flag className="h-5 w-5" />
                  <span>Submit Dispute</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: Contact Support Modal - Removed Seller Information Cards */}
        {showContactSupport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
                  <p className="text-gray-600 text-sm mt-1">Get help with your order</p>
                </div>
                <button
                  onClick={() => setShowContactSupport(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* ✅ REMOVED: Seller Information Cards - Now only buttons */}

                <div className="space-y-3">
                  <button
                    onClick={handleCallNow}
                    className="w-full flex items-center justify-center space-x-3 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Call Now</span>
                  </button>
                  
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center space-x-3 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>DM WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={handleEmail}
                    className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Send Email</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 text-center">
                    Our support team is available 24/7 to assist you
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Product data exists and is valid here - BEFORE PAYMENT VIEW
  const hasImages = Array.isArray(productData.productImages) && productData.productImages.length > 0;
  const mainImageSrc = hasImages ? getImageSrc(productData.productImages[activeImageIndex]) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ UPDATED: Custom Notification */}
        {showNotification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
            notificationType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          } border rounded-lg shadow-lg p-4 transform transition-transform duration-300 ease-in-out`}>
            <div className="flex items-start space-x-3">
              {notificationType === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notificationType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Secured by Shujaa Pay Escrow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Your payment is protected until you receive your order
          </p>

          {/* ✅ REMOVED: Time remaining section */}

          {/* Status badge for non-waiting_payment status */}
          {productData.status && productData.status !== 'waiting_payment' && productData.status !== 'active' && (
            <div className="flex justify-center mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                productData.status === 'paid' || productData.status === 'in_escrow' ? 'bg-blue-100 text-blue-800' :
                productData.status === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                productData.status === 'completed' ? 'bg-green-100 text-green-800' :
                productData.status === 'deleted' ? 'bg-red-100 text-red-800' : // ✅ NEW: Deleted status
                productData.status === 'cancelled' || productData.status === 'canceled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {productData.status === 'paid' && 'Payment Received'}
                {productData.status === 'in_escrow' && 'Payment Secured'}
                {productData.status === 'delivered' && 'Delivered'}
                {productData.status === 'completed' && 'Completed'}
                {productData.status === 'deleted' && 'Deleted'} {/* ✅ NEW: Deleted badge */}
                {productData.status === 'cancelled' || productData.status === 'canceled' ? 'Cancelled' :
                 productData.status === 'expired' ? 'Expired' : productData.status}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 relative">
                {hasImages ? (
                  <>
                    {imageLoading[activeImageIndex] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <Loader className="h-8 w-8 text-gray-400 animate-spin" />
                      </div>
                    )}
                   <img
                      src={mainImageSrc}
                      alt={productData.productName || 'Product image'}
                      className={`w-full h-48 sm:h-64 object-contain bg-gray-50 rounded-lg ${imageLoading[activeImageIndex] ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => handleImageLoad(activeImageIndex)}
                      onError={() => handleImageError(activeImageIndex)}
                    />
                  </>
                ) : (
                  <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No images available</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {hasImages && productData.productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productData.productImages.map((image, index) => {
                    const thumbSrc = getImageSrc(image);
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative border-2 rounded-md overflow-hidden ${activeImageIndex === index ? 'border-green-500' : 'border-gray-200'}`}
                      >
                        <img
                          src={thumbSrc}
                          alt={`${productData.productName || 'Product'} ${index + 1}`}
                          className="w-full h-16 object-contain bg-gray-50"
                          onLoad={() => handleImageLoad(index)}
                          onError={() => handleImageError(index)}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {productData.productName || 'Product Name'}
              </h1>
              <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                {productData.productDescription || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-green-600">
                  {formatCurrency(productData.productPrice)}
                </span>
                {productData.metadata?.condition && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Condition: {productData.metadata.condition}
                  </span>
                )}
              </div>
            </div>

            {/* ✅ UPDATED: Delivery Information Section - Show if order has delivery info */}
            {productData.deliveryInfo && hasDeliveryInfo(productData.deliveryInfo) && (
              <DeliveryInfoSection />
            )}

            {/* Buyer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                Your Information
              </h3>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Full Name:</span>
                  <span className="font-semibold text-gray-900">{productData.buyerName || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Phone Number:</span>
                  <span className="font-semibold text-gray-900">{productData.buyerPhone || '—'}</span>
                </div>
                {productData.buyerEmail && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="font-semibold text-gray-900">{productData.buyerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                How Escrow Protects You
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payment held securely until you confirm delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Full refund if product doesn't arrive as described</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>24/7 support for any issues</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Seller Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                Seller Information
              </h2>
              <div className="space-y-4">
                {/* Seller Header */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-base truncate">
                      {productData.seller?.name || 'Seller'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {productData.seller?.businessName || 'Individual Seller'}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Verified Seller
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{productData.seller?.phone || 'Not provided'}</span>
                  </div>

                  {productData.seller?.email && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium truncate">{productData.seller.email}</span>
                    </div>
                  )}
                </div>

                {/* Location and Business Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Location */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Navigation className="h-4 w-4 text-gray-500" />
                      <p className="text-xs text-gray-500">Location</p>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      {productData.seller?.location || 'Location not specified'}
                    </p>
                  </div>

                  {/* Business Type */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <p className="text-xs text-gray-500">Business Type</p>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      {productData.seller?.businessType || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Seller Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">
                      {formatRating(productData.seller?.rating, productData.seller?.totalRatings)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {productData.seller?.completedOrders > 0 && (
                      <span className="text-gray-500">
                        {productData.seller.completedOrders}+ orders
                      </span>
                    )}
                    
                    {productData.seller?.createdAt && (
                      <span className="text-gray-500">
                        Member since {formatMemberSince(productData.seller.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Action */}
            <div className="space-y-4">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Pay Securely - {formatCurrency(productData.productPrice)}</span>
              </button>

              <div className="text-center">
                <button 
                  onClick={handleContactSupport}
                  className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-700 mx-auto text-sm transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Need help? Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Payment Modal with Close Button */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Select Payment Method</h2>
                <p className="text-gray-600 text-sm mt-1">Choose how you'd like to pay</p>
              </div>
              <button
                onClick={handleClosePaymentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Payment Methods */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`w-full flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedPaymentMethod === method.id ? 'bg-green-500' : 'bg-gray-100'}`}>
                        <Icon className={`h-5 w-5 ${selectedPaymentMethod === method.id ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900 text-base">{method.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        {method.supportedNetworks && (
                          <p className="text-xs text-gray-500 mt-2">Supported: {method.supportedNetworks.join(', ')}</p>
                        )}
                        {method.supportedBanks && (
                          <p className="text-xs text-gray-500 mt-2">Supported banks: {method.supportedBanks.join(', ')}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium text-gray-900 truncate ml-2 max-w-[200px]">{productData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-green-600 text-lg">{formatCurrency(productData.productPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handleMakePayment}
                disabled={!selectedPaymentMethod || processingPayment}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg shadow-lg hover:shadow-xl"
              >
                {processingPayment ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Pay {formatCurrency(productData.productPrice)}</span>
                  </>
                )}
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