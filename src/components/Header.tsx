import React from 'react';
import { ChefHat } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChefHat className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Smart Canteen</h1>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                Dashboard
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                Menu
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                Feedback
              </button>
            </nav>
            {user ? (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
