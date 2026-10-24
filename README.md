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

## 🗄️ Database Setup (Cloudflare D1)

This project uses **Cloudflare D1**, a fast serverless SQL database running natively on Cloudflare's global edge network.

### Option A: Using the Cloudflare Dashboard (GUI)
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Storage & Databases** ➔ **D1 SQL Database**.
2. Click **Create database**, name it `smart-canteen-db`.
3. Click on your newly created database ➔ **Console**.
4. Copy the contents of [`database/d1_schema.sql`](./database/d1_schema.sql), paste it into the console, and click **Execute**.
5. Go to your Pages project ➔ **Settings** ➔ **Functions** ➔ **D1 database bindings**:
   * **Variable name:** `DB`
   * **D1 database:** `smart-canteen-db`

### Option B: Using Wrangler CLI
```bash
# 1. Create the D1 database
npx wrangler d1 create smart-canteen-db

# 2. Execute the schema migration and seed data
npx wrangler d1 execute smart-canteen-db --file=./database/d1_schema.sql
```

---

## 🌐 Deploying to Cloudflare Pages

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create** ➔ **Pages** ➔ **Connect to Git**.
2. Select repository: `avi2512/smart-canteen-management-system`.
3. Set build configuration:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
4. Click **Save and Deploy**. Cloudflare Pages will automatically compile the frontend and bind the serverless API functions in `/functions`.

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
