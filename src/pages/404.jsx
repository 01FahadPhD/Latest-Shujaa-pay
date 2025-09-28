// src/pages/404.jsx
import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-primary-gradient p-4 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Home className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
        >
          <Home className="h-5 w-5 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;