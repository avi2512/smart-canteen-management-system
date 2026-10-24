import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { SidebarLayout } from './components/SidebarLayout';
import { useAuthStore } from './store';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { KitchenDashboard } from './components/KitchenDashboard';
import { CashierDashboard } from './components/CashierDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserRole } from './types';

function App() {
  const { user, setUser, currentRole, setRole } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleDirectPortalEntry = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      customer: 'Alex Student',
      kitchen_staff: 'Sarah Head Chef',
      cashier: 'John Register',
      manager: 'David Manager',
      super_admin: 'Admin Chief'
    };
    const mockUser = {
      id: role === 'customer' ? 'a87265c4-4b5c-443b-bd99-73894bfdf8d2' : `user-${role}-id`,
      email: `${role}@example.com`,
      role,
      user_metadata: { full_name: roleNames[role], role }
    };
    setRole(role);
    setUser(mockUser);
    toast.success(`Entered as ${roleNames[role]} (${role.replace('_', ' ')})`);
  };

  // Render the appropriate dashboard depending on the active simulated user role
  const renderActiveDashboard = () => {
    switch (currentRole) {
      case 'super_admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'cashier':
        return <CashierDashboard />;
      case 'kitchen_staff':
        return <KitchenDashboard />;
      case 'customer':
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-semibold text-sm',
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
          }
        }} 
      />

      {!user ? (
        // Render Landing Page & Auth Modal Overlay
        <>
          <LandingPage 
            onOpenAuth={() => setIsAuthModalOpen(true)} 
            onSelectPortal={handleDirectPortalEntry}
          />
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onSuccess={(loggedUser) => setUser(loggedUser)} 
          />
        </>
      ) : (
        // Render Canteen Dashboard Shell
        <SidebarLayout>
          {renderActiveDashboard()}
        </SidebarLayout>
      )}
    </>
  );
}

export default App;