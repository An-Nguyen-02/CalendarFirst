import React from 'react';
import { ShoppingCart, Users, TrendingUp, Star, Activity, Eye, DollarSign } from 'lucide-react';
import type { Product, UserEvent, InventoryState } from '../types';

interface DashboardProps {
  products: Product[];
  userEvents: UserEvent[];
  inventory: InventoryState;
  addToCart: (product: Product) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  products,
  userEvents,
  inventory,
  addToCart
}) => {
  const getEventTypeColor = (type: UserEvent['type']): string => {
    switch (type) {
      case 'purchase': return 'bg-emerald-500';
      case 'add_to_cart': return 'bg-blue-500';
      case 'click': return 'bg-amber-500';
      case 'wishlist_add': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatEventType = (type: UserEvent['type']): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStockStatus = (stock: number): { text: string; className: string } => {
    if (stock > 20) {
      return { text: 'In Stock', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    } else if (stock > 10) {
      return { text: 'Low Stock', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    } else {
      return { text: 'Very Low', className: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your social commerce performance</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Key Metrics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Views</p>
                <p className="text-2xl font-bold text-blue-900">
                  {products.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Sales</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {products.reduce((sum, p) => sum + p.purchases, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Active Users</p>
                <p className="text-2xl font-bold text-purple-900">
                  {new Set(userEvents.slice(0, 20).map(e => e.userId)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-lg border border-amber-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-xl shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Revenue</p>
                <p className="text-2xl font-bold text-amber-900">
                  ${products.reduce((sum, p) => sum + (p.price * p.purchases), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Stream Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-red-100 rounded-lg">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Live User Activity</h2>
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {userEvents.slice(0, 20).map(event => {
            const product = products.find(p => p.id === event.productId);
            return (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <span className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)} shadow-sm`}></span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{product?.image || '📦'}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        User {event.userId} {formatEventType(event.type).toLowerCase()}
                      </span>
                      <p className="text-xs text-gray-600">{product?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const stockStatus = getStockStatus(inventory[product.id] || 0);
            const isOutOfStock = (inventory[product.id] || 0) === 0;
            
            return (
              <div key={product.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">{product.image}</div>
                  <h4 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h4>
                  <p className="text-gray-600 text-sm font-medium">{product.category}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-600">${product.price}</span>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-sm font-semibold text-amber-700">{product.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="font-medium">{product.views} views</span>
                    <span className="font-medium">{inventory[product.id] || 0} in stock</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="font-medium">{product.purchases} sold</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${stockStatus.className}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 