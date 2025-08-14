import React, { useState, useEffect, useCallback } from 'react';
import type { UserEvent, Product, Notification, CartItem, InventoryState, TabType } from '../types';
import { initializeSampleData } from '../data/sampleData';
import { useKafkaEventStream } from '../hooks/useKafkaEventStream';
import { AppContext } from './AppContext';
import type { AppState } from './types';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Core state management
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inventory, setInventory] = useState<InventoryState>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Initialize sample data
  useEffect(() => {
    const { products: sampleProducts, initialInventory } = initializeSampleData();
    setProducts(sampleProducts);
    setInventory(initialInventory);
  }, []);

  // Start Kafka event stream
  const { isStreaming } = useKafkaEventStream({
    setUserEvents,
    setNotifications,
    setInventory,
    products
  });

  // Cart management functions
  const addToCart = useCallback((product: Product): void => {
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
  }, []);

  const removeFromCart = useCallback((productId: number): void => {
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
  }, []);

  // Notification management functions
  const markNotificationAsRead = useCallback((notificationId: number): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const clearAllNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  const contextValue: AppState = {
    // State
    userEvents,
    products,
    notifications,
    inventory,
    cart,
    activeTab,
    showNotifications,
    isStreaming,

    // Actions
    setActiveTab,
    setShowNotifications,
    addToCart,
    removeFromCart,
    markNotificationAsRead,
    clearAllNotifications,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
