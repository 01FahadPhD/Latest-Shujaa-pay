import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Plus, ShoppingCart, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
  const router = useRouter();

  // Only show bottom nav if path starts with /seller
  if (!router.pathname.startsWith('/seller')) {
    return null;
  }

  const navigation = [
    { 
      name: 'Home', 
      href: '/seller/dashboard', 
      icon: Home,
      activePaths: ['/seller/dashboard']
    },
    { 
      name: 'Create', 
      href: '/seller/generate-link', 
      icon: Plus,
      activePaths: ['/seller/generate-link']
    },
    { 
      name: 'Orders', 
      href: '/seller/orders', 
      icon: ShoppingCart,
      activePaths: ['/seller/orders', '/seller/orders/[id]']
    },
    { 
      name: 'Chat', 
      href: '/seller/support', 
      icon: MessageCircle,
      activePaths: ['/seller/support', '/seller/chat']
    },
    { 
      name: 'Profile', 
      href: '/seller/profile', 
      icon: User,
      activePaths: ['/seller/profile', '/seller/settings']
    },
  ];

  // Check if current path matches any of the active paths for an item
  const isActive = (item) => {
    return item.activePaths.some(path => 
      router.pathname === path || 
      router.pathname.startsWith(path + '/')
    );
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 z-40 pb-safe">
      <div className="flex justify-around items-stretch px-2 py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-2 flex-1 min-w-0 transition-all duration-300 ease-out group ${
                active 
                  ? 'text-primary-600 transform -translate-y-1' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {/* Animated Background */}
              <div 
                className={`absolute inset-0 rounded-2xl transition-all duration-300 ease-out ${
                  active 
                    ? 'bg-primary-50 scale-105 opacity-100' 
                    : 'opacity-0 group-hover:bg-gray-100 group-hover:opacity-100'
                }`}
              />
              
              {/* Icon Container */}
              <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                active 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                  : 'bg-transparent group-hover:bg-white group-hover:shadow-sm'
              }`}>
                <Icon
                  className={`h-5 w-5 transition-all duration-300 ${
                    active 
                      ? 'scale-110' 
                      : 'group-hover:scale-105'
                  }`}
                />
                
                {/* Notification Badge */}
                {item.name === 'Orders' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {item.name === 'Chat' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
              
              {/* Label */}
              <span 
                className={`relative z-10 text-xs font-medium mt-1 transition-all duration-300 ${
                  active 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                }`}
              >
                {item.name}
              </span>
              
              {/* Active Indicator */}
              {active && (
                <div className="absolute top-0 w-8 h-0.5 bg-primary-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for mobile devices */}
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;