import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Link as LinkIcon, 
  ShoppingCart, 
  CreditCard, 
  AlertCircle, 
  HelpCircle,
  X,
  LogOut
} from 'lucide-react';

const SellerSidebar = ({ onClose }) => {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: Home },
    { name: 'Create Link', href: '/seller/generate-link', icon: LinkIcon },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
    { name: 'Payouts', href: '/seller/payouts', icon: CreditCard },
    { name: 'Disputes', href: '/seller/disputes', icon: AlertCircle },
    { name: 'Support', href: '/seller/support', icon: HelpCircle },
  ];

  const handleNavigation = (href) => {
    // All pages are now considered "existing" to avoid 404 redirects
    // We'll create placeholder pages for any that don't exist yet
    if (onClose) onClose();
    router.push(href);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    // For now, redirect to login page
    if (onClose) onClose();
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo and close button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-primary-gradient p-2 rounded-lg">
            <span className="text-white font-bold text-lg">SP</span>
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900">Shujaa Pay</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className="ml-3">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">SA</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Seller Account</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SellerSidebar;