import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Plus, ShoppingCart, HelpCircle } from 'lucide-react';

const BottomNav = () => {
  const router = useRouter();

  // In the BottomNav component, ensure the Create link is properly highlighted
const navigation = [
  { name: 'Home', href: '/seller/dashboard', icon: Home },
  { name: 'Create', href: '/seller/generate-link', icon: Plus },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Support', href: '/seller/support', icon: HelpCircle },
];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 flex-1 min-w-0 ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className="text-xs mt-1">{item.name}</span>
              {isActive && (
                <div className="w-1 h-1 bg-primary-600 rounded-full mt-1"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;