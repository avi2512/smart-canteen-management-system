import React from 'react';
import { 
  ChefHat, Utensils, ArrowRight, Shield, Award, Sparkles, LogIn
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <ChefHat className="h-6 w-6 text-indigo-600 animate-bounce" />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">Smart Canteen</span>
        </div>
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#menu" className="hover:text-indigo-600 transition">Menu Highlights</a>
            <a href="#about" className="hover:text-indigo-600 transition">Institutional Solutuions</a>
          </nav>
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-indigo-250 transition transform hover:-translate-y-0.5"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-pink-100/30 rounded-full blur-3xl -z-10" />

        <div className="space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Future of Institutional Dining</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            Smart Dining <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
              For Smart Institutions
            </span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Eliminate canteen lines with real-time pre-ordering, cashier POS terminals, AI inventory warnings, and automated kitchen monitors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-bold shadow-lg hover:shadow-indigo-250 transition transform hover:-translate-y-0.5"
            >
              <span>Order Food Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-base font-bold transition transform hover:-translate-y-0.5"
            >
              <span>Explore Dashboard</span>
            </button>
          </div>
        </div>

        {/* Hero Image / Mock Interface */}
        <div className="relative">
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white">
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
              alt="Fresh Salad Salad Bowl" 
              className="w-full h-80 object-cover hover:scale-105 transition duration-700"
            />
            <div className="p-6 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-600 uppercase">Featured Menu</span>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200/50">In Stock</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Fresh Harvest Buddha Bowl</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A wholesome recipe of avocado, organic quinoa, sweet potato, and sesame vinaigrette.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 px-6 border-y border-slate-100">
        <div className="max-w-7xl w-full mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900">Comprehensive Management Suite</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every tool required to run high-volume food services in schools, offices, colleges, hospitals, and factories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 bg-slate-50 rounded-2xl space-y-4 hover:shadow-md transition">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <Utensils className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Real-time Pre-ordering</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Customers pre-order meals from their device and track updates, avoiding physical queues completely.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-50 rounded-2xl space-y-4 hover:shadow-md transition">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Role-based Access Dashboard</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Super Admins, Managers, Cashiers, Kitchen Staff, and Customers access custom interfaces suited to their tasks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-50 rounded-2xl space-y-4 hover:shadow-md transition">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Loyalty Rewards Program</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Automatic customer loyalty points calculations based on order checkout values. Redeemable for free meals.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center text-xs border-t border-slate-800">
        <p>© 2026 Smart Canteen Management System. All rights reserved.</p>
        <p className="mt-1 text-slate-500">Built for high-volume dining spaces with Supabase backend.</p>
      </footer>

    </div>
  );
};
