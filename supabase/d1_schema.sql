-- ==========================================================
-- CLOUDFLARE D1 DATABASE SCHEMA & INITIAL SEED DATA
-- Canteen Management System (CMS)
-- ==========================================================

DROP TABLE IF EXISTS CMS_audit_logs;
DROP TABLE IF EXISTS CMS_notifications;
DROP TABLE IF EXISTS CMS_payments;
DROP TABLE IF EXISTS CMS_order_items;
DROP TABLE IF EXISTS CMS_orders;
DROP TABLE IF EXISTS CMS_purchases;
DROP TABLE IF EXISTS CMS_suppliers;
DROP TABLE IF EXISTS CMS_inventory;
DROP TABLE IF EXISTS CMS_menu_items;
DROP TABLE IF EXISTS CMS_categories;
DROP TABLE IF EXISTS CMS_profiles;

-- 1. Profiles
CREATE TABLE IF NOT EXISTS CMS_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('super_admin', 'manager', 'cashier', 'kitchen_staff', 'customer')) DEFAULT 'customer',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS CMS_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Menu Items
CREATE TABLE IF NOT EXISTS CMS_menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES CMS_categories(id) ON DELETE SET NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    availability INTEGER DEFAULT 1 NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Inventory
CREATE TABLE IF NOT EXISTS CMS_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT UNIQUE NOT NULL,
    quantity REAL DEFAULT 0 NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL,
    reorder_level REAL DEFAULT 10 NOT NULL CHECK (reorder_level >= 0),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 5. Suppliers
CREATE TABLE IF NOT EXISTS CMS_suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Purchases
CREATE TABLE IF NOT EXISTS CMS_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER REFERENCES CMS_suppliers(id) ON DELETE CASCADE,
    total_amount REAL NOT NULL CHECK (total_amount >= 0),
    purchase_date TEXT DEFAULT (datetime('now'))
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS CMS_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
    total_amount REAL NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 8. Order Items
CREATE TABLE IF NOT EXISTS CMS_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES CMS_orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES CMS_menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL CHECK (price >= 0)
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS CMS_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES CMS_orders(id) ON DELETE CASCADE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'loyalty')) NOT NULL,
    transaction_reference TEXT,
    amount REAL NOT NULL CHECK (amount >= 0),
    created_at TEXT DEFAULT (datetime('now'))
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS CMS_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS CMS_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now'))
);

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Default Profiles
INSERT INTO CMS_profiles (id, full_name, email, role) VALUES 
('a87265c4-4b5c-443b-bd99-73894bfdf8d2', 'Demo Customer', 'customer@example.com', 'customer'),
('b78365d4-4b5c-443b-bd99-73894bfdf8d3', 'Sarah Chef', 'kitchen@example.com', 'kitchen_staff'),
('c98265e4-4b5c-443b-bd99-73894bfdf8d4', 'John Register', 'cashier@example.com', 'cashier'),
('d08265f4-4b5c-443b-bd99-73894bfdf8d5', 'David Manager', 'manager@example.com', 'manager'),
('e18265g4-4b5c-443b-bd99-73894bfdf8d6', 'Admin Chief', 'admin@example.com', 'super_admin');

-- Categories
INSERT INTO CMS_categories (id, name, description) VALUES
(1, 'Main Course', 'Filling lunches and meals'),
(2, 'Snacks & Sides', 'Quick bites and savory sides'),
(3, 'Beverages', 'Hot and chilled drinks'),
(4, 'Desserts', 'Sweet bakery and treats');

-- Menu Items
INSERT INTO CMS_menu_items (id, category_id, name, description, price, image_url, availability) VALUES
(1, 1, 'Grilled Chicken Bowl', 'Lean grilled chicken over quinoa and fresh veggies', 9.99, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 1),
(2, 1, 'Vegetarian Buddha Bowl', 'Tahini dressed chickpeas, avocado, and brown rice', 8.49, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', 1),
(3, 1, 'Classic Beef Burger', 'Angus beef patty with cheddar, lettuce, and brioche bun', 7.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 1),
(4, 2, 'Loaded French Fries', 'Crisp fries topped with warm cheddar sauce and herbs', 4.99, 'https://images.unsplash.com/photo-1576107232684-1279f390859f', 1),
(5, 3, 'Iced Caramel Macchiato', 'Cold espresso layered with vanilla syrup and caramel drizzle', 3.99, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c', 1),
(6, 3, 'Fresh Orange Juice', 'Freshly cold-pressed sweet oranges', 3.49, 'https://images.unsplash.com/photo-1613478223719-2ab802602423', 1),
(7, 4, 'Chocolate Fudge Brownie', 'Warm chocolate fudge brownie with ganache drizzle', 2.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', 1);

-- Inventory
INSERT INTO CMS_inventory (id, item_name, quantity, unit, reorder_level) VALUES
(1, 'Rice', 45, 'kg', 15),
(2, 'Chicken Breast', 28, 'kg', 10),
(3, 'Cheese', 12, 'kg', 5),
(4, 'Cooking Oil', 22, 'liters', 8),
(5, 'Coffee Beans', 8, 'kg', 3);

-- Suppliers
INSERT INTO CMS_suppliers (id, supplier_name, contact_info) VALUES
(1, 'Green Valley Organic Farms', 'sales@greenvalley.com | +1 555-0192'),
(2, 'Metro Wholesale Dairy', 'orders@metrodairy.com | +1 555-0144'),
(3, 'RoastMasters Coffee Co', 'beans@roastmasters.com | +1 555-0178');

-- Audit Log Entry
INSERT INTO CMS_audit_logs (action, entity) VALUES
('SYSTEM_INITIALIZATION', 'Cloudflare D1 Canteen Database initialized successfully');
