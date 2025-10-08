import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText, 
  DollarSign, 
  User, 
  Phone, 
  Mail,
  Check,
  Copy,
  Share2,
  Link as LinkIcon,
  X,
  ExternalLink,
  AlertCircle,
  Loader,
  Image as ImageIcon
} from 'lucide-react';

const GenerateLinkPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productPrice: '',
    productImages: [],
    buyerName: '',
    buyerPhone: '',
    buyerEmail: ''
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  // Handle file upload with validation
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    // Check file count
    if (formData.productImages.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image`);
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return false;
      }

      return true;
    });

    setFormData(prev => ({
      ...prev,
      productImages: [...prev.productImages, ...validFiles]
    }));
    
    // Clear file input
    event.target.value = '';
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Format phone number to Tanzanian format (255XXXXXXXXX)
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If starts with 0, convert to 255
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '255' + cleanPhone.substring(1);
    }
    
    // If starts with +255, remove the +
    if (cleanPhone.startsWith('255')) {
      cleanPhone = '255' + cleanPhone.substring(3);
    }
    
    // Ensure it's exactly 12 digits (255 + 9 digits)
    if (cleanPhone.length === 12 && cleanPhone.startsWith('255')) {
      return cleanPhone;
    }
    
    return phone; // Return original if can't format
  };

  // Validate all required fields before submission
  const validateAllFields = () => {
    const errors = [];

    // Check product name
    if (!formData.productName || formData.productName.trim() === '') {
      errors.push('Product name is required');
    }

    // Check product description
    if (!formData.productDescription || formData.productDescription.trim() === '') {
      errors.push('Product description is required');
    }

    // Check product price
    if (!formData.productPrice || isNaN(formData.productPrice) || parseFloat(formData.productPrice) <= 0) {
      errors.push('Valid product price is required');
    }

    // Check buyer name
    if (!formData.buyerName || formData.buyerName.trim() === '') {
      errors.push('Buyer name is required');
    }

    // Check buyer phone
    if (!formData.buyerPhone || formData.buyerPhone.trim() === '') {
      errors.push('Buyer phone number is required');
    } else {
      // Validate phone format
      const cleanPhone = formatPhoneNumber(formData.buyerPhone);
      const phoneRegex = /^255\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Phone number must be a valid Tanzanian number (e.g., 255123456789)');
      }
    }

    // Check seller data exists in localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData || !userData.id) {
      errors.push('Seller information not found. Please login again.');
    }
    if (!userData.fullName && !userData.name) {
      errors.push('Seller name not found in profile.');
    }

    return errors;
  };

  // Generate payment link with backend integration - COMPLETELY UPDATED VERSION
  const generateLink = async () => {
    // Validate all fields first
    const validationErrors = validateAllFields();
    if (validationErrors.length > 0) {
      setError(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        throw new Error('User data not found. Please login again.');
      }

      // Convert images to base64 for backend
      const imagePromises = formData.productImages.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            data: reader.result,
            name: file.name,
            type: file.type,
            size: file.size
          });
          reader.readAsDataURL(file);
        });
      });

      const imageBase64 = await Promise.all(imagePromises);

      // Format phone number properly
      const formattedPhone = formatPhoneNumber(formData.buyerPhone);

      // ✅ COMPLETELY UPDATED: Create payload with ALL seller fields
      const payload = {
        productName: formData.productName.trim(),
        productDescription: formData.productDescription.trim(),
        productPrice: parseFloat(formData.productPrice),
        productImages: imageBase64,
        buyerName: formData.buyerName.trim(),
        buyerPhone: formattedPhone,
        buyerEmail: formData.buyerEmail ? formData.buyerEmail.trim() : '',
        
        // ✅ UPDATED: Include ALL seller fields with proper fallbacks
        sellerId: userData.id,
        sellerName: userData.fullName || userData.name || 'Seller',
        sellerEmail: userData.email || '',
        sellerPhone: userData.phoneNumber || userData.phone || '',
        // ✅ CRITICAL: Include location and business type with proper fallbacks
        sellerLocation: userData.location || userData.address || 'Location not specified',
        sellerBusinessType: userData.businessType || userData.businessCategory || 'Not specified',
        sellerBusinessName: userData.businessName || userData.companyName || 'Individual Seller',
        
        // Add expiration date (24 hours from now)
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('🔄 Sending payment link creation request...', payload);

      const response = await fetch('http://localhost:5000/api/payment-links/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);

      // Get response as text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log('📡 Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📡 Parsed response data:', data);
      } catch (e) {
        console.error('❌ JSON parse error:', e);
        throw new Error('Server returned an invalid JSON response. Please try again.');
      }

      if (!response.ok) {
        // Check if backend provides specific error about required fields
        if (data.message && data.message.includes('required')) {
          throw new Error(`Backend validation failed: ${data.message}`);
        }
        throw new Error(data.message || `Failed to create payment link (${response.status})`);
      }

      // CRITICAL FIX: Check if linkId exists in response
      if (!data.linkId) {
        console.error('❌ No linkId in response:', data);
        throw new Error('Backend did not return a link ID. Please check your backend implementation.');
      }

      // Generate the correct frontend URL
      const frontendBaseUrl = window.location.origin;
      const paymentLinkUrl = `${frontendBaseUrl}/buyer/pay/${data.linkId}`;
      
      console.log('✅ Payment link created successfully!');
      console.log('🔗 Link ID:', data.linkId);
      console.log('🌐 Frontend URL:', paymentLinkUrl);
      
      setGeneratedLink(paymentLinkUrl);
      setShowSuccessModal(true);
      
      // Reset form data after successful link generation
      resetForm();

    } catch (error) {
      console.error('❌ Error generating link:', error);
      setError(error.message || 'Failed to create payment link. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form completely
  const resetForm = () => {
    setFormData({
      productName: '',
      productDescription: '',
      productPrice: '',
      productImages: [],
      buyerName: '',
      buyerPhone: '',
      buyerEmail: ''
    });
    setCurrentStep(1);
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      // You could add a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Share link
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment for ${formData.productName}`,
          text: `Please pay Tsh ${parseInt(formData.productPrice).toLocaleString()} for ${formData.productName}`,
          url: generatedLink,
        });
      } catch (err) {
        // User cancelled share or error
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  // Preview link
  const previewLink = () => {
    window.open(generatedLink, '_blank', 'noopener,noreferrer');
  };

  // Create another link
  const createAnotherLink = () => {
    setShowSuccessModal(false);
    setGeneratedLink('');
    resetForm();
  };

  // Validation functions
  const validateStep1 = () => {
    const { productName, productDescription, productPrice } = formData;
    return productName.trim() && 
           productDescription.trim() && 
           productPrice && 
           parseFloat(productPrice) >= 1000;
  };

  const validateStep2 = () => {
    const { buyerName, buyerPhone } = formData;
    
    // Basic validation for step 2
    if (!buyerName.trim() || !buyerPhone.trim()) {
      return false;
    }
    
    // Additional phone validation
    const formattedPhone = formatPhoneNumber(buyerPhone);
    const phoneRegex = /^255\d{9}$/;
    return phoneRegex.test(formattedPhone);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Animated Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 2
              </span>
              <span className="text-sm text-gray-500">
                {currentStep === 1 ? 'Product Details' : 'Buyer Information'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: currentStep === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {currentStep === 1 && (
              <Step1Form 
                formData={formData}
                onInputChange={handleInputChange}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                onNext={nextStep}
                isValid={validateStep1()}
              />
            )}

            {currentStep === 2 && (
              <Step2Form 
                formData={formData}
                onInputChange={handleInputChange}
                onBack={prevStep}
                onGenerate={generateLink}
                isValid={validateStep2()}
                isLoading={isLoading}
                formatCurrency={formatCurrency}
                formatPhoneNumber={formatPhoneNumber}
              />
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          generatedLink={generatedLink}
          productName={formData.productName}
          productPrice={formData.productPrice}
          onCopy={copyToClipboard}
          onShare={shareLink}
          onPreview={previewLink}
          onCreateAnother={createAnotherLink}
          onClose={() => setShowSuccessModal(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </StableLayout>
  );
};

// Step 1 Component - Product Information
const Step1Form = ({ formData, onInputChange, onImageUpload, onRemoveImage, onNext, isValid }) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-green-600 font-semibold text-xs">1</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => onInputChange('productName', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
              placeholder="e.g., iPhone 13 Pro, T-shirts"
              maxLength={50}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.productName.length}/50 characters
          </p>
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Description *
          </label>
          <textarea
            value={formData.productDescription}
            onChange={(e) => onInputChange('productDescription', e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none text-sm"
            placeholder="Describe your product or service in detail..."
            maxLength={1000}
            required
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.productDescription.length}/1000 characters
          </p>
        </div>

        {/* Product Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Price (TZS) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={formData.productPrice}
              onChange={(e) => onInputChange('productPrice', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
              placeholder="0"
              min="1000"
              step="100"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum amount: Tsh 1,000</p>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images {formData.productImages.length > 0 && `(${formData.productImages.length}/5)`}
          </label>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-green-300 transition-colors">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">
              Drag & drop images or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-3">
              PNG, JPG up to 5MB each • Max 5 images
            </p>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={onImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-block bg-green-600 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              Choose Images
            </label>
          </div>

          {/* Uploaded Images Preview */}
          {formData.productImages.length > 0 && (
            <div className="mt-3">
              <div className="grid grid-cols-3 gap-2">
                {formData.productImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-16 object-contain bg-gray-50 rounded border border-gray-200"
                    />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <button
            onClick={onNext}
            disabled={!isValid}
            className="flex items-center bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Continue
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 2 Component - Buyer Information + Summary
const Step2Form = ({ formData, onInputChange, onBack, onGenerate, isValid, isLoading, formatCurrency, formatPhoneNumber }) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-green-600 font-semibold text-xs">2</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Buyer Information</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Buyer Information Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buyer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyer's Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) => onInputChange('buyerName', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                placeholder="Enter buyer's full name"
                required
              />
            </div>
          </div>

          {/* Buyer Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyer's Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={formData.buyerPhone}
                onChange={(e) => onInputChange('buyerPhone', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                placeholder="255123456789 or 0712345678"
                pattern="[0-9+]{10,15}"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter Tanzanian number (255123456789 or 0712345678)
            </p>
          </div>

          {/* Buyer Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyer's Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => onInputChange('buyerEmail', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                placeholder="Enter buyer's email address"
              />
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
            
            <div className="space-y-3">
              {/* Product Info */}
              <div className="pb-2 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Product</p>
                <p className="text-gray-900 font-medium text-sm truncate">{formData.productName}</p>
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{formData.productDescription}</p>
              </div>
              
              {/* Price */}
              <div className="pb-2 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Amount</p>
                <p className="text-lg font-bold text-green-600">
                  {formData.productPrice ? formatCurrency(parseFloat(formData.productPrice)) : 'Tsh 0'}
                </p>
              </div>
              
              {/* Images */}
              <div className="pb-2 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Images</p>
                {formData.productImages.length > 0 ? (
                  <div className="flex gap-1 mt-1">
                    {formData.productImages?.map((img, index) => (
                      <img
                        key={index}
                        src={img instanceof File ? URL.createObjectURL(img) : img}
                        alt={`Preview ${index + 1}`}
                        className="w-8 h-8 object-contain bg-gray-50 rounded border border-gray-200"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No images</p>
                )}
              </div>

              {/* Buyer Info */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Buyer</p>
                <div className="space-y-0.5">
                  <p className="text-gray-900 text-xs font-medium">{formData.buyerName || 'Not specified'}</p>
                  <p className="text-gray-600 text-xs">{formatPhoneNumber(formData.buyerPhone) || 'Not specified'}</p>
                  {formData.buyerEmail && (
                    <p className="text-gray-600 text-xs truncate">{formData.buyerEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between pt-4 mt-4 border-t border-gray-200 gap-3 sm:gap-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center text-gray-600 hover:text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 text-sm order-2 sm:order-1"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back
        </button>
        
        <button
          onClick={onGenerate}
          disabled={!isValid || isLoading}
          className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm min-w-[140px] order-1 sm:order-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-3 w-3 mr-1 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              Generate Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// SuccessModal Component
const SuccessModal = ({ generatedLink, productName, productPrice, onCopy, onShare, onPreview, onCreateAnother, onClose, formatCurrency }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-1.5 rounded mr-2">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Payment Link Created!</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
            <div className="flex items-start">
              <Check className="h-3 w-3 text-green-600 mr-1.5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 font-medium text-xs">
                  Success! Payment link for{" "}
                  <span className="font-semibold">"{productName}"</span>
                </p>
                <p className="text-green-700 text-xs mt-0.5">
                  Amount: <span className="font-semibold">{formatCurrency(parseFloat(productPrice))}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Link Display */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Payment Link
            </label>
            <div className="space-y-1.5">
              {/* Clickable Link */}
              <a 
                href={generatedLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-gray-50 border border-gray-300 rounded px-2 py-1.5 hover:bg-blue-50 hover:border-blue-300 transition-colors group text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <LinkIcon className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0 group-hover:text-blue-500" />
                    <p className="text-gray-600 truncate flex-1">
                      {generatedLink}
                    </p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400 ml-1 flex-shrink-0 group-hover:text-blue-500" />
                </div>
              </a>
              
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center space-x-1 py-1.5 rounded transition-colors text-xs ${
                  copied ? 'bg-green-500 text-white' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span className="font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={onPreview}
              className="flex items-center justify-center space-x-1 bg-white border border-gray-300 rounded px-2 py-1.5 hover:bg-gray-50 transition-colors text-xs"
            >
              <ExternalLink className="h-3 w-3 text-gray-600" />
              <span className="font-medium text-gray-700">Open</span>
            </button>
            
            <button
              onClick={onShare}
              className="flex items-center justify-center space-x-1 bg-white border border-gray-300 rounded px-2 py-1.5 hover:bg-gray-50 transition-colors text-xs"
            >
              <Share2 className="h-3 w-3 text-gray-600" />
              <span className="font-medium text-gray-700">Share</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={onCreateAnother}
            className="flex-1 bg-green-600 text-white py-2 font-medium hover:bg-green-700 transition-colors rounded-b-lg text-sm"
          >
            Create Another Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateLinkPage;