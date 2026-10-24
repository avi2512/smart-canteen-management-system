import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, Receipt, ArrowRight, Printer
} from 'lucide-react';
import { MenuItem } from '../types';
import { apiService } from '../services/api';
import { useOrderStore } from '../store';
import { toast } from 'react-hot-toast';

export const CashierDashboard: React.FC = () => {
  const { orders, fetchOrders } = useOrderStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cashier POS cart state
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  
  // Printable receipt state
  const [printingOrder, setPrintingOrder] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const menuData = await apiService.fetchMenuItems();
        setMenuItems(menuData);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
    fetchOrders();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: number, qty: number) => {
    setCart(prev => prev.map(i => i.item.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const handleRemove = (id: number) => {
    setCart(prev => prev.filter(i => i.item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const gst = subtotal * 0.18; // 18% standard GST
  const total = subtotal + gst;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const orderItems = cart.map(i => ({
      menu_item_id: i.item.id,
      name: i.item.name,
      quantity: i.quantity,
      price: i.item.price
    }));

    try {
      // Create new customer order flagged as paid
      const order = await apiService.createOrder(
        undefined, // Walk-in customer has no profile
        total,
        orderItems,
        paymentMethod
      );

      // Trigger automatic preparation sequence
      await apiService.updateOrderStatus(order.id, 'accepted', 'paid');
      
      toast.success(`POS Order processed successfully! (${order.order_number})`);
      
      // Load into printing queue
      setPrintingOrder({
        ...order,
        items: orderItems.map(i => ({ ...i, menu_item_name: i.name }))
      });
      
      // Clear cart
      setCart([]);
      fetchOrders();
    } catch {
      toast.error('Failed to process POS order.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredMenu = menuItems.filter(item => 
    item.availability && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pos')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'pos' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          POS Billing Terminal
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'history' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Transaction History
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* POS Menu Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-7 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search menu items for quick POS checkout..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredMenu.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="bg-white rounded-xl border border-gray-150 p-4 text-left hover:border-indigo-600 hover:shadow-sm transition flex flex-col justify-between h-36"
                >
                  <div>
                    <h4 className="font-bold text-gray-950 text-sm line-clamp-2">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Price</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-black text-indigo-700 text-sm">${item.price.toFixed(2)}</span>
                    <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Checkout billing panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <span>Walk-in Order Cart</span>
              </h3>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCart([])}
                  className="text-xs text-red-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Cart list */}
            <div className="p-5 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">POS tray is empty. Click items to add.</p>
              ) : (
                cart.map(i => (
                  <div key={i.item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="overflow-hidden pr-2">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{i.item.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">${i.item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="flex items-center border rounded-lg p-0.5 bg-gray-50">
                        <button 
                          onClick={() => handleUpdateQty(i.item.id, i.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2">{i.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQty(i.item.id, i.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(i.item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & checkout */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-gray-55 space-y-4">
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% standard)</span>
                    <span>${gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-950 pt-1.5 border-t">
                    <span>Total Amount</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'card', 'upi'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold uppercase capitalize transition ${
                          paymentMethod === method 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  <span>Pay & Generate Receipt</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History log view */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Completed POS Invoice logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Order ID</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Payment Status</th>
                  <th className="px-6 py-4 text-left">Order Status</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">${order.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.payment_status === 'paid' ? 'bg-green-150 text-green-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold text-gray-700">{order.status}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setPrintingOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 font-bold text-xs"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Bill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice receipt simulator modal */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-gray-150 flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="font-bold text-gray-800 text-sm">Receipt Simulator</span>
              <button 
                onClick={() => setPrintingOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Receipt body */}
            <div id="thermal-receipt" className="p-6 bg-white space-y-4 font-mono text-xs text-gray-800">
              <div className="text-center space-y-1">
                <ChefHat className="h-6 w-6 text-indigo-600 mx-auto" />
                <h2 className="font-black text-sm uppercase">SMART CANTEEN INC.</h2>
                <p className="text-[10px] text-gray-400">123 Institutional Boulevard, Suite A</p>
                <p className="text-[10px] text-gray-400">Tel: (555) 019-2831</p>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1 text-[10px]">
                <p>Date: {new Date(printingOrder.created_at || Date.now()).toLocaleString()}</p>
                <p>Receipt #: {printingOrder.order_number}</p>
                <p>Register: POS Terminal 1</p>
                <p>Cashier: Simulated Manager</p>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-2">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-1">Item</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printingOrder.items && printingOrder.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-1">{item.menu_item_name || 'Dish'}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(printingOrder.total_amount / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% standard)</span>
                  <span>${(printingOrder.total_amount - (printingOrder.total_amount / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t">
                  <span>TOTAL</span>
                  <span>${printingOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-gray-300 space-y-2">
                <p className="text-[10px] font-bold">THANK YOU FOR YOUR PATRONAGE!</p>
                <p className="text-[9px] text-gray-400">Order is synced to Kitchen Monitor in real-time.</p>
              </div>
            </div>

            {/* Footer print action */}
            <div className="p-4 border-t bg-gray-50 flex space-x-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
