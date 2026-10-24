import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, CreditCard, Clock, 
  Trash2, Plus, Minus, ArrowRight, Star
} from 'lucide-react';
import { useCartStore, useOrderStore, useAuthStore } from '../store';
import { MenuItem, Category, Order } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { items: cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotals } = useCartStore();
  const { orders, fetchOrders, placeOrder } = useOrderStore();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'loyalty'>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load Menu data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuData, catData] = await Promise.all([
          apiService.fetchMenuItems(),
          apiService.fetchCategories()
        ]);
        setMenuItems(menuData);
        setCategories(catData);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
    fetchOrders();
  }, []);

  const { subtotal, gst, total, itemCount } = getTotals();

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && item.availability;
  });

  // Customer order isolation (Filter only this user's orders)
  const currentCustomerId = user?.id || 'a87265c4-4b5c-443b-bd99-73894bfdf8d2';
  const customerOrders = orders.filter(o => !o.customer_id || o.customer_id === currentCustomerId);
  const activeOrders = customerOrders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));

  // Calculate Loyalty Points (1 point per dollar spent on completed orders)
  const loyaltyPoints = Math.floor(customerOrders.filter(o => o.status === 'completed' && o.payment_status === 'paid').reduce((acc, curr) => acc + curr.total_amount, 0));

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (paymentMethod === 'loyalty') {
      if (loyaltyPoints < total) {
        toast.error(`Insufficient loyalty points! You need ${Math.ceil(total)} points but currently have ${loyaltyPoints} points.`);
        return;
      }
    }

    setIsPlacingOrder(true);
    
    try {
      const order = await placeOrder(user?.id || currentCustomerId, paymentMethod);
      if (order) {
        toast.success(`Order placed successfully! Order Number: ${order.order_number}`);
      } else {
        toast.error('Failed to submit order. Please try again.');
      }
    } catch {
      toast.error('An error occurred during checkout.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200 animate-pulse';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Menu Column (Left) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search & Category Filter */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search delicious foods, snack bites, hot coffee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedCategory === null 
                  ? 'bg-indigo-600 text-white border-transparent' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  selectedCategory === cat.id 
                    ? 'bg-indigo-600 text-white border-transparent' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.length === 0 ? (
            <p className="col-span-2 text-center text-sm text-gray-500 py-12">No menu items found match your criteria.</p>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="relative h-44">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 border border-gray-100">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      addToCart(item);
                      toast.success(`Added ${item.name} to cart!`);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active Order Tracker */}
        {activeOrders.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600 animate-spin" />
              <span>Track Active Orders ({activeOrders.length})</span>
            </h3>
            
            <div className="divide-y divide-gray-100">
              {activeOrders.map((order) => (
                <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{order.order_number}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Total Amount: ${order.total_amount.toFixed(2)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="mt-4 flex items-center space-x-2">
                    <div className={`h-2 flex-1 rounded-full ${['pending', 'accepted', 'preparing', 'ready', 'completed'].includes(order.status) ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded-full ${['accepted', 'preparing', 'ready', 'completed'].includes(order.status) ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded-full ${['preparing', 'ready', 'completed'].includes(order.status) ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded-full ${['ready', 'completed'].includes(order.status) ? 'bg-green-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-1.5">
                    <span>Pending</span>
                    <span>Accepted</span>
                    <span>Preparing</span>
                    <span>Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart & Billing Column (Right) */}
      <div className="space-y-6">
        
        {/* Loyalty Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-md text-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Loyalty Rewards Program</p>
              <h3 className="text-2xl font-black mt-1">{loyaltyPoints} Points</h3>
            </div>
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Star className="h-6 w-6 text-yellow-300 fill-current" />
            </div>
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Earn 1 loyalty point for every $1 spent. Redeem points on checkouts for free meals!
          </p>
        </div>

        {/* Shopping Cart card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              <span>Cart ({itemCount})</span>
            </h3>
            {cartItems.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Cart Items list */}
          <div className="p-5 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">Your cart is empty. Add delicious meals above.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.menuItem.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="overflow-hidden pr-2">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{item.menuItem.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">${item.menuItem.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2.5 shrink-0">
                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-55">
                      <button 
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 px-2">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout billing details */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% Institution Tax)</span>
                  <span>${gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-950 pt-1.5 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['upi', 'card', 'cash', 'loyalty'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center space-x-1.5 transition ${
                        paymentMethod === method 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="h-3.5 w-3.5 shrink-0" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
              >
                <span>{isPlacingOrder ? 'Placing Order...' : 'Pay & Place Order'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
