import React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowLeft, Key } from 'lucide-react';
import { useState } from 'react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Responsive Container */}
      <div className="w-full max-w-md mx-auto">
        
        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          
          {/* Card Header with Brand Gradient */}
          <div className="bg-primary-gradient px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              {isSubmitted ? 'Check Your Email' : 'Reset Your Password'}
            </h2>
            <p className="text-white/90">
              {isSubmitted 
                ? 'We sent you a reset link' 
                : 'Enter your email to get started'
              }
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {!isSubmitted ? (
              /* Step 1: Email Input */
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Back to Login */}
                <Link 
                  href="/auth/login" 
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200 mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>

                {/* Instruction Text */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-6">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Email Field */}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[44px]"
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary-gradient hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Success Message */
              <div className="space-y-6 text-center">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                {/* Success Message */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-gray-600">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    The link will expire in 1 hour for security reasons.
                  </p>
                </div>

                {/* Additional Instructions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Can't find the email? Check your spam folder or try requesting a new link.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px]"
                  >
                    Send Another Link
                  </button>
                  
                  <Link 
                    href="/auth/login" 
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 min-h-[44px]"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {/* Support Text */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Need help?{' '}
                <Link href="/support" className="text-primary-600 hover:text-primary-500">
                  Contact our support team
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

        input:focus, button:focus {
          outline: 2px solid hsl(134, 61%, 41%);
          outline-offset: 2px;
        }

        /* Loading spinner animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;