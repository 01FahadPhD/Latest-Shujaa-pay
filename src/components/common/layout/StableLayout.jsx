import React, { useState } from 'react';
import ClientSideHeader from './ClientSideHeader';
import SellerSidebar from './SellerSidebar';
import AdminSidebar from './AdminSidebar';
import BottomNav from './BottomNav';

const StableLayout = ({ children, role = 'seller' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Determine which sidebar to use based on role
  const SidebarComponent = role === 'admin' ? AdminSidebar : SellerSidebar;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SidebarComponent />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={closeSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
            <SidebarComponent onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Use ClientSideHeader to avoid hydration issues */}
        <ClientSideHeader onMenuClick={() => setSidebarOpen(true)} role={role} />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          {children}
        </main>
        <BottomNav role={role} />
      </div>
    </div>
  );
};

export default StableLayout;