import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          Shujaa Pay
        </h1>
        <p className="text-xl text-gray-600 mb-8 font-medium">
          Secure escrow payments for African social commerce
        </p>
        <div className="space-y-4">
          <Link 
            href="/auth/login" 
            className="inline-block bg-primary-gradient text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Seller Login
          </Link>
          <div>
            <Link 
              href="/auth/signup" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create Seller Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;