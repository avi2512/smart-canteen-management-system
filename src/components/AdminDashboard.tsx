import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, Users, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { apiService } from '../services/api';
import { AuditLog, Profile, UserRole } from '../types';
import { toast } from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'audit'>('analytics');
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    revenue: 1250.45,
    ordersToday: 24,
    activeUsersCount: 142,
    alerts: 2
  });

  const loadAdminData = async () => {
    try {
      const logs = await apiService.fetchAuditLogs();
      setAuditLogs(logs);

      const orders = await apiService.fetchOrders();
      const totalRev = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0);
      const today = new Date().toDateString();
      const countToday = orders.filter(o => new Date(o.created_at).toDateString() === today).length;

      // Fetch simulated users list
      const savedProfiles = localStorage.getItem('cms_mock_profiles');
      let loadedUsers: Profile[] = [];
      if (savedProfiles) {
        loadedUsers = JSON.parse(savedProfiles);
        setUsers(loadedUsers);
      } else {
        const defaultUsers: Profile[] = [
          { id: 'a87265c4-4b5c-443b-bd99-73894bfdf8d2', full_name: 'Demo Account', email: 'demo@example.com', role: 'customer', created_at: new Date().toISOString() },
          { id: 'b78365d4-4b5c-443b-bd99-73894bfdf8d3', full_name: 'Sarah Chef', email: 'sarah@canteen.com', role: 'kitchen_staff', created_at: new Date().toISOString() },
          { id: 'c98265e4-4b5c-443b-bd99-73894bfdf8d4', full_name: 'John Register', email: 'john@canteen.com', role: 'cashier', created_at: new Date().toISOString() },
          { id: 'd08265f4-4b5c-443b-bd99-73894bfdf8d5', full_name: 'David Manager', email: 'david@canteen.com', role: 'manager', created_at: new Date().toISOString() },
          { id: 'e18265g4-4b5c-443b-bd99-73894bfdf8d6', full_name: 'Admin Chief', email: 'admin@canteen.com', role: 'super_admin', created_at: new Date().toISOString() }
        ];
        localStorage.setItem('cms_mock_profiles', JSON.stringify(defaultUsers));
        loadedUsers = defaultUsers;
        setUsers(defaultUsers);
      }

      setStats({
        revenue: totalRev > 0 ? totalRev : 1250.45,
        ordersToday: countToday > 0 ? countToday : orders.length,
        activeUsersCount: loadedUsers.length || 5,
        alerts: 2
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const updated = { ...user, role: newRole };
        toast.success(`Updated ${user.full_name}'s role to ${newRole.toUpperCase()}`);
        return updated;
      }
      return user;
    });
    localStorage.setItem('cms_mock_profiles', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Save audit log
    const logs = localStorage.getItem('cms_mock_audit_logs');
    const logsList = logs ? JSON.parse(logs) : [];
    const newLog = {
      id: logsList.length + 1,
      action: 'UPDATE_USER_ROLE',
      entity: `User ID: ${userId} role changed to ${newRole}`,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cms_mock_audit_logs', JSON.stringify([...logsList, newLog]));
    loadAdminData();
  };

  // Recharts analytic data
  const revenueChartData = [
    { name: 'Jan', Sales: 4200, Profit: 1200 },
    { name: 'Feb', Sales: 3800, Profit: 980 },
    { name: 'Mar', Sales: 5100, Profit: 1800 },
    { name: 'Apr', Sales: 4800, Profit: 1450 },
    { name: 'May', Sales: 6200, Profit: 2300 },
    { name: 'Jun', Sales: 7500, Profit: 2800 }
  ];

  const popularityChartData = [
    { name: 'Chicken Bowl', count: 124 },
    { name: 'Buddha Bowl', count: 98 },
    { name: 'Classic Burger', count: 86 },
    { name: 'Loaded Fries', count: 64 },
    { name: 'Iced Latte', count: 156 },
    { name: 'Brownie', count: 48 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'analytics' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics & Graphs
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'users' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          User Role Control
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'audit' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          System Audit Logs
        </button>
      </div>

      {activeTab === 'analytics' ? (
        /* Analytics Tab */
        <div className="space-y-6">
          
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Revenue card */}
            <div className="bg-white rounded-xl border border-gray-150 p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Total Revenue</p>
                <h4 className="text-xl font-bold text-gray-900 mt-1">${stats.revenue.toFixed(2)}</h4>
              </div>
            </div>

            {/* Orders today */}
            <div className="bg-white rounded-xl border border-gray-150 p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Orders Today</p>
                <h4 className="text-xl font-bold text-gray-900 mt-1">{stats.ordersToday}</h4>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-xl border border-gray-150 p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Active Users</p>
                <h4 className="text-xl font-bold text-gray-900 mt-1">{stats.activeUsersCount}</h4>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl border border-gray-150 p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-amber-50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Inventory Alerts</p>
                <h4 className="text-xl font-bold text-gray-900 mt-1">{stats.alerts} Items</h4>
              </div>
            </div>

          </div>

          {/* Graphs panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-1">
                <span>Monthly Canteen Revenue ($ USD)</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Sales" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Item popularity bar chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-1">
                <span>Top Selling Menu Items popularity</span>
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      ) : activeTab === 'users' ? (
        /* User management tab */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">User Directory & Role Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-250 text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">User Name</th>
                  <th className="px-6 py-4 text-left">Email Address</th>
                  <th className="px-6 py-4 text-left">Current Role</th>
                  <th className="px-6 py-4 text-center">Change Permission Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-255">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{u.full_name}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-indigo-50 text-indigo-700">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                        className="text-xs bg-white border border-gray-200 text-gray-700 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      >
                        <option value="customer">Customer</option>
                        <option value="kitchen_staff">Kitchen Staff</option>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit logs view */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">Security Audit Logs</h3>
            <span className="text-xs text-red-600 bg-red-50 border border-red-200/20 px-3 py-1 rounded-full font-bold flex items-center space-x-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Immutable administrative records</span>
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No audit logs found.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-5 flex items-start justify-between hover:bg-gray-50/50 transition text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                      {log.action}
                    </span>
                    <p className="text-gray-900 font-medium pt-1">{log.entity}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
