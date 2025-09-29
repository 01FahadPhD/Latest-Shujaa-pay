import React from 'react';
import { Menu, Bell, User, Shield } from 'lucide-react';
import { useRouter } from 'next/router';

const Header = ({ onMenuClick, role = 'seller' }) => {
  const router = useRouter();

  // Get page title based on current route and role
  const getPageTitle = () => {
    const path = router.pathname;
    
    // Admin routes
    if (role === 'admin') {
      if (path.includes('dashboard')) return 'Admin Dashboard';
      if (path.includes('sellers')) return 'Sellers Management';
      if (path.includes('orders')) return 'Orders Management';
      if (path.includes('payouts')) return 'Payouts Management';
      if (path.includes('disputes')) return 'Disputes Management';
      if (path.includes('analytics')) return 'Reports & Analytics';
      if (path.includes('settings')) return 'Admin Settings';
      return 'Admin Panel';
    }
    
    // Seller routes
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('generate-link')) return 'Create Payment Link';
    if (path.includes('orders')) return 'Orders';
    if (path.includes('payouts')) return 'Payouts';
    if (path.includes('disputes')) return 'Disputes';
    if (path.includes('support')) return 'Support';
    return 'Shujaa Pay';
  };

  // Get user info based on role
  const getUserInfo = () => {
    if (role === 'admin') {
      return {
        name: 'Administrator',
        role: 'Super Admin',
        icon: Shield,
        bgColor: 'bg-gradient-to-r from-green-600 to-green-500',
        textColor: 'text-white'
      };
    }
    
    return {
      name: 'John Doe',
      role: 'Seller',
      icon: User,
      bgColor: 'bg-gradient-to-r from-green-600 to-green-500',
      textColor: 'text-white'
    };
  };

  const userInfo = getUserInfo();
  const UserIcon = userInfo.icon;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section - Menu button for mobile and page title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
              
              {/* Role badge */}
              {role === 'admin' && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </span>
              )}
            </div>
            
            {/* Breadcrumb or description */}
            <p className="hidden sm:block text-sm text-gray-500 mt-1">
              {role === 'admin' 
                ? 'Platform administration and management' 
                : 'Manage your business and payments'
              }
            </p>
          </div>
        </div>

        {/* Right section - User menu and notifications */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {userInfo.name}
              </p>
              <p className="text-xs text-gray-500">
                {userInfo.role}
              </p>
            </div>
            
            <div className={`w-8 h-8 ${userInfo.bgColor} rounded-full flex items-center justify-center shadow-sm`}>
              <UserIcon className={`h-4 w-4 ${userInfo.textColor}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile breadcrumb */}
      <div className="lg:hidden border-t border-gray-100 px-4 py-2">
        <p className="text-xs text-gray-500">
          {role === 'admin' 
            ? 'Platform administration' 
            : 'Business management'
          }
        </p>
      </div>
    </header>
  );
};

export default Header;