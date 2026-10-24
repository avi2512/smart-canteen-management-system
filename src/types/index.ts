export type UserRole = 'super_admin' | 'manager' | 'cashier' | 'kitchen_staff' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface MenuItem {
  id: number;
  category_id?: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  availability: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  updated_at: string;
}

export interface Supplier {
  id: number;
  supplier_name: string;
  contact_info: string;
  created_at: string;
}

export interface Purchase {
  id: number;
  supplier_id: number;
  total_amount: number;
  purchase_date: string;
}

export interface Order {
  id: number;
  customer_id?: string;
  order_number: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: 'cash' | 'card' | 'upi' | 'loyalty';
  transaction_reference?: string;
  amount: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id?: string;
  title: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: string;
  action: string;
  entity: string;
  timestamp: string;
}
