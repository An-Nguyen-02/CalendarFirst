import { useState, useEffect, useCallback } from 'react';
import type { UserEvent, Notification, Product, InventoryState } from '../types';

interface UseKafkaEventStreamProps {
  setUserEvents: React.Dispatch<React.SetStateAction<UserEvent[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setInventory: React.Dispatch<React.SetStateAction<InventoryState>>;
  products: Product[];
}

export const useKafkaEventStream = ({
  setUserEvents,
  setNotifications,
  setInventory,
  products
}: UseKafkaEventStreamProps) => {
  const [isStreaming, setIsStreaming] = useState(false);

  // Stabilize the setter functions to prevent unnecessary re-renders
  const setUserEventsStable = useCallback(setUserEvents, []);
  const setNotificationsStable = useCallback(setNotifications, []);
  const setInventoryStable = useCallback(setInventory, []);

  useEffect(() => {
    const startStream = () => {
      setIsStreaming(true);
      
      const eventInterval = setInterval(() => {
        const eventTypes: UserEvent['type'][] = ['view', 'click', 'purchase', 'add_to_cart', 'wishlist_add'];
        const userIds: number[] = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
        const productIds: number[] = [1, 2, 3, 4, 5, 6];
        
        const newEvent: UserEvent = {
          id: Date.now() + Math.random(),
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          userId: userIds[Math.floor(Math.random() * userIds.length)],
          productId: productIds[Math.floor(Math.random() * productIds.length)],
          timestamp: new Date().toISOString(),
          sessionId: `session_${Math.floor(Math.random() * 1000)}`
        };
        
        setUserEventsStable(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
        
        // Generate notifications for important events
        if (newEvent.type === 'purchase') {
          const product = products.find(p => p.id === newEvent.productId);
          const notification: Notification = {
            id: Date.now(),
            message: `🎉 User ${newEvent.userId} purchased ${product?.name || 'a product'}!`,
            timestamp: new Date().toISOString(),
            type: 'purchase',
            read: false
          };
          setNotificationsStable(prev => [notification, ...prev.slice(0, 19)]);
          
          // Update inventory
          setInventoryStable(prev => ({
            ...prev,
            [newEvent.productId]: Math.max(0, (prev[newEvent.productId] || 0) - 1)
          }));
        }

        // Low stock notifications
        if (Math.random() > 0.95) { // Occasional inventory updates
          const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
          setInventoryStable(currentInventory => {
            const currentStock = currentInventory[randomProductId] || 0;
            if (currentStock < 10 && currentStock > 0) {
              const product = products.find(p => p.id === randomProductId);
              const notification: Notification = {
                id: Date.now() + 1,
                message: `⚠️ Low stock alert: ${product?.name} (${currentStock} left)`,
                timestamp: new Date().toISOString(),
                type: 'inventory',
                read: false
              };
              setNotificationsStable(prev => [notification, ...prev.slice(0, 19)]);
            }
            return currentInventory;
          });
        }
      }, 2000); // New event every 2 seconds

      return () => {
        clearInterval(eventInterval);
        setIsStreaming(false);
      };
    };

    const cleanup = startStream();
    return cleanup;
  }, [setUserEventsStable, setNotificationsStable, setInventoryStable, products]);

  return { isStreaming };
}; 