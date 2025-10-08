import React from 'react';
import Link from 'next/link';
import { User, Building, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft, MapPin } from 'lucide-react';
import { useState } from 'react';

const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    businessName: '',
    businessType: '',
    location: '',
    
    // Step 2
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const businessTypes = [
    'Fashion & Clothing',
    'Electronics',
    'Beauty & Cosmetics',
    'Food & Beverages',
    'Arts & Crafts',
    'Home & Living',
    'Others'
  ];

  // Tanzania Regions including Zanzibar
  const tanzaniaRegions = [
    'Arusha',
    'Dar es Salaam',
    'Dodoma',
    'Geita',
    'Iringa',
    'Kagera',
    'Katavi',
    'Kigoma',
    'Kilimanjaro',
    'Lindi',
    'Manyara',
    'Mara',
    'Mbeya',
    'Morogoro',
    'Mtwara',
    'Mwanza',
    'Njombe',
    'Pemba North',
    'Pemba South',
    'Pwani',
    'Rukwa',
    'Ruvuma',
    'Shinyanga',
    'Simiyu',
    'Singida',
    'Songwe',
    'Tabora',
    'Tanga',
    'Zanzibar Central/South',
    'Zanzibar North',
    'Zanzibar Urban/West'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle phone number input with validation
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Remove leading 0 if present
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
    
    // Limit to 9 digits
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    
    setFormData({
      ...formData,
      phoneNumber: value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Format as XXX XXX XXX
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  // Validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
      return 'Phone number is required';
    }
    
    if (phoneNumber.length !== 9) {
      return 'Phone number must be 9 digits (excluding leading 0)';
    }
    
    if (phoneNumber.startsWith('0')) {
      return 'Phone number should not start with 0';
    }
    
    // Check if it's a valid Tanzanian mobile number pattern
    const validPrefixes = ['74', '75', '76', '77', '78', '79', '62', '65', '66', '67'];
    const prefix = phoneNumber.substring(0, 2);
    
    if (!validPrefixes.includes(prefix)) {
      return 'Please enter a valid Tanzanian mobile number';
    }
    
    return null;
  };

  // Validate password strength
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    
    return null;
  };

  // Check password strength and return requirements
  const getPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)
    };
    
    return requirements;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    // Basic validation for required fields
    if (formData.fullName && formData.businessType && formData.location) {
      setCurrentStep(2);
    } else {
      setError('Please fill all required fields');
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all required fields
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
      setError('Please fill all required fields');
      return;
    }

    // Validate phone number
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number with country code for backend
      const formattedPhoneNumber = `+255${formData.phoneNumber}`;

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          businessName: formData.businessName,
          businessType: formData.businessType,
          location: formData.location,
          phoneNumber: formattedPhoneNumber,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      // Success! Store the token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success message
      alert('Account created successfully! Redirecting to dashboard...');

      // Redirect to dashboard
      window.location.href = '/seller/dashboard';

    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToStep1 = () => {
    setCurrentStep(1);
    setError('');
  };

  // Get password requirements for display
  const passwordRequirements = getPasswordRequirements(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Responsive Container */}
      <div className="w-full max-w-md mx-auto">
        
        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          
          {/* Card Header with Brand Gradient */}
          <div className="bg-primary-gradient px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-white/90">
              {currentStep === 1 ? 'Step 1: Business Details' : 'Step 2: Security Setup'}
            </p>
            
            {/* Progress Indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step === currentStep 
                      ? 'bg-white scale-110' 
                      : step < currentStep 
                        ? 'bg-green-300' 
                        : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {currentStep === 1 ? (
              /* Step 1: User & Business Details */
              <form className="space-y-5" onSubmit={handleStep1Submit}>
                {/* Full Names */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Names *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Business Name (Optional) */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <div className="relative">
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      value={formData.businessType}
                      onChange={handleChange}
                      className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px] bg-white"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Region) *
                  </label>
                  <div className="relative">
                    <select
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px] bg-white"
                    >
                      <option value="">Select your region</option>
                      {tanzaniaRegions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary-gradient hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px]"
                >
                  Next
                </button>
              </form>
            ) : (
              /* Step 2: Security & Contact */
              <form className="space-y-5" onSubmit={handleStep2Submit}>
                {/* Back Button */}
                <button
                  type="button"
                  onClick={goBackToStep1}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200 mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to previous step
                </button>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    {/* Country Code - More prominent without icon */}
                    <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-100 text-gray-800 min-h-[44px]">
                      <span className="text-sm font-semibold">+255</span>
                    </div>
                    {/* Phone Input */}
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formatPhoneNumber(formData.phoneNumber)}
                      onChange={handlePhoneNumberChange}
                      className="block w-full pl-3 pr-3 py-3 text-base border border-gray-300 rounded-r-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="XXX XXX XXX"
                      maxLength={11} // 9 digits + 2 spaces
                      pattern="[0-9\s]{9,11}"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 9 digits without leading 0 (e.g., 74 123 4567)
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors duration-200 min-h-[44px]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                            One lowercase letter (a-z)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                            One uppercase letter (A-Z)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                            One number (0-9)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordRequirements.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-xs ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                            One special character (!@#$% etc.)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors duration-200 min-h-[44px]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px] ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary-gradient hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Trusted by sellers across Africa
          </p>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .max-w-md {
            max-width: 24rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .px-8 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          
          .py-8 {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
          }
          
          .text-2xl {
            font-size: 1.25rem;
            line-height: 1.75rem;
          }
          
          .text-base {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }
        }

        .min-h-\[44px\] {
          min-height: 44px;
        }

        input:focus, button:focus, select:focus {
          outline: 2px solid hsl(134, 61%, 41%);
          outline-offset: 2px;
        }

        /* Custom select arrow styling */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;