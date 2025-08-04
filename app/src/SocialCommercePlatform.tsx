import React, { useState, useEffect } from 'react';
import type { UserEvent, Product, Notification, CartItem, InventoryState, TabType } from './types';
import { initializeSampleData } from './data/sampleData';
import { useKafkaEventStream } from './hooks/useKafkaEventStream';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Cart from './components/Cart';

const SocialCommercePlatform: React.FC = () => {
  // Core state management
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inventory, setInventory] = useState<InventoryState>({});
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Initialize sample data
  useEffect(() => {
    const { products: sampleProducts, initialInventory } = initializeSampleData();
    setProducts(sampleProducts);
    setInventory(initialInventory);
  }, []);

  // Start Kafka event stream
  useKafkaEventStream({
    setUserEvents,
    setNotifications,
    setInventory,
    products
  });

  // Cart management functions
  const addToCart = (product: Product): void => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Generate add to cart event
    const event: UserEvent = {
      id: Date.now(),
      type: 'add_to_cart',
      userId: 'current_user',
      productId: product.id,
      timestamp: new Date().toISOString()
    };
    setUserEvents(prev => [event, ...prev.slice(0, 49)]);
  };

  const removeFromCart = (productId: number): void => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header
        cart={cart}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        setActiveTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        
        {/* Navigation Tabs */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cart={cart}
        />

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <Dashboard
            products={products}
            userEvents={userEvents}
            inventory={inventory}
            addToCart={addToCart}
          />
        )}
        {activeTab === 'cart' && (
          <Cart
            cart={cart}
            removeFromCart={removeFromCart}
            addToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};

export default SocialCommercePlatform;