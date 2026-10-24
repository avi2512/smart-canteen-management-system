import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { SidebarLayout } from './components/SidebarLayout';
import { useAuthStore } from './store';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { KitchenDashboard } from './components/KitchenDashboard';
import { CashierDashboard } from './components/CashierDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const { user, setUser, currentRole } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
          <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />
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