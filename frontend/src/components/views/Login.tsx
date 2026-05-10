import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { ViewType } from '../../types';

interface LoginProps {
  onViewChange: (view: ViewType) => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

export function Login({ onViewChange, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4"
    >
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-xl shadow-premium border border-outline-variant/30">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-secondary/20">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Welcome Back</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Please enter your credentials to login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full bg-secondary text-white py-3.5 rounded-lg font-semibold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login to Workspace'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col items-center gap-4">
          <p className="text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <button
              onClick={() => onViewChange('register')}
              className="text-secondary font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
