import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { ViewType } from '../../types';

interface RegisterProps {
  onViewChange: (view: ViewType) => void;
  onRegister: (fullName: string, email: string, password: string) => Promise<void>;
}

export function Register({ onViewChange, onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onRegister(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4"
    >
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-xl shadow-premium border border-outline-variant/30">
        <button
          onClick={() => onViewChange('login')}
          className="mb-6 flex items-center gap-2 text-on-surface-variant hover:text-secondary text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4 border border-outline-variant">
            <UserPlus className="text-secondary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Create Account</h1>
          <p className="text-on-surface-variant text-sm mt-1">Join the station management team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface ml-1 block">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant transition-colors group-focus-within:text-secondary" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface ml-1 block">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant transition-colors group-focus-within:text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@station.com"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface ml-1 block">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant transition-colors group-focus-within:text-secondary" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3.5 rounded-lg font-semibold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-[0.98] mt-2 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Workspace Account'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
