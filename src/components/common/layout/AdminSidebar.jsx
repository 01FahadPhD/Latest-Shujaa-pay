import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  Settings,
  BarChart3,
  X,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const AdminSidebar = ({ onClose }) => {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Sellers Management', href: '/admin/sellers', icon: Users },
    { name: 'Orders Management', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Payouts Management', href: '/admin/payouts', icon: CreditCard },
    { name: 'Disputes Management', href: '/admin/disputes', icon: Shield },
    { name: 'Reports & Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleNavigation = (href) => {
    if (onClose) onClose();
    router.push(href);
  };

  const handleLogout = () => {
    console.log('Admin logging out...');
    if (onClose) onClose();
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo and close button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-2 rounded-lg">
            <span className="text-white font-bold text-lg">SP</span>
          </div>
          <div className="ml-3">
            <span className="text-lg font-semibold text-gray-900 block">Shujaa Pay</span>
            <span className="text-xs text-gray-500">Admin Panel</span>
          </div>
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
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="ml-3">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin section */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">AD</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Administrator</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
        
        {/* System Status */}
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-xs text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            System Operational
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

export default AdminSidebar;