import React, { useState, useEffect } from 'react';
import { 
  ChefHat, LayoutDashboard, Utensils, ClipboardList, Package, 
  Truck, Receipt, Bell, Shield, LogOut, Menu, X, Users, History, Award
} from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../store';
import { UserRole } from '../types';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { currentRole, setRole, profile, logout } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  // Tabs based on simulated role
  const getTabsByRole = () => {
    switch (currentRole) {
      case 'super_admin':
        return [
          { id: 'admin-dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
          { id: 'admin-users', label: 'User Role Control', icon: Users },
          { id: 'admin-audit', label: 'System Audit Logs', icon: Shield }
        ];
      case 'manager':
        return [
          { id: 'manager-dashboard', label: 'Overview & Inventory', icon: Package },
          { id: 'manager-menu', label: 'Menu Editor', icon: Utensils },
          { id: 'manager-suppliers', label: 'Supplier & Purchase', icon: Truck }
        ];
      case 'cashier':
        return [
          { id: 'cashier-pos', label: 'POS Terminal', icon: Receipt },
          { id: 'cashier-orders', label: 'Bill & Invoice logs', icon: ClipboardList }
        ];
      case 'kitchen_staff':
        return [
          { id: 'kitchen-orders', label: 'Live Order Queue', icon: ChefHat }
        ];
      case 'customer':
      default:
        return [
          { id: 'customer-menu', label: 'Order Menu', icon: Utensils },
          { id: 'customer-orders', label: 'Track Active Orders', icon: History },
          { id: 'customer-loyalty', label: 'Loyalty Rewards', icon: Award }
        ];
    }
  };

  const tabs = getTabsByRole();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden shadow-sm">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-gray-900 text-lg">Smart Canteen</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Notification Button */}
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
          {/* Hamburger Menu */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 md:static flex flex-col justify-between shadow-sm
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-100 hidden md:flex items-center space-x-3">
            <div className="p-1.5 bg-indigo-50 rounded-xl">
              <ChefHat className="h-7 w-7 text-indigo-600" />
            </div>
            <span className="font-bold text-gray-900 text-xl tracking-tight">Smart Canteen</span>
          </div>

          {/* User Profile */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700 text-sm shadow-inner">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-gray-900 text-sm truncate">{profile?.full_name || 'User Account'}</h4>
                <span className="text-xs text-gray-500 font-medium capitalize bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/50">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-5 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 px-2 mb-2 tracking-wider uppercase">Portal Navigation</p>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id || (!activeTabId && tab === tabs[0]);
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* Simulated Role Controller */}
          <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3">
            <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1.5">Simulate Role</label>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="block w-full text-xs font-semibold bg-white border border-indigo-200 text-indigo-900 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="customer">Customer Portal</option>
              <option value="kitchen_staff">Kitchen Panel</option>
              <option value="cashier">Cashier POS</option>
              <option value="manager">Manager Panel</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 hidden md:flex items-center justify-between shadow-sm shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {currentRole.replace('_', ' ')} Portal
            </h2>
            <p className="text-xs text-gray-500">Welcome back to Canteen Dashboard.</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Tray Button */}
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl relative transition"
            >
              <Bell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Guest User'}</p>
              <p className="text-xs text-indigo-600 font-medium capitalize">{currentRole.replace('_', ' ')}</p>
            </div>
          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Notification Drawer overlay */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsNotificationOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Notification Center</h3>
                </div>
                <button 
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Notification List */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[80vh]">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No notifications received.</p>
                ) : (
                  notifications.map((note) => (
                    <div 
                      key={note.id}
                      onClick={() => markAsRead(note.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        note.read_status 
                          ? 'bg-white border-gray-100 text-gray-600' 
                          : 'bg-indigo-50/55 border-indigo-100 text-gray-900 shadow-sm'
                      }`}
                    >
                      <h4 className="font-semibold text-sm">{note.title}</h4>
                      <p className="text-xs mt-1 leading-relaxed">{note.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {new Date(note.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
