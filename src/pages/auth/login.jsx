import React from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Responsive Container */}
      <div className="w-full max-w-md mx-auto"> {/* Desktop: 380px-420px */}
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          
          {/* Card Header with Brand Gradient */}
          <div className="bg-primary-gradient px-8 py-8 text-center"> {/* Desktop padding */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-white/90">
              Sign in to your seller account
            </p>
          </div>

          {/* Login Form */}
          <div className="px-8 py-8"> {/* Desktop padding */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Email/Phone Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                    placeholder="Enter your email or phone number"
                  />
                </div>
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

              {/* Sign In Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary-gradient hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px]"
                >
                  Sign in to your account
                </button>
              </div>

              {/* Create Account Link */}
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

        {/* Footer Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure escrow payments for African social commerce
          </p>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Mobile container adjustments */
          .max-w-md {
            max-width: 24rem; /* max-w-sm equivalent */
            padding-left: 1rem; /* px-4 */
            padding-right: 1rem; /* px-4 */
          }
          
          /* Reduced padding for mobile */
          .px-8 {
            padding-left: 1.5rem; /* px-6 */
            padding-right: 1.5rem; /* px-6 */
          }
          
          .py-8 {
            padding-top: 1.5rem; /* py-6 */
            padding-bottom: 1.5rem; /* py-6 */
          }
          
          /* Mobile font sizes */
          .text-2xl {
            font-size: 1.25rem; /* text-xl */
            line-height: 1.75rem;
          }
          
          .text-base {
            font-size: 0.875rem; /* text-sm */
            line-height: 1.25rem;
          }
        }

        /* Ensure proper touch targets */
        .min-h-\[44px\] {
          min-height: 44px;
        }

        /* Focus states for accessibility */
        input:focus, button:focus {
          outline: 2px solid hsl(134, 61%, 41%);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;