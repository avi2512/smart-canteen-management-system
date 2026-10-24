# 🍽️ Smart Canteen Management System (CMS)

A modern, full-stack canteen and institutional dining management system built with **React**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Supabase**. Designed to digitize food courts in universities, tech campuses, and hospitals by connecting customers, counter cashiers, kitchen staff, and administrators into a unified real-time workflow.

---

## ✨ Features by Role

### 👤 1. Customer Portal
* **Digital Menu Card:** Interactive dishes categorized into Main Course, Snacks, Beverages, and Desserts with real-time availability.
* **Smart Shopping Cart:** Live cart updates, automatic quantity adjustments, and 18% standard GST calculation.
* **Multi-Channel Payments:** Support for UPI, Credit/Debit Cards, Cash, and Loyalty Points.
* **Live Order Tracking:** Real-time visual progress tracker showing orders moving from `Pending` ➔ `Preparing` ➔ `Ready for Collection`.
* **Loyalty Rewards Program:** Earn 1 point per $1 spent and redeem points on future meals.

### 👨‍🍳 2. Kitchen Display System (KDS)
* **Live Kanban Queue:** Three-tier active order board (`Incoming Queue`, `Preparing / Cooking`, and `Ready for Collection`).
* **One-Click Progression:** Cooks can advance orders seamlessly with "Accept & Cook", "Mark as Ready", and "Handover".
* **Auto-Polling:** Background queue updates to keep kitchen displays synchronized.

### 🧾 3. Cashier POS Terminal
* **Counter Walk-In Sales:** Fast one-click meal selection tailored for rapid checkout counters.
* **Instant Invoice Generation:** Automated order numbering and itemized summaries.
* **Printable Thermal Receipts:** Browser-native receipt formatting for counter printers.

### 📦 4. Manager Portal
* **Inventory Stock Tracking:** Monitor raw ingredient levels (Rice, Chicken, Cheese, Coffee Beans, Cooking Oil).
* **Automated Low-Stock Alerts:** Threshold warnings that notify staff when supplies drop below reorder levels.
* **Menu Card Editor:** Add, update, price, and toggle availability for dishes.
* **Supplier & Purchase Order Logs:** Track supplier contacts and restock transactions.

### 📊 5. Super Admin Dashboard
* **Visual Analytics:** Interactive revenue curves and dish popularity bar charts powered by [Recharts](https://recharts.org).
* **Role-Based Access Control (RBAC):** Manage user roles across the organization.
* **Security Audit Trail:** Immutable system logs tracking menu changes, stock adjustments, and administrative operations.

---

## 🛠️ Technology Stack

* **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
* **Charts & Analytics:** [Recharts](https://recharts.org/)
* **Notifications:** [React Hot Toast](https://react-hot-toast.com/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security & Triggers)
* **Offline Fallback:** Automatic mock storage engine in `localStorage` for offline demos and testing.
* **Deployment:** Pre-configured for [Cloudflare Pages](https://pages.cloudflare.com/) (SPA redirects included).

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/avi2512/smart-canteen-management-system.git
cd smart-canteen-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Note: If you do not have a Supabase project yet, the application will automatically fall back to its offline local mock database).*

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🗄️ Database Setup (Supabase)

If connecting to a live Supabase instance:
1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab.
3. Open [`supabase/canteen_system_schema.sql`](./supabase/canteen_system_schema.sql) from this repository.
4. Paste and run the entire script. It creates:
   * All tables (`CMS_profiles`, `CMS_categories`, `CMS_menu_items`, `CMS_inventory`, `CMS_suppliers`, `CMS_purchases`, `CMS_orders`, `CMS_order_items`, `CMS_payments`, `CMS_notifications`, `CMS_audit_logs`).
   * Row Level Security (RLS) policies for user, staff, and admin access.
   * PostgreSQL triggers for inventory auto-deduction, low stock notifications, and menu audit trails.

---

## 🌐 Deploying to Cloudflare Pages

This project is pre-configured with `public/_redirects` for Cloudflare Pages single-page application routing.

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create** ➔ **Pages** ➔ **Connect to Git**.
2. Select repository: `avi2512/smart-canteen-management-system`.
3. Set build configuration:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
4. Under **Environment variables**, optionally set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Click **Save and Deploy**.

---

## 🧪 Testing Roles & Features

* Click **Sign In** ➔ **Instant Demo Sign-In** on the landing page to enter immediately.
* Use the **Simulate Role** dropdown located at the bottom of the left sidebar to toggle between:
  * `Customer Portal`
  * `Kitchen Panel`
  * `Cashier POS`
  * `Manager Panel`
  * `Super Admin`

---

## 📄 Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint verification across source files |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
