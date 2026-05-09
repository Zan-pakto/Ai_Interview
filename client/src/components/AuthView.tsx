"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen relative flex items-center justify-center p-6 selection:bg-accent/30 overflow-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hero-light.png')] dark:bg-[url('/images/hero-dark.png')] bg-cover bg-center transition-all duration-1000 scale-110 brightness-90 dark:brightness-50 blur-lg" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 w-full max-w-[480px] glass-card rounded-[3rem] p-10 md:p-12 shadow-3xl"
      >
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-foreground/60 dark:text-foreground/40 hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 group"
        >
          <ArrowRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={14} />
          Back
        </button>

        <div className="text-center mb-12 mt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-background mb-6 shadow-xl shadow-accent/20">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-foreground/70 dark:text-foreground/50 font-medium tracking-tight">
            {mode === 'login' ? 'Enter your credentials to access your workspace' : 'Get started with your free Aura practice account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/40 ml-1">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-foreground placeholder:text-foreground/20 font-medium"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/40 ml-1">Email Address</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-accent transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-foreground placeholder:text-foreground/20 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/40">Password</label>
              {mode === 'login' && (
                <a href="#" className="text-[10px] font-bold uppercase tracking-[0.1em] text-accent/60 hover:text-accent transition-colors">Forgot password?</a>
              )}
            </div>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-accent transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-foreground placeholder:text-foreground/20 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-bold text-red-500 uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-accent text-background rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl shadow-accent/20"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In' : 'Sign Up'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-foreground/5 pt-8">
          <span className="text-xs font-medium text-foreground/60 dark:text-foreground/40">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="text-accent font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
