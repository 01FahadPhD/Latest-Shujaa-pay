import React, { useState } from 'react';
import Header from './Header';
import SellerSidebar from './SellerSidebar';
import BottomNav from './BottomNav';

const StableLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SellerSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={closeSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
            <SellerSidebar onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default StableLayout;