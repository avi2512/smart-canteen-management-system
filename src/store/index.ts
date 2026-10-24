import { create } from 'zustand';
import { MenuItem, Order, Notification, UserRole, Profile } from '../types';
import { apiService } from '../services/api';

// ==========================================
// AUTH STORE (with Role Simulation Toggle!)
// ==========================================
interface AuthState {
  user: any | null;
  profile: Profile | null;
  currentRole: UserRole;
  loading: boolean;
  initialized: boolean;
  setRole: (role: UserRole) => void;
  setUser: (user: any, profile?: Profile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  currentRole: 'customer', // Default active simulated role
  loading: false,
  initialized: true,
  setRole: (role) => set({ currentRole: role }),
  setUser: (user, profile) => set({ 
    user, 
    profile: profile || null,
    currentRole: profile ? profile.role : (user?.user_metadata?.role || user?.role || 'customer')
  }),
  logout: () => set({ user: null, profile: null, currentRole: 'customer' })
}));

// ==========================================
// SHOPPING CART STORE
// ==========================================
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, qty: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; gst: number; total: number; itemCount: number };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (menuItem) => set((state) => {
    const existing = state.items.find(i => i.menuItem.id === menuItem.id);
    if (existing) {
      return {
        items: state.items.map(i => 
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { menuItem, quantity: 1 }] };
  }),
  removeFromCart: (itemId) => set((state) => ({
    items: state.items.filter(i => i.menuItem.id !== itemId)
  })),
  updateQuantity: (itemId, qty) => set((state) => ({
    items: state.items.map(i => 
      i.menuItem.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i
    )
  })),
  clearCart: () => set({ items: [] }),
  getTotals: () => {
    const items = get().items;
    const subtotal = items.reduce((acc, curr) => acc + (curr.menuItem.price * curr.quantity), 0);
    const gst = subtotal * 0.18; // 18% standard GST
    const total = subtotal + gst;
    const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
    return { subtotal, gst, total, itemCount };
  }
}));

// ==========================================
// NOTIFICATIONS STORE
// ==========================================
interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  addNotification: (note: Omit<Notification, 'id' | 'read_status' | 'created_at'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await apiService.fetchNotifications();
      set({ notifications: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  markAsRead: async (id) => {
    await apiService.markNotificationAsRead(id);
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read_status: true } : n)
    }));
  },
  addNotification: (note) => set((state) => {
    const newNote: Notification = {
      ...note,
      id: Math.max(0, ...state.notifications.map(n => n.id)) + 1,
      read_status: false,
      created_at: new Date().toISOString()
    };
    return { notifications: [newNote, ...state.notifications] };
  })
}));

// ==========================================
// ORDERS STORE
// ==========================================
interface OrderState {
  orders: (Order & { items?: any[] })[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  placeOrder: (customerId: string | undefined, paymentMethod?: 'cash' | 'card' | 'upi' | 'loyalty') => Promise<Order | null>;
  changeStatus: (orderId: number, status: Order['status'], paymentStatus?: Order['payment_status']) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  fetchOrders: async () => {
    set({ loading: true });
    try {
      const data = await apiService.fetchOrders();
      set({ orders: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  placeOrder: async (customerId, paymentMethod) => {
    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) return null;

    const total = useCartStore.getState().getTotals().total;
    const orderItems = cartItems.map(item => ({
      menu_item_id: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.menuItem.price
    }));

    try {
      const newOrder = await apiService.createOrder(customerId, total, orderItems, paymentMethod);
      useCartStore.getState().clearCart();
      
      // Refresh order list
      const data = await apiService.fetchOrders();
      set({ orders: data });
      
      return newOrder;
    } catch {
      return null;
    }
  },
  changeStatus: async (orderId, status, paymentStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, status, paymentStatus);
      
      // Update local state directly
      set((state) => ({
        orders: state.orders.map(order => 
          order.id === orderId 
            ? { ...order, status, payment_status: paymentStatus || order.payment_status } 
            : order
        )
      }));
      
      // Sync notifications
      useNotificationStore.getState().fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  }
}));
