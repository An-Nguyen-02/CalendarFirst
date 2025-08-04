import type { Product, InventoryState } from '../types';

export const initializeSampleData = (): { products: Product[]; initialInventory: InventoryState } => {
  const sampleProducts: Product[] = [
    { 
      id: 1, 
      name: 'Wireless Headphones', 
      price: 199, 
      category: 'Electronics', 
      views: 1250, 
      purchases: 45, 
      rating: 4.5,
      stock: 50,
      image: '🎧'
    },
    { 
      id: 2, 
      name: 'Smart Watch', 
      price: 299, 
      category: 'Electronics', 
      views: 980, 
      purchases: 32, 
      rating: 4.3,
      stock: 25,
      image: '⌚'
    },
    { 
      id: 3, 
      name: 'Running Shoes', 
      price: 129, 
      category: 'Sports', 
      views: 1100, 
      purchases: 67, 
      rating: 4.7,
      stock: 75,
      image: '👟'
    },
    { 
      id: 4, 
      name: 'Coffee Maker', 
      price: 89, 
      category: 'Home', 
      views: 750, 
      purchases: 28, 
      rating: 4.2,
      stock: 30,
      image: '☕'
    },
    { 
      id: 5, 
      name: 'Yoga Mat', 
      price: 49, 
      category: 'Sports', 
      views: 650, 
      purchases: 41, 
      rating: 4.6,
      stock: 100,
      image: '🧘'
    },
    { 
      id: 6, 
      name: 'Bluetooth Speaker', 
      price: 79, 
      category: 'Electronics', 
      views: 890, 
      purchases: 55, 
      rating: 4.4,
      stock: 60,
      image: '🔊'
    }
  ];

  // Initialize inventory tracking
  const initialInventory: InventoryState = {};
  sampleProducts.forEach(product => {
    initialInventory[product.id] = product.stock;
  });

  return { products: sampleProducts, initialInventory };
}; 