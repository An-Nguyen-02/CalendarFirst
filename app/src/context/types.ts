import type { UserEvent, Product, Notification, CartItem, InventoryState, TabType } from '../types';

export interface AppState {
  // Core state
  userEvents: UserEvent[];
  products: Product[];
  notifications: Notification[];
  inventory: InventoryState;
  cart: CartItem[];
  activeTab: TabType;
  showNotifications: boolean;
  isStreaming: boolean;

  // Actions
  setActiveTab: (tab: TabType) => void;
  setShowNotifications: (show: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  markNotificationAsRead: (notificationId: number) => void;
  clearAllNotifications: () => void;
}
