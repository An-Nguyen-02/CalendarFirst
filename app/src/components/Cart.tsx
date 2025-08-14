import React from 'react';
import { ShoppingCart, Plus, Minus, DollarSign } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, addToCart } = useAppContext();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-8">
      {/* Cart Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{totalItems} items in your cart</p>
          </div>
        </div>
      </div>

      {/* Cart Items Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cart Items</h2>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-500 text-sm mt-2">Add some products to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="text-4xl">{item.image}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                  <p className="text-emerald-600 font-semibold">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors duration-200 shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Section */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Checkout Summary</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-6">
              <span>Total: </span>
              <span className="text-emerald-600">${totalPrice.toFixed(2)}</span>
            </div>
            <button className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 