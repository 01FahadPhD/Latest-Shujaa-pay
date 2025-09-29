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
  ExternalLink
} from 'lucide-react';

const GenerateLinkPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [formData, setFormData] = useState({
    // Step 1 Data
    productName: '',
    productDescription: '',
    productPrice: '',
    productImages: [],
    
    // Step 2 Data
    buyerName: '',
    buyerPhone: '',
    buyerEmail: ''
  });

  // Handle input changes with proper event handling
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      productImages: [...prev.productImages, ...files]
    }));
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

 // In the generateLink function, replace the mock link with:
const generateLink = () => {
  if (validateStep2()) {
    // Generate a proper link ID
    const linkId = Math.random().toString(36).substr(2, 9);
    const paymentLink = `${window.location.origin}/buyer/pay/${linkId}`;
    setGeneratedLink(paymentLink);
    
    // Show success modal and clear form data
    setShowSuccessModal(true);
    resetForm();
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
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Share link
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Link - Shujaa Pay',
          text: `Pay for ${formData.productName} securely via Shujaa Pay`,
          url: generatedLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  // Preview link
  const previewLink = () => {
    window.open(generatedLink, '_blank');
  };

  // Create another link
  const createAnotherLink = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  // Validation functions
  const validateStep1 = () => {
    return formData.productName && formData.productDescription && formData.productPrice;
  };

  const validateStep2 = () => {
    return formData.buyerName && formData.buyerPhone;
  };

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Form Container with Step Indicator in Top Right */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* Step Indicator in Top Right Corner */}
            <div className="flex justify-end mb-6">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-600 mr-2">Step</span>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>

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
              />
            )}

          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          generatedLink={generatedLink}
          onCopy={copyToClipboard}
          onShare={shareLink}
          onPreview={previewLink}
          onCreateAnother={createAnotherLink}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </StableLayout>
  );
};

// Step 1 Component - Product Information
const Step1Form = ({ formData, onInputChange, onImageUpload, onRemoveImage, onNext, isValid }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Information</h2>
      
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => onInputChange('productName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Enter product name"
            />
          </div>
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description *
          </label>
          <textarea
            value={formData.productDescription}
            onChange={(e) => onInputChange('productDescription', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            placeholder="Describe your product or service"
          />
        </div>

        {/* Product Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Price (TZS) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={formData.productPrice}
              onChange={(e) => onInputChange('productPrice', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG up to 10MB
            </p>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg"
              onChange={onImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Choose Files
            </label>
          </div>

          {/* Uploaded Images Preview */}
          {formData.productImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Uploaded images ({formData.productImages.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {formData.productImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="flex justify-end pt-4">
          <button
            onClick={onNext}
            disabled={!isValid}
            className="flex items-center bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 2 Component - Buyer Information + Summary
const Step2Form = ({ formData, onInputChange, onBack, onGenerate, isValid }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Buyer Information</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Information Form */}
        <div className="space-y-6">
          {/* Buyer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer's Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) => onInputChange('buyerName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter buyer's full name"
              />
            </div>
          </div>

          {/* Buyer Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer's Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.buyerPhone}
                onChange={(e) => onInputChange('buyerPhone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="+255 XXX XXX XXX"
              />
            </div>
          </div>

          {/* Buyer Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer's Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => onInputChange('buyerEmail', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter buyer's email"
              />
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-800 mb-4">Summary</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-primary-600 font-medium">Product Name</p>
              <p className="text-primary-900">{formData.productName || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-primary-600 font-medium">Price</p>
              <p className="text-primary-900">
                {formData.productPrice ? `Tsh ${parseInt(formData.productPrice).toLocaleString()}` : 'Not provided'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-primary-600 font-medium">Images Uploaded</p>
              <p className="text-primary-900">{formData.productImages.length} images</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        
        <button
          onClick={onGenerate}
          disabled={!isValid}
          className="flex items-center bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="h-4 w-4 mr-2" />
          Generate Link
        </button>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ generatedLink, onCopy, onShare, onPreview, onCreateAnother, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Link Created!</h3>
              <p className="text-sm text-gray-600">Your secure payment link is ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Link Display */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Payment Link
          </label>
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 overflow-hidden">
              <p className="text-sm text-gray-600 truncate">{generatedLink}</p>
            </div>
            <button
              onClick={onCopy}
              className="bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 transition-colors"
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={onPreview}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Preview</span>
            </button>
            
            <button
              onClick={onShare}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Share</span>
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• The buyer will see your product details and images</li>
              <li>• Payment is secured through Shujaa Pay escrow</li>
              <li>• You'll be notified when payment is received</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={onCreateAnother}
            className="flex-1 bg-primary-500 text-white py-4 font-medium hover:bg-primary-600 transition-colors rounded-bl-xl"
          >
            Create Another Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateLinkPage;