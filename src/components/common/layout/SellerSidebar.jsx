import React, { useState, useEffect } from 'react';
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
  const [sellerName, setSellerName] = useState('Seller Account');
  const [isLoading, setIsLoading] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: Home },
    { name: 'Create Link', href: '/seller/generate-link', icon: LinkIcon },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
    { name: 'Payouts', href: '/seller/payouts', icon: CreditCard },
    { name: 'Disputes', href: '/seller/disputes', icon: AlertCircle },
    { name: 'Support', href: '/seller/support', icon: HelpCircle },
  ];

  // Fetch seller data from localStorage and backend
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setIsLoading(true);
        
        // First try to get from localStorage (cached data)
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (userData.fullName || userData.name) {
          setSellerName(userData.fullName || userData.name);
        } else if (userData.id) {
          // If no name in localStorage but we have user ID, fetch from backend
          await fetchSellerFromBackend(userData.id);
        } else {
          setSellerName('Seller Account');
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setSellerName('Seller Account');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  // Fetch seller details from backend
  const fetchSellerFromBackend = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/sellers/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.seller) {
          const name = data.seller.fullName || data.seller.name;
          if (name) {
            setSellerName(name);
            // Update localStorage with fresh data
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
              ...currentUser,
              fullName: name,
              name: name
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching seller from backend:', error);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === 'Seller Account') return 'SA';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (href) => {
    if (onClose) onClose();
    router.push(href);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onClose) onClose();
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full isolate-sidebar">
      {/* Logo and close button - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white z-10">
        <div className="flex items-center">
          <span className="text-primary-600 font-bold text-xl">Shujaa Pay</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main scrollable content area */}
      <div className="flex-1 overflow-y-auto sidebar-scroll-container">
        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out relative group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 shadow-sm transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {/* Animated Background */}
                <div 
                  className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-100 opacity-100' 
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
                
                {/* Icon with Animation */}
                <div className={`relative z-10 p-1.5 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'bg-transparent text-gray-400 group-hover:text-gray-600'
                }`}>
                  <Icon 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} 
                  />
                </div>
                
                {/* Text */}
                <span className="relative z-10 ml-3 font-medium">
                  {item.name}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section - Scrolls with content */}
        <div className="border-t border-gray-200 p-4 mt-8">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center transition-colors hover:bg-primary-200">
                <span className="text-primary-600 font-medium text-xs">
                  {getInitials(sellerName)}
                </span>
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">
                {isLoading ? 'Loading...' : sellerName}
              </p>
              <p className="text-xs text-gray-500">Active Seller</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <div className="p-1 rounded transition-colors group-hover:bg-red-100">
              <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:scale-105" />
            </div>
            <span>Logout</span>
          </button>
        </div>

        {/* Extra padding at bottom for mobile safety */}
        <div className="h-20 lg:h-4"></div>
      </div>

      {/* Isolated sidebar styles */}
      <style jsx>{`
        /* Isolate sidebar completely from main content */
        .isolate-sidebar {
          position: relative;
          z-index: 40;
          contain: layout style paint;
          transform: translateZ(0);
        }
        
        .sidebar-scroll-container {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          contain: layout style paint;
          transform: translateZ(0);
        }
        
        /* Sidebar-specific scrollbar - won't affect other components */
        .sidebar-scroll-container::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        
        .sidebar-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .sidebar-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Hide scrollbar on mobile for cleaner look */
        @media (max-width: 1024px) {
          .sidebar-scroll-container::-webkit-scrollbar {
            display: none;
          }
          
          .sidebar-scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }

        /* Ensure sidebar height doesn't affect main content */
        .h-full {
          height: 100vh;
          height: 100dvh;
        }
      `}</style>
    </div>
  );
};

export default SellerSidebar;