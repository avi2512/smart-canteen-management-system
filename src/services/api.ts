import { supabase } from '../lib/supabase';
import { 
  Category, MenuItem, InventoryItem, Supplier, 
  Purchase, Order, OrderItem, Payment, Notification, AuditLog
} from '../types';

const RECIPE_INGREDIENTS: Record<string, { ingredient: string; qty: number }[]> = {
  'Grilled Chicken Bowl': [{ ingredient: 'Chicken Breast', qty: 0.25 }, { ingredient: 'Rice', qty: 0.2 }],
  'Vegetarian Buddha Bowl': [{ ingredient: 'Rice', qty: 0.25 }, { ingredient: 'Cooking Oil', qty: 0.05 }],
  'Classic Beef Burger': [{ ingredient: 'Cheese', qty: 0.05 }],
  'Loaded French Fries': [{ ingredient: 'Cheese', qty: 0.1 }, { ingredient: 'Cooking Oil', qty: 0.1 }],
  'Iced Caramel Macchiato': [{ ingredient: 'Coffee Beans', qty: 0.03 }]
};

// ==========================================
// LOCAL STORAGE MOCK DATABASE (Graceful Fallback)
// ==========================================

const MOCK_STORAGE_KEYS = {
  CATEGORIES: 'cms_mock_categories',
  MENU_ITEMS: 'cms_mock_menu_items',
  INVENTORY: 'cms_mock_inventory',
  SUPPLIERS: 'cms_mock_suppliers',
  PURCHASES: 'cms_mock_purchases',
  ORDERS: 'cms_mock_orders',
  ORDER_ITEMS: 'cms_mock_order_items',
  PAYMENTS: 'cms_mock_payments',
  NOTIFICATIONS: 'cms_mock_notifications',
  AUDIT_LOGS: 'cms_mock_audit_logs',
  PROFILES: 'cms_mock_profiles'
};

