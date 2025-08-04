export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  views: number;
  purchases: number;
  rating: number;
  stock: number;
  image: string;
}

export interface UserEvent {
  id: number;
  type: 'view' | 'click' | 'purchase' | 'add_to_cart' | 'wishlist_add';
  userId: number | string;
  productId: number;
  timestamp: string;
  sessionId?: string;
}

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  type: 'purchase' | 'inventory';
  read: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InventoryState {
  [productId: number]: number;
}

export type TabType = 'dashboard' | 'cart'; 