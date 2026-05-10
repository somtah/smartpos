import React, { useState } from 'react';
import { Plus, Key, LogOut, TrendingUp, ChevronRight, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

type DashboardStats = {
  revenue: number;
  orders: number;
  target: number;
  averageTicket: number;
  growth: number;
};

type DashboardTransaction = {
  id: string;
  name: string;
  amount: number;
  status: string;
  time: string;
};

interface DashboardProps {
  onViewChange: (view: 'dashboard' | 'catalog' | 'inventory' | 'cart' | 'checkout') => void;
  onEndShift: () => void;
  stats: DashboardStats;
  transactions: DashboardTransaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onViewChange,
  onEndShift,
  stats,
  transactions,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    setTimeout(() => setDrawerOpen(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-7xl mx-auto p-6 pt-24 mb-24"
    >
      {/* Dashboard Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-h2 font-bold text-primary tracking-tight mb-1">Station Dashboard</h2>
          <p className="text-on-primary-container font-medium">Monday, Oct 23 • Station 04 • <span className="text-secondary font-bold text-lg inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Online</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => onViewChange('catalog')}
            className="h-12 px-6 bg-secondary text-white font-semibold rounded-lg shadow-lg shadow-secondary/20 flex items-center gap-2 active:scale-95 transition-all hover:brightness-110"
          >
            <Plus size={18} /> New Order
          </button>
          <button 
            onClick={handleOpenDrawer}
            className={`h-12 px-6 border-2 font-semibold rounded-lg shadow-sm flex items-center gap-2 active:scale-95 transition-all ${
              drawerOpen ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-outline-variant text-primary hover:bg-slate-50'
            }`}
          >
            <Key size={18} className={drawerOpen ? 'animate-bounce' : ''} /> 
            {drawerOpen ? 'Drawer Open' : 'Open Drawer'}
          </button>
          <button 
            onClick={onEndShift}
            className="h-12 px-4 border-2 border-red-100 text-error font-semibold rounded-lg flex items-center gap-2 active:scale-95 transition-all hover:bg-red-50"
          >
            <LogOut size={18} /> End Shift
          </button>
        </div>
      </div>

      {/* Sales Summary Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant p-8 shadow-card relative overflow-hidden group">
          <div className="relative z-10">
            <p className="label-caps text-outline mb-3">TOTAL REVENUE (TODAY)</p>
            <p className="price-display text-primary">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-2 mt-6">
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                <TrendingUp size={16} />
                <span>+{stats.growth}%</span>
              </div>
              <span className="text-on-surface-variant text-sm font-medium">vs. previous day average</span>
            </div>
          </div>
          {/* Decorative Wave */}
          <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-[0.03] pointer-events-none translate-y-1/4 group-hover:translate-y-0 transition-transform duration-700">
            <svg className="w-full h-full" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,160 C120,200 240,40 400,100 L400,200 L0,200 Z" fill="#4648d4"></path>
            </svg>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-8 flex flex-col justify-between shadow-card">
          <div>
            <p className="label-caps text-indigo-400 mb-3">ORDERS COMPLETED</p>
            <div className="flex items-baseline gap-2">
              <p className="text-[40px] font-bold text-primary">{stats.orders}</p>
              <p className="text-on-surface-variant font-medium">/ {stats.target}</p>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Target Progress</span>
              <span className="text-sm font-bold text-secondary">{Math.round((stats.orders / stats.target) * 100)}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-indigo-100">
              <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${(stats.orders / stats.target) * 100}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-indigo-100/50">
              <span className="text-sm text-on-surface-variant font-medium">Average Ticket</span>
              <span className="text-lg font-bold text-primary">${stats.averageTicket.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-premium overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant">
          <h3 className="text-xl font-bold text-primary">Transaction History</h3>
          <button className="text-secondary hover:text-indigo-700 font-bold text-sm flex items-center gap-1 transition-colors">
            VIEW DETAILED REPORTS <ChevronRight size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant text-outline">
                <th className="px-8 py-4 label-caps">Order Reference</th>
                <th className="px-8 py-4 label-caps">Client Name</th>
                <th className="px-8 py-4 label-caps">Transaction Amount</th>
                <th className="px-8 py-4 label-caps">Payment Status</th>
                <th className="px-8 py-4 label-caps">Timestamp</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-5 font-bold text-primary">{tx.id}</td>
                  <td className="px-8 py-5 font-medium text-on-surface">{tx.name}</td>
                  <td className="px-8 py-5 font-bold text-primary">${tx.amount.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-md border ${
                      tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      tx.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant text-sm font-medium">{tx.time}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-outline hover:text-primary transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-primary text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-[0_0_12px_rgba(70,72,212,0.8)]"></span>
            <span className="text-lg font-medium tracking-tight text-slate-300">Live Batch Settlement Total</span>
          </div>
          <span className="text-3xl font-extrabold">
            ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
