import React from 'react';
import { useAppContext } from './context/useAppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Cart from './components/Cart';

const SocialCommercePlatform: React.FC = () => {
  const { activeTab } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        
        {/* Navigation Tabs */}
        <Navigation />

        {/* Tab Content */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'cart' && <Cart />}
      </div>
    </div>
  );
};

export default SocialCommercePlatform;