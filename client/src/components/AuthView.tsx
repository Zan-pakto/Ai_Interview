"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { signupAction, loginAction } from '@/actions/auth.actions';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  onSuccess: (user: any, token: string) => void;
  onBack: () => void;
}

export default function AuthView({ initialMode = 'login', onSuccess, onBack }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = mode === 'signup' 
        ? await signupAction({ email, password, name })
        : await loginAction({ email, password });

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess(result.user, "session-cookie-handled");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-outfit selection:bg-blue-500/30 overflow-x-hidden relative flex items-center justify-center p-4 transition-colors duration-300">
      {/* SaaS Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none transition-colors duration-300"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[100%] h-[50%] bg-blue-500/5 dark:bg-blue-600/10 blur-[150px] rounded-full pointer-events-none transition-colors duration-300" />
      
      {/* Corner glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

      <header className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/50 transition-colors duration-300">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">Aura</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/5 dark:shadow-black/40 mt-16 animate-fade-in"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-light">
            {mode === 'login' ? 'Enter your credentials to access your workspace' : 'Get started with your free Aura practice account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-black/25 border border-neutral-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-neutral-900 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-black/25 border border-neutral-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Password</label>
              {mode === 'login' && (
                <a href="#" className="text-xs text-blue-500 hover:underline">Forgot password?</a>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-neutral-50 dark:bg-black/25 border border-neutral-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl font-semibold text-sm transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-black/5"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In' : 'Sign Up'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-200 dark:border-white/5 pt-6">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 font-light">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="text-blue-500 hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