const getLocalData = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Seeding
const seedMockDatabase = () => {
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.CATEGORIES)) {
    const categories: Category[] = [
      { id: 1, name: 'Main Course', description: 'Filling lunches and meals', created_at: new Date().toISOString() },
      { id: 2, name: 'Snacks & Sides', description: 'Quick bites and sides', created_at: new Date().toISOString() },
      { id: 3, name: 'Beverages', description: 'Hot and cold drinks', created_at: new Date().toISOString() },
      { id: 4, name: 'Desserts', description: 'Sweet treats', created_at: new Date().toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.CATEGORIES, categories);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.MENU_ITEMS)) {
    const menuItems: MenuItem[] = [
      { id: 1, category_id: 1, name: 'Grilled Chicken Bowl', description: 'Lean grilled chicken over quinoa and fresh veggies', price: 9.99, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', availability: true, created_at: new Date().toISOString() },
      { id: 2, category_id: 1, name: 'Vegetarian Buddha Bowl', description: 'Tahini dressed chickpeas, avocado, and brown rice', price: 8.49, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', availability: true, created_at: new Date().toISOString() },
      { id: 3, category_id: 1, name: 'Classic Beef Burger', description: 'Angus beef patty with cheddar, lettuce, tomato, and brioche bun', price: 7.99, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', availability: true, created_at: new Date().toISOString() },
      { id: 4, category_id: 2, name: 'Loaded French Fries', description: 'Crisp fries topped with cheese sauce, bacon bits, and chives', price: 4.99, image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f', availability: true, created_at: new Date().toISOString() },
      { id: 5, category_id: 3, name: 'Iced Caramel Macchiato', description: 'Espresso combined with vanilla syrup, milk, and caramel drizzle', price: 3.99, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c', availability: true, created_at: new Date().toISOString() },
      { id: 6, category_id: 3, name: 'Fresh Orange Juice', description: 'Freshly squeezed sweet oranges', price: 3.49, image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423', availability: true, created_at: new Date().toISOString() },
      { id: 7, category_id: 4, name: 'Chocolate Fudge Brownie', description: 'Warm rich chocolate brownie served dry or ready for ice cream', price: 2.99, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', availability: true, created_at: new Date().toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.MENU_ITEMS, menuItems);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.INVENTORY)) {
    const inventory: InventoryItem[] = [
      { id: 1, item_name: 'Grilled Chicken Bowl', quantity: 25, unit: 'portions', reorder_level: 5, updated_at: new Date().toISOString() },
      { id: 2, item_name: 'Vegetarian Buddha Bowl', quantity: 18, unit: 'portions', reorder_level: 4, updated_at: new Date().toISOString() },
      { id: 3, item_name: 'Classic Beef Burger', quantity: 3, unit: 'portions', reorder_level: 10, updated_at: new Date().toISOString() }, // Low stock
      { id: 4, item_name: 'Loaded French Fries', quantity: 45, unit: 'portions', reorder_level: 12, updated_at: new Date().toISOString() },
      { id: 5, item_name: 'Iced Caramel Macchiato', quantity: 50, unit: 'cups', reorder_level: 15, updated_at: new Date().toISOString() },
      { id: 6, item_name: 'Fresh Orange Juice', quantity: 30, unit: 'glasses', reorder_level: 8, updated_at: new Date().toISOString() },
      { id: 7, item_name: 'Chocolate Fudge Brownie', quantity: 2, unit: 'pieces', reorder_level: 8, updated_at: new Date().toISOString() } // Low stock
    ];
    setLocalData(MOCK_STORAGE_KEYS.INVENTORY, inventory);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.SUPPLIERS)) {
    const suppliers: Supplier[] = [
      { id: 1, supplier_name: 'Prime Ingredients Corp', contact_info: 'sales@primeingredients.com | +1 (555) 123-4567', created_at: new Date().toISOString() },
      { id: 2, supplier_name: 'Sweet Tooth Confectionery', contact_info: 'orders@sweettooth.com | +1 (555) 987-6543', created_at: new Date().toISOString() },
      { id: 3, supplier_name: 'Fresh Fruits & Greenery Co.', contact_info: 'logistics@freshgreen.com | +1 (555) 345-6789', created_at: new Date().toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.PURCHASES)) {
    const purchases: Purchase[] = [
      { id: 1, supplier_id: 1, total_amount: 350.00, purchase_date: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 2, supplier_id: 2, total_amount: 120.00, purchase_date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 3, supplier_id: 3, total_amount: 240.00, purchase_date: new Date(Date.now() - 86400000 * 1).toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.PURCHASES, purchases);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.ORDERS)) {
    const orders: Order[] = [
      { id: 1, customer_id: 'a87265c4-4b5c-443b-bd99-73894bfdf8d2', order_number: 'ORD-1001', status: 'completed', total_amount: 13.98, payment_status: 'paid', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
      { id: 2, customer_id: 'a87265c4-4b5c-443b-bd99-73894bfdf8d2', order_number: 'ORD-1002', status: 'ready', total_amount: 9.99, payment_status: 'paid', created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 3, customer_id: 'a87265c4-4b5c-443b-bd99-73894bfdf8d2', order_number: 'ORD-1003', status: 'preparing', total_amount: 16.98, payment_status: 'paid', created_at: new Date(Date.now() - 600000).toISOString() },
      { id: 4, customer_id: 'a87265c4-4b5c-443b-bd99-73894bfdf8d2', order_number: 'ORD-1004', status: 'pending', total_amount: 26.47, payment_status: 'unpaid', created_at: new Date().toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.ORDERS, orders);

    const orderItems: (OrderItem & { menu_item_name?: string })[] = [
      { id: 1, order_id: 1, menu_item_id: 1, quantity: 1, price: 9.99, menu_item_name: 'Grilled Chicken Bowl' },
      { id: 2, order_id: 1, menu_item_id: 5, quantity: 1, price: 3.99, menu_item_name: 'Iced Caramel Macchiato' },
      { id: 3, order_id: 2, menu_item_id: 1, quantity: 1, price: 9.99, menu_item_name: 'Grilled Chicken Bowl' },
      { id: 4, order_id: 3, menu_item_id: 3, quantity: 1, price: 7.99, menu_item_name: 'Classic Beef Burger' },
      { id: 5, order_id: 3, menu_item_id: 2, quantity: 1, price: 8.49, menu_item_name: 'Vegetarian Buddha Bowl' },
      { id: 6, order_id: 4, menu_item_id: 1, quantity: 2, price: 9.99, menu_item_name: 'Grilled Chicken Bowl' },
      { id: 7, order_id: 4, menu_item_id: 6, quantity: 1, price: 3.49, menu_item_name: 'Fresh Orange Juice' },
      { id: 8, order_id: 4, menu_item_id: 7, quantity: 1, price: 2.99, menu_item_name: 'Chocolate Fudge Brownie' }
    ];
    setLocalData(MOCK_STORAGE_KEYS.ORDER_ITEMS, orderItems);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.NOTIFICATIONS)) {
    const notifications: Notification[] = [
      { id: 1, title: 'Welcome to Smart Canteen!', message: 'Explore our role-based portal by switching user types.', read_status: false, created_at: new Date().toISOString() },
      { id: 2, title: 'Low Stock Alert: Classic Beef Burger', message: 'The inventory item Classic Beef Burger has dropped to 3 portions (Reorder level is 10).', read_status: false, created_at: new Date().toISOString() },
      { id: 3, title: 'Low Stock Alert: Chocolate Fudge Brownie', message: 'The inventory item Chocolate Fudge Brownie has dropped to 2 pieces (Reorder level is 8).', read_status: false, created_at: new Date().toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.AUDIT_LOGS)) {
    const logs: AuditLog[] = [
      { id: 1, action: 'SYSTEM_STARTUP', entity: 'System loaded successfully', timestamp: new Date().toISOString() }
    ];
    setLocalData(MOCK_STORAGE_KEYS.AUDIT_LOGS, logs);
  }
};

// Execute seeding
seedMockDatabase();

// Helper to push audit log locally
const addMockAuditLog = (action: string, entity: string) => {
  const logs = getLocalData<AuditLog[]>(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
  const newLog: AuditLog = {
    id: logs.length + 1,
    action,
    entity,
    timestamp: new Date().toISOString()
  };
  setLocalData(MOCK_STORAGE_KEYS.AUDIT_LOGS, [...logs, newLog]);
};

// Helper to check low stock locally
const checkMockLowStock = (item: InventoryItem) => {
  if (item.quantity <= item.reorder_level) {
    const notes = getLocalData<Notification[]>(MOCK_STORAGE_KEYS.NOTIFICATIONS, []);
    const newNote: Notification = {
      id: notes.length + 1,
      title: `Low Stock Alert: ${item.item_name}`,
      message: `The inventory item ${item.item_name} has dropped to ${item.quantity} ${item.unit} (Reorder level is ${item.reorder_level}).`,
      read_status: false,
      created_at: new Date().toISOString()
    };
    setLocalData(MOCK_STORAGE_KEYS.NOTIFICATIONS, [newNote, ...notes]);
  }
};

// ==========================================
// API SERVICE LAYER IMPLEMENTATION
// ==========================================

export const apiService = {
  // 1. Categories
  async fetchCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from('CMS_categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch {
      return getLocalData<Category[]>(MOCK_STORAGE_KEYS.CATEGORIES, []);
    }
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    try {
      const { data, error } = await supabase.from('CMS_categories').insert({ name, description }).select().single();
      if (error) throw error;
      return data;
    } catch {
      const list = getLocalData<Category[]>(MOCK_STORAGE_KEYS.CATEGORIES, []);
      const newItem: Category = {
        id: list.length + 1,
        name,
        description,
        created_at: new Date().toISOString()
      };
      setLocalData(MOCK_STORAGE_KEYS.CATEGORIES, [...list, newItem]);
      addMockAuditLog('INSERT_CATEGORY', `Category: ${name}`);
      return newItem;
    }
  },

  // 2. Menu Items
  async fetchMenuItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase.from('CMS_menu_items').select('*').order('id');
      if (error) throw error;
      return data || [];
    } catch {
      return getLocalData<MenuItem[]>(MOCK_STORAGE_KEYS.MENU_ITEMS, []);
    }
  },

  async createMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    try {
      const { data, error } = await supabase.from('CMS_menu_items').insert(item).select().single();
      if (error) throw error;
      return data;
    } catch {
      const list = getLocalData<MenuItem[]>(MOCK_STORAGE_KEYS.MENU_ITEMS, []);
      const newItem: MenuItem = {
        ...item,
        id: list.length + 1,
        created_at: new Date().toISOString()
      };
      setLocalData(MOCK_STORAGE_KEYS.MENU_ITEMS, [...list, newItem]);
      addMockAuditLog('INSERT_MENU_ITEM', `Menu Item: ${newItem.name}`);
      return newItem;
    }
  },

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const { data, error } = await supabase.from('CMS_menu_items').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch {
      const list = getLocalData<MenuItem[]>(MOCK_STORAGE_KEYS.MENU_ITEMS, []);
      let updated: MenuItem | null = null;
      const updatedList = list.map(item => {
        if (item.id === id) {
          updated = { ...item, ...updates };
          return updated;
        }
        return item;
      });
      setLocalData(MOCK_STORAGE_KEYS.MENU_ITEMS, updatedList);
      addMockAuditLog('UPDATE_MENU_ITEM', `Menu Item ID: ${id}`);
      return updated!;
    }
  },

  // 3. Inventory
  async fetchInventory(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase.from('CMS_inventory').select('*').order('item_name');
      if (error) throw error;
      return data || [];
    } catch {
      return getLocalData<InventoryItem[]>(MOCK_STORAGE_KEYS.INVENTORY, []);
    }
  },

  async updateInventoryStock(id: number, quantity: number): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase.from('CMS_inventory').update({ quantity, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch {
      const list = getLocalData<InventoryItem[]>(MOCK_STORAGE_KEYS.INVENTORY, []);
      let updated: InventoryItem | null = null;
      const updatedList = list.map(item => {
        if (item.id === id) {
          updated = { ...item, quantity, updated_at: new Date().toISOString() };
          checkMockLowStock(updated);
          return updated;
        }
        return item;
      });
      setLocalData(MOCK_STORAGE_KEYS.INVENTORY, updatedList);
      addMockAuditLog('UPDATE_INVENTORY', `Stock adjustment for Item ID: ${id} to ${quantity}`);
      return updated!;
    }
  },

  // 4. Orders
  async fetchOrders(): Promise<(Order & { items?: (OrderItem & { menu_item_name?: string })[] })[]> {
    try {
      const { data: orders, error: ordersError } = await supabase.from('CMS_orders').select('*').order('id', { ascending: false });
      if (ordersError) throw ordersError;
      
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase.from('CMS_order_items').select('*, CMS_menu_items(name)').eq('order_id', order.id);
        if (itemsError) return order;
        
        return {
          ...order,
          items: (items || []).map(item => ({
            ...item,
            menu_item_name: (item.CMS_menu_items as any)?.name
          }))
        };
      }));
      return ordersWithItems;
    } catch {
      const orders = getLocalData<Order[]>(MOCK_STORAGE_KEYS.ORDERS, []);
      const items = getLocalData<(OrderItem & { menu_item_name?: string })[]>(MOCK_STORAGE_KEYS.ORDER_ITEMS, []);
      
      const itemsByOrderId = items.reduce((acc, current) => {
        acc[current.order_id] = acc[current.order_id] || [];
        acc[current.order_id].push(current);
        return acc;
      }, {} as Record<number, any[]>);

      return orders.map(order => ({
        ...order,
        items: itemsByOrderId[order.id] || []
      })).sort((a, b) => b.id - a.id);
    }
  },

  async createOrder(
    customerId: string | undefined, 
    totalAmount: number, 
    items: { menu_item_id: number; name: string; quantity: number; price: number }[],
    paymentMethod?: 'cash' | 'card' | 'upi' | 'loyalty'
  ): Promise<Order> {
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase.from('CMS_orders').insert({
        customer_id: customerId,
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount,
        payment_status: paymentMethod ? 'paid' : 'unpaid'
      }).select().single();

      if (orderError) throw orderError;

      // 2. Add items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase.from('CMS_order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Add payment if processed
      if (paymentMethod) {
        await supabase.from('CMS_payments').insert({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: totalAmount,
          transaction_reference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }

      return order;
    } catch {
      // Local fallback
      const orders = getLocalData<Order[]>(MOCK_STORAGE_KEYS.ORDERS, []);
      const newOrderId = orders.length + 1;
      
      const newOrder: Order = {
        id: newOrderId,
        customer_id: customerId || 'a87265c4-4b5c-443b-bd99-73894bfdf8d2',
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount,
        payment_status: paymentMethod ? 'paid' : 'unpaid',
        created_at: new Date().toISOString()
      };
      setLocalData(MOCK_STORAGE_KEYS.ORDERS, [newOrder, ...orders]);

      // Save Order Items
      const localItems = getLocalData<(OrderItem & { menu_item_name?: string })[]>(MOCK_STORAGE_KEYS.ORDER_ITEMS, []);
      const newItems = items.map((item, idx) => ({
        id: localItems.length + idx + 1,
        order_id: newOrderId,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        menu_item_name: item.name
      }));
      setLocalData(MOCK_STORAGE_KEYS.ORDER_ITEMS, [...localItems, ...newItems]);

      // Deduct inventory locally using recipe mapping
      const inventoryList = getLocalData<InventoryItem[]>(MOCK_STORAGE_KEYS.INVENTORY, []);
      const deductions: Record<string, number> = {};

      items.forEach(orderItem => {
        const recipe = RECIPE_INGREDIENTS[orderItem.name];
        if (recipe) {
          recipe.forEach(rec => {
            deductions[rec.ingredient] = (deductions[rec.ingredient] || 0) + (rec.qty * orderItem.quantity);
          });
        } else {
          deductions[orderItem.name] = (deductions[orderItem.name] || 0) + orderItem.quantity;
        }
      });

      const updatedInventory = inventoryList.map(invItem => {
        const deductQty = deductions[invItem.item_name];
        if (deductQty !== undefined) {
          const updatedInv = { 
            ...invItem, 
            quantity: Math.max(0, parseFloat((invItem.quantity - deductQty).toFixed(2))),
            updated_at: new Date().toISOString()
          };
          checkMockLowStock(updatedInv);
          return updatedInv;
        }
        return invItem;
      });
      setLocalData(MOCK_STORAGE_KEYS.INVENTORY, updatedInventory);

      // Save Payments if paid
      if (paymentMethod) {
        const payments = getLocalData<Payment[]>(MOCK_STORAGE_KEYS.PAYMENTS, []);
        const newPayment: Payment = {
          id: payments.length + 1,
          order_id: newOrderId,
          payment_method: paymentMethod,
          transaction_reference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: totalAmount,
          created_at: new Date().toISOString()
        };
        setLocalData(MOCK_STORAGE_KEYS.PAYMENTS, [...payments, newPayment]);
      }

      // Notification
      const notes = getLocalData<Notification[]>(MOCK_STORAGE_KEYS.NOTIFICATIONS, []);
      const newNote: Notification = {
        id: notes.length + 1,
        title: 'New Order Received',
        message: `Order ${orderNumber} has been placed for a total of $${totalAmount.toFixed(2)}.`,
        read_status: false,
        created_at: new Date().toISOString()
      };
      setLocalData(MOCK_STORAGE_KEYS.NOTIFICATIONS, [newNote, ...notes]);

      addMockAuditLog('INSERT_ORDER', `Order: ${orderNumber} for $${totalAmount}`);
      return newOrder;
    }
  },

  async updateOrderStatus(id: number, status: Order['status'], paymentStatus?: Order['payment_status']): Promise<Order> {
    try {
      const updates: Partial<Order> = { status };
      if (paymentStatus) updates.payment_status = paymentStatus;

      const { data, error } = await supabase.from('CMS_orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch {
      const orders = getLocalData<Order[]>(MOCK_STORAGE_KEYS.ORDERS, []);
      let updatedOrder: Order | null = null;
      const updatedList = orders.map(order => {
        if (order.id === id) {
          updatedOrder = { ...order, status };
          if (paymentStatus) updatedOrder.payment_status = paymentStatus;
          return updatedOrder;
        }
        return order;
      });
      setLocalData(MOCK_STORAGE_KEYS.ORDERS, updatedList);

      // Create notification for status changes
      if (updatedOrder) {
        const notes = getLocalData<Notification[]>(MOCK_STORAGE_KEYS.NOTIFICATIONS, []);
        const newNote: Notification = {
          id: notes.length + 1,
          title: `Order Status Updated: ${status.toUpperCase()}`,
          message: `Your order ${(updatedOrder as Order).order_number} is now ${status}.`,
          read_status: false,
          created_at: new Date().toISOString()
        };
        setLocalData(MOCK_STORAGE_KEYS.NOTIFICATIONS, [newNote, ...notes]);
      }

      addMockAuditLog('UPDATE_ORDER_STATUS', `Order ID: ${id} set to ${status}`);
      return updatedOrder!;
    }
  },

  // 5. Suppliers & Purchases
  async fetchSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase.from('CMS_suppliers').select('*').order('supplier_name');
      if (error) throw error;
      return data || [];
    } catch {
      return getLocalData<Supplier[]>(MOCK_STORAGE_KEYS.SUPPLIERS, []);
    }
  },

  async createSupplier(name: string, contactInfo: string): Promise<Supplier> {
    try {
      const { data, error } = await supabase.from('CMS_suppliers').insert({ supplier_name: name, contact_info: contactInfo }).select().single();
      if (error) throw error;
      return data;
    } catch {
      const list = getLocalData<Supplier[]>(MOCK_STORAGE_KEYS.SUPPLIERS, []);
      const newItem: Supplier = {
        id: list.length + 1,
        supplier_name: name,
        contact_info: contactInfo,
        created_at: new Date().toISOString()
      };
      setLocalData(MOCK_STORAGE_KEYS.SUPPLIERS, [...list, newItem]);
      addMockAuditLog('INSERT_SUPPLIER', `Supplier: ${name}`);
      return newItem;
    }
  },

  async fetchPurchases(): Promise<(Purchase & { supplier_name?: string })[]> {
    try {
      const { data, error } = await supabase.from('CMS_purchases').select('*, CMS_suppliers(supplier_name)').order('purchase_date', { ascending: false });
      if (error) throw error;
      return data.map(item => ({
        ...item,
        supplier_name: (item.CMS_suppliers as any)?.supplier_name
      }));
    } catch {
      const purchases = getLocalData<Purchase[]>(MOCK_STORAGE_KEYS.PURCHASES, []);
      const suppliers = getLocalData<Supplier[]>(MOCK_STORAGE_KEYS.SUPPLIERS, []);
      return purchases.map(p => ({
        ...p,
        supplier_name: suppliers.find(s => s.id === p.supplier_id)?.supplier_name || 'Unknown Supplier'
      })).sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    }
  },

  async createPurchase(supplierId: number, totalAmount: number): Promise<Purchase> {
    try {
      const { data, error } = await supabase.from('CMS_purchases').insert({ supplier_id: supplierId, total_amount: totalAmount }).select().single();
      if (error) throw error;
      return data;
    } catch {
      const list = getLocalData<Purchase[]>(MOCK_STORAGE_KEYS.PURCHASES, []);
      const newItem: Purchase = {
        id: list.length + 1,
        supplier_id: supplierId,
        total_amount: totalAmount,
        purchase_date: new Date().toISOString()
      };
      setLocalData(MOCK_STORAGE_KEYS.PURCHASES, [newItem, ...list]);
      addMockAuditLog('INSERT_PURCHASE', `Purchase from Supplier ID: ${supplierId} for $${totalAmount}`);
      return newItem;
    }
  },

  // 6. Notifications
  async fetchNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase.from('CMS_notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return getLocalData<Notification[]>(MOCK_STORAGE_KEYS.NOTIFICATIONS, []);
    }
  },

  async markNotificationAsRead(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('CMS_notifications').update({ read_status: true }).eq('id', id);
      if (error) throw error;
    } catch {
      const list = getLocalData<Notification[]>(MOCK_STORAGE_KEYS.NOTIFICATIONS, []);
      const updated = list.map(item => item.id === id ? { ...item, read_status: true } : item);
      setLocalData(MOCK_STORAGE_KEYS.NOTIFICATIONS, updated);
    }
  },

  // 7. Audit Logs
  async fetchAuditLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase.from('CMS_audit_logs').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return getLocalData<AuditLog[]>(MOCK_STORAGE_KEYS.AUDIT_LOGS, []);
    }
  }
};
