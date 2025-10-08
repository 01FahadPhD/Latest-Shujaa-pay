import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error and success when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
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

  // Validate email format
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate based on login method
    if (loginMethod === 'email') {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        setError(emailError);
        return;
      }
    } else {
      const phoneError = validatePhoneNumber(formData.phoneNumber);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare login data - send both email and phoneNumber fields
      // Let the backend decide which one to use based on what's provided
      const loginData = {
        password: formData.password
      };

      if (loginMethod === 'email') {
        loginData.email = formData.email;
        // Also send phoneNumber as empty string to be safe
        loginData.phoneNumber = '';
      } else {
        // Format phone number with country code for backend
        loginData.phoneNumber = `+255${formData.phoneNumber}`;
        // Also send email as empty string to be safe
        loginData.email = '';
      }

      console.log('Sending login data:', loginData);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        // If the backend expects only 'email' field, try alternative approach
        if (data.message && data.message.includes('email')) {
          console.log('Backend expects email field, trying alternative...');
          await tryAlternativeLogin(loginData);
          return;
        }
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      handleLoginSuccess(data);

    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative login method if backend only accepts 'email' field
  const tryAlternativeLogin = async (loginData) => {
    try {
      // If backend only accepts 'email' field, we need to send phone number as email
      const alternativeData = {
        password: loginData.password
      };

      if (loginMethod === 'email') {
        alternativeData.email = loginData.email;
      } else {
        // Send phone number in the email field
        alternativeData.email = loginData.phoneNumber;
      }

      console.log('Trying alternative login with:', alternativeData);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alternativeData),
      });

      const data = await response.json();
      console.log('Alternative login response:', data);

      if (!response.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      handleLoginSuccess(data);

    } catch (error) {
      console.error('Alternative login error:', error);
      setError('Unable to login with phone number. Please try with email or contact support.');
    }
  };

  const handleLoginSuccess = (data) => {
    // Success! Store the token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Show smart success message
    setSuccess('Login successful! Redirecting to dashboard...');

    // Redirect after 1.5s
    setTimeout(() => {
      window.location.href = '/seller/dashboard';
    }, 1500);
  };

  // Switch between email and phone login
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setError('');
    setSuccess('');
    // Clear the other field when switching methods
    if (method === 'email') {
      setFormData(prev => ({ ...prev, phoneNumber: '' }));
    } else {
      setFormData(prev => ({ ...prev, email: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          
          {/* Header */}
          <div className="bg-primary-gradient px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
            <p className="text-white/90">Sign in to your seller account</p>
          </div>

          <div className="px-8 py-8">
            {/* Display Error or Success */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm text-center">{success}</p>
              </div>
            )}

            {/* Login Method Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => switchLoginMethod('email')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    loginMethod === 'email'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => switchLoginMethod('phone')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    loginMethod === 'phone'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email/Phone Field */}
              <div>
                <label htmlFor={loginMethod === 'email' ? 'email' : 'phoneNumber'} className="block text-sm font-medium text-gray-700 mb-2">
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                
                {loginMethod === 'email' ? (
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
                ) : (
                  <div>
                    <div className="flex">
                      {/* Country Code */}
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
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>
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
                    placeholder="Enter your password"
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
              </div>

              {/* Submit */}
              <div>
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
                      Signing In...
                    </div>
                  ) : (
                    'Sign in to your account'
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure escrow payments for African social commerce
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
      `}</style>
    </div>
  );
};

export default LoginPage;