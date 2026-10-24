import React, { useState, useEffect } from 'react';
import { 
  Truck, PlusCircle, AlertTriangle, DollarSign
} from 'lucide-react';
import { MenuItem, InventoryItem, Supplier, Category } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

export const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'menu' | 'suppliers'>('inventory');
  
  // States for database entities
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  // Form states
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuImg, setNewMenuImg] = useState('');

  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  const [purchaseSupplier, setPurchaseSupplier] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const loadAllData = async () => {
    try {
      const [invData, menuData, catData, supData, purData] = await Promise.all([
        apiService.fetchInventory(),
        apiService.fetchMenuItems(),
        apiService.fetchCategories(),
        apiService.fetchSuppliers(),
        apiService.fetchPurchases()
      ]);
      setInventory(invData);
      setMenuItems(menuData);
      setCategories(catData);
      setSuppliers(supData);
      setPurchases(purData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAdjustStock = async (itemId: number, currentQty: number, adjustment: number) => {
    const nextQty = Math.max(0, currentQty + adjustment);
    try {
      await apiService.updateInventoryStock(itemId, nextQty);
      toast.success('Stock quantity updated');
      loadAllData();
    } catch {
      toast.error('Failed to adjust stock');
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName || !newMenuPrice || !newMenuCategory) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      await apiService.createMenuItem({
        category_id: parseInt(newMenuCategory),
        name: newMenuName,
        price: parseFloat(newMenuPrice),
        description: newMenuDesc,
        image_url: newMenuImg || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        availability: true
      });
      toast.success('New menu item added successfully!');
      
      // Reset forms
      setNewMenuName('');
      setNewMenuPrice('');
      setNewMenuDesc('');
      setNewMenuImg('');
      loadAllData();
    } catch {
      toast.error('Failed to create menu item.');
    }
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await apiService.updateMenuItem(id, { availability: !currentStatus });
      toast.success('Availability status updated');
      loadAllData();
    } catch {
      toast.error('Failed to toggle status.');
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName || !newSupplierContact) return;

    try {
      await apiService.createSupplier(newSupplierName, newSupplierContact);
      toast.success('New supplier profile logged!');
      setNewSupplierName('');
      setNewSupplierContact('');
      loadAllData();
    } catch {
      toast.error('Failed to log supplier.');
    }
  };

  const handleLogPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseSupplier || !purchaseAmount) return;

    try {
      await apiService.createPurchase(parseInt(purchaseSupplier), parseFloat(purchaseAmount));
      toast.success('Purchase amount logged successfully.');
      setPurchaseAmount('');
      loadAllData();
    } catch {
      toast.error('Failed to log purchase.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab selection menu */}
      <div className="flex border-b border-gray-250">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'inventory' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Inventory Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'menu' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Menu Card Editor
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'suppliers' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Supplier & Purchases
        </button>
      </div>

      {activeTab === 'inventory' ? (
        /* Inventory Panel */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">Canteen Raw Material Stock Tracking</h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-250/20 font-bold flex items-center space-x-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Low-stock warnings trigger notifications</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Item Name</th>
                  <th className="px-6 py-4 text-left">Current Stock</th>
                  <th className="px-6 py-4 text-left">Reorder level</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-center">Adjust quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map(item => {
                  const isLow = item.quantity <= item.reorder_level;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-900">{item.item_name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-medium">
                        {item.reorder_level} {item.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isLow 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center space-x-1.5 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                          <button
                            onClick={() => handleAdjustStock(item.id, item.quantity, -5)}
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-600 transition"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, item.quantity, -1)}
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-600 transition"
                          >
                            -1
                          </button>
                          <span className="text-xs font-bold px-3 text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleAdjustStock(item.id, item.quantity, 1)}
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-600 transition"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, item.quantity, 5)}
                            className="px-2 py-1 bg-white hover:bg-gray-100 rounded text-xs font-semibold text-gray-600 transition"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'menu' ? (
        /* Menu Editor */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Menu items table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base font-bold">Menu Card Registry</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Item</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Price</th>
                    <th className="px-6 py-4 text-left">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menuItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                          <span className="font-bold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {categories.find(c => c.id === item.category_id)?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-700">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.availability)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                            item.availability 
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {item.availability ? 'Available' : 'Sold Out'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Menu Item form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2 border-b pb-3">
              <PlusCircle className="h-5 w-5 text-indigo-600" />
              <span>Create Menu Item</span>
            </h3>

            <form onSubmit={handleCreateMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="e.g. Garlic Toast"
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Price ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value)}
                  placeholder="e.g. 3.99"
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Category *</label>
                <select
                  required
                  value={newMenuCategory}
                  onChange={(e) => setNewMenuCategory(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Image URL (Optional)</label>
                <input
                  type="text"
                  value={newMenuImg}
                  onChange={(e) => setNewMenuImg(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="Summarize dish ingredients..."
                  className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Create and Register Item
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* Supplier & Purchases */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Supplier and purchase logs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Suppliers */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Registered Raw Food Suppliers</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Supplier Name</th>
                      <th className="px-6 py-4 text-left">Contact Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {suppliers.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{s.supplier_name}</td>
                        <td className="px-6 py-4 text-gray-500">{s.contact_info}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purchases */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Supplier Restock Expenditure Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Supplier</th>
                      <th className="px-6 py-4 text-left">Purchase Date</th>
                      <th className="px-6 py-4 text-left">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchases.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{p.supplier_name}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(p.purchase_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">${p.total_amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Supplier restock forms */}
          <div className="space-y-6">
            
            {/* Create Supplier profile */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2 border-b pb-3">
                <Truck className="h-5 w-5 text-indigo-600" />
                <span>Register Supplier</span>
              </h3>
              <form onSubmit={handleCreateSupplier} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="e.g. Fresh Veggies Ltd"
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Contact Information *</label>
                  <input
                    type="text"
                    required
                    value={newSupplierContact}
                    onChange={(e) => setNewSupplierContact(e.target.value)}
                    placeholder="Email or phone number"
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  Save Supplier Profile
                </button>
              </form>
            </div>

            {/* Log Restock Purchase */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2 border-b pb-3">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <span>Log restock Purchase</span>
              </h3>
              <form onSubmit={handleLogPurchase} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Select Supplier *</label>
                  <select
                    required
                    value={purchaseSupplier}
                    onChange={(e) => setPurchaseSupplier(e.target.value)}
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.supplier_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Amount Paid ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  Log restock Purchase
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
