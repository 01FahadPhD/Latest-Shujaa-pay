import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import the original Header component with no SSR to avoid hydration issues
const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => (
    <header className="bg-white shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile menu button skeleton */}
        <div className="lg:hidden p-2">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="flex-1 flex justify-between items-center">
          <div className="flex-1"></div> {/* Spacer */}
          
          <div className="flex items-center space-x-4">
            {/* Notifications skeleton */}
            <div className="p-2">
              <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* User profile skeleton */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden sm:block">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
});

// ClientSideHeader wrapper component
const ClientSideHeader = ({ onMenuClick, role }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During initial render, show nothing or a simple header to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Simple static header during SSR */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
            <div className="hidden sm:block">
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-3 w-16 bg-gray-100 rounded mt-1"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Once mounted on client, render the actual Header component
  return <Header onMenuClick={onMenuClick} role={role} />;
};

export default ClientSideHeader;