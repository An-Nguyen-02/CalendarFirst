import React from 'react';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';

const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, cart } = useAppContext();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8">
          {[
            { id: 'dashboard' as const, label: 'Dashboard', icon: TrendingUp },
            { id: 'cart' as const, label: 'Cart', icon: ShoppingCart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'cart' && cartItemCount > 0 && (
                <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navigation; 