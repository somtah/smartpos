import React from 'react';
import { LayoutGrid, ShoppingCart, CreditCard, ClipboardList, Home, Menu, LogIn } from 'lucide-react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  title: string;
  onViewChange: (view: ViewType) => void;
  staffName?: string;
  staffImage?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  title,
  onViewChange,
  staffName,
  staffImage,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard' },
    { id: 'catalog' as ViewType, label: 'Catalog' },
    { id: 'inventory' as ViewType, label: 'Inventory' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-primary border-b border-white/10 shadow-xl shadow-black/20 flex items-center justify-between px-6 h-16">
      <div className="flex items-center gap-4">
        <button className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors active:scale-95 duration-150">
          <Menu size={24} />
        </button>
        <h1 className="font-sans tracking-tight text-white text-xl font-bold uppercase tracking-widest">
          {title || 'SmartPOS'}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`font-semibold text-sm transition-colors ${
                currentView === item.id ? 'text-secondary' : 'text-white/40 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden cursor-pointer hover:border-secondary transition-colors">
            <img
              alt={staffName ?? 'Staff Profile'}
              className="w-full h-full object-cover"
              src={
                staffImage ??
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
              }
            />
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="text-white/40 hover:text-error transition-colors p-2"
              title="Logout"
            >
              <LogIn className="rotate-180" size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: Home },
    { id: 'catalog' as ViewType, label: 'Catalog', icon: LayoutGrid },
    { id: 'cart' as ViewType, label: 'Cart', icon: ShoppingCart },
    { id: 'checkout' as ViewType, label: 'Checkout', icon: CreditCard },
    { id: 'inventory' as ViewType, label: 'Inventory', icon: ClipboardList },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-primary border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-2xl flex justify-around items-center h-20 px-4 pb-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 px-4 py-2 ${
              isActive 
                ? 'text-secondary bg-secondary/10 rounded-xl' 
                : 'text-white/40 hover:text-secondary/60'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} fillOpacity={0.2} />
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
