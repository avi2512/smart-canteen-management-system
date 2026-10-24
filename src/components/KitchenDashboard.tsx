import React, { useEffect } from 'react';
import { ChefHat, Check, Play, AlertCircle, ShoppingBag } from 'lucide-react';
import { useOrderStore } from '../store';
import { Order } from '../types';
import { toast } from 'react-hot-toast';

export const KitchenDashboard: React.FC = () => {
  const { orders, fetchOrders, changeStatus } = useOrderStore();

  useEffect(() => {
    fetchOrders();
    
    // Auto-polling interval for mock updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const handleUpdateStatus = async (orderId: number, nextStatus: Order['status'], paymentStatus?: Order['payment_status']) => {
    try {
      await changeStatus(orderId, nextStatus, paymentStatus);
      toast.success(`Order moved to ${nextStatus.toUpperCase()}`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const renderOrderCard = (order: any, actionButton: React.ReactNode) => (
    <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition space-y-3.5">
      <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
        <div>
          <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
          <span className="text-[10px] text-gray-400 block">{new Date(order.created_at).toLocaleTimeString()}</span>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
          ${order.total_amount.toFixed(2)}
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-1.5 text-xs text-gray-600">
        {order.items && order.items.length > 0 ? (
          order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-1.5 rounded-lg">
              <span className="font-semibold text-gray-800">{item.menu_item_name || 'Dish'}</span>
              <span className="text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 font-bold">
                x{item.quantity}
              </span>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-gray-400 italic">No items retrieved.</p>
        )}
      </div>

      <div className="pt-2 border-t border-gray-50">
        {actionButton}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Overview stats header */}
      <div className="grid grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-gray-100">
        <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100/50">
          <span className="text-2xl font-black text-amber-700">{pendingOrders.length}</span>
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">Pending</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-indigo-50 border border-indigo-100/50">
          <span className="text-2xl font-black text-indigo-700">{preparingOrders.length}</span>
          <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mt-0.5">Preparing</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100/50">
          <span className="text-2xl font-black text-green-700">{readyOrders.length}</span>
          <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider mt-0.5">Ready for Collection</p>
        </div>
      </div>

      {/* Kanban Board columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Pending */}
        <div className="bg-gray-100/60 p-4 rounded-2xl border border-gray-200/50 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Incoming Queue ({pendingOrders.length})</span>
            </h3>
          </div>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8 bg-white border border-dashed rounded-xl">No pending orders.</p>
            ) : (
              pendingOrders.map(order => 
                renderOrderCard(order, (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Accept & Cook</span>
                  </button>
                ))
              )
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="bg-indigo-50/20 p-4 rounded-2xl border border-indigo-100/30 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100/40 pb-2">
            <h3 className="font-bold text-indigo-900 text-sm flex items-center space-x-1.5">
              <ChefHat className="h-4 w-4 text-indigo-500" />
              <span>Preparing / Cooking ({preparingOrders.length})</span>
            </h3>
          </div>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8 bg-white border border-dashed rounded-xl">No dishes currently cooking.</p>
            ) : (
              preparingOrders.map(order => 
                renderOrderCard(order, (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark as Ready</span>
                  </button>
                ))
              )
            )}
          </div>
        </div>

        {/* Column 3: Ready */}
        <div className="bg-green-50/10 p-4 rounded-2xl border border-green-100/20 space-y-4">
          <div className="flex items-center justify-between border-b border-green-100/30 pb-2">
            <h3 className="font-bold text-green-900 text-sm flex items-center space-x-1.5">
              <ShoppingBag className="h-4 w-4 text-green-500" />
              <span>Ready for Collection ({readyOrders.length})</span>
            </h3>
          </div>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8 bg-white border border-dashed rounded-xl">No orders awaiting collection.</p>
            ) : (
              readyOrders.map(order => 
                renderOrderCard(order, (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed', 'paid')}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm Picked Up</span>
                  </button>
                ))
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
