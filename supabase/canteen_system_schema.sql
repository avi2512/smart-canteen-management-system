-- ==========================================
-- CANTEEN MANAGEMENT SYSTEM DATABASE SCHEMA
-- All tables are prefixed with CMS_ as requested
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CMS_profiles
CREATE TABLE IF NOT EXISTS public.CMS_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('super_admin', 'manager', 'cashier', 'kitchen_staff', 'customer')) DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CMS_categories
CREATE TABLE IF NOT EXISTS public.CMS_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CMS_menu_items
CREATE TABLE IF NOT EXISTS public.CMS_menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.CMS_categories(id) ON DELETE SET NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    availability BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CMS_inventory
CREATE TABLE IF NOT EXISTS public.CMS_inventory (
    id SERIAL PRIMARY KEY,
    item_name TEXT UNIQUE NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL, -- e.g. kg, pieces, liters
    reorder_level NUMERIC(10, 2) DEFAULT 10 NOT NULL CHECK (reorder_level >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CMS_suppliers
CREATE TABLE IF NOT EXISTS public.CMS_suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CMS_purchases
CREATE TABLE IF NOT EXISTS public.CMS_purchases (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES public.CMS_suppliers(id) ON DELETE CASCADE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CMS_orders
CREATE TABLE IF NOT EXISTS public.CMS_orders (
    id SERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.CMS_profiles(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending' NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CMS_order_items
CREATE TABLE IF NOT EXISTS public.CMS_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.CMS_orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id INTEGER REFERENCES public.CMS_menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

-- 9. CMS_payments
CREATE TABLE IF NOT EXISTS public.CMS_payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.CMS_orders(id) ON DELETE CASCADE NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'loyalty')) NOT NULL,
    transaction_reference TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. CMS_notifications
CREATE TABLE IF NOT EXISTS public.CMS_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.CMS_profiles(id) ON DELETE CASCADE, -- NULL means broad notification for admins/staff
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. CMS_audit_logs
CREATE TABLE IF NOT EXISTS public.CMS_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.CMS_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.CMS_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.CMS_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. CMS_profiles Policies
CREATE POLICY "Anyone can view user profiles" ON public.CMS_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.CMS_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super Admins can do everything on profiles" ON public.CMS_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- 2. CMS_categories & CMS_menu_items Policies
CREATE POLICY "Anyone can read categories" ON public.CMS_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read menu items" ON public.CMS_menu_items FOR SELECT USING (true);
CREATE POLICY "Managers and Super Admins can write categories" ON public.CMS_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
);
CREATE POLICY "Managers and Super Admins can write menu items" ON public.CMS_menu_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
);

-- 3. CMS_inventory, CMS_suppliers, CMS_purchases Policies
CREATE POLICY "Staff can view inventory" ON public.CMS_inventory FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager', 'kitchen_staff', 'cashier'))
);
CREATE POLICY "Managers and Super Admins can manage inventory" ON public.CMS_inventory FOR ALL USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
);
CREATE POLICY "Managers and Super Admins can manage suppliers" ON public.CMS_suppliers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
);
CREATE POLICY "Managers and Super Admins can manage purchases" ON public.CMS_purchases FOR ALL USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
);

-- 4. CMS_orders & CMS_order_items Policies
CREATE POLICY "Users can view their own orders" ON public.CMS_orders FOR SELECT USING (
    auth.uid() = customer_id OR EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager', 'cashier', 'kitchen_staff'))
);
CREATE POLICY "Customers and staff can create orders" ON public.CMS_orders FOR INSERT WITH CHECK (
    auth.uid() = customer_id 
    OR EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager', 'cashier'))
    OR customer_id IS NULL
);
CREATE POLICY "Staff can update orders" ON public.CMS_orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager', 'cashier', 'kitchen_staff'))
);

CREATE POLICY "Anyone can view order items" ON public.CMS_order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order items" ON public.CMS_order_items FOR INSERT WITH CHECK (true);

-- 5. CMS_payments, CMS_notifications, CMS_audit_logs Policies
CREATE POLICY "Anyone can view their own payments" ON public.CMS_payments FOR SELECT USING (true);
CREATE POLICY "Anyone can make a payment" ON public.CMS_payments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own notifications" ON public.CMS_notifications FOR SELECT USING (
    user_id = auth.uid() OR user_id IS NULL OR EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager'))
);
CREATE POLICY "System can insert notifications" ON public.CMS_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Super Admins can view audit logs" ON public.CMS_audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.CMS_profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "System can insert audit logs" ON public.CMS_audit_logs FOR INSERT WITH CHECK (true);

-- ==========================================
-- DATABASE TRIGGERS
-- ==========================================

-- Trigger A: Auto-create Profile on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.CMS_profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_canteen
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger B: Auto Deduct Inventory and Trigger Low-Stock Notification after Order Completion
CREATE OR REPLACE FUNCTION public.process_order_inventory()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
    inventory_exists BOOLEAN;
BEGIN
    -- Deduct inventory when status moves to 'accepted' or 'preparing'
    IF (NEW.status IN ('accepted', 'preparing') AND (OLD.status = 'pending' OR OLD.status IS NULL)) THEN
        FOR item_record IN 
            SELECT mi.name as item_name, oi.quantity 
            FROM public.CMS_order_items oi
            JOIN public.CMS_menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = NEW.id
        LOOP
            -- Check if item exists in inventory
            SELECT EXISTS(SELECT 1 FROM public.CMS_inventory WHERE item_name = item_record.item_name) INTO inventory_exists;
            
            IF inventory_exists THEN
                -- Deduct inventory
                UPDATE public.CMS_inventory
                SET quantity = quantity - item_record.quantity
                WHERE item_name = item_record.item_name;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_status_accepted
    AFTER UPDATE ON public.CMS_orders
    FOR EACH ROW EXECUTE FUNCTION public.process_order_inventory();

-- Trigger C: Low Stock Warning triggers Notification
CREATE OR REPLACE FUNCTION public.check_low_stock_level()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.quantity <= NEW.reorder_level AND (OLD.quantity > NEW.reorder_level OR OLD.quantity IS NULL)) THEN
        -- Insert a system notification
        INSERT INTO public.CMS_notifications (title, message)
        VALUES (
            'Low Stock Alert: ' || NEW.item_name,
            'The inventory item ' || NEW.item_name || ' has dropped to ' || NEW.quantity || ' ' || NEW.unit || ' (Reorder level is ' || NEW.reorder_level || '). Please restock.'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_inventory_level_change
    AFTER UPDATE OR INSERT ON public.CMS_inventory
    FOR EACH ROW EXECUTE FUNCTION public.check_low_stock_level();

-- Trigger D: Audit log for sensitive menu changes
CREATE OR REPLACE FUNCTION public.log_menu_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.CMS_audit_logs (action, entity)
        VALUES ('UPDATE_MENU_ITEM', 'Menu Item: ' || NEW.name || ' (Price changed from ' || OLD.price || ' to ' || NEW.price || ')');
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.CMS_audit_logs (action, entity)
        VALUES ('INSERT_MENU_ITEM', 'Menu Item: ' || NEW.name);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.CMS_audit_logs (action, entity)
        VALUES ('DELETE_MENU_ITEM', 'Menu Item: ' || OLD.name);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_menu_change
    AFTER INSERT OR UPDATE OR DELETE ON public.CMS_menu_items
    FOR EACH ROW EXECUTE FUNCTION public.log_menu_changes();
