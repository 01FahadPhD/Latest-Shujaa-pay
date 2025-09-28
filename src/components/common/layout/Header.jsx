import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useRouter } from 'next/router';

const Header = ({ onMenuClick }) => {
  const router = useRouter();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = router.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('generate-link')) return 'Create Payment Link';
    if (path.includes('orders')) return 'Orders';
    if (path.includes('payouts')) return 'Payouts';
    if (path.includes('disputes')) return 'Disputes';
    if (path.includes('support')) return 'Support';
    return 'Shujaa Pay';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section - Menu button for mobile */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right section - User menu and notifications */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
            <div className="w-8 h-8 bg-primary-gradient rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;