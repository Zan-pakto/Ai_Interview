"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { logoutAction } from '@/actions/auth.actions';

interface NavbarProps {
  user: { id: string; email: string; name: string } | null;
  onStart: () => void;
  onLogin: () => void;
  onHome: () => void;
  showNavLinks?: boolean;
}

export function Navbar({ user, onStart, onLogin, onHome, showNavLinks = true }: NavbarProps) {
  const handleLogout = async () => {
    await logoutAction();
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/50 transition-colors duration-300">
        <button onClick={onHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center transition-colors">
            <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white transition-colors">Aura</span>
        </button>

        {showNavLinks && (
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">Pricing</a>
          </div>
        )}

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-4 w-px bg-neutral-200 dark:bg-white/10 hidden md:block transition-colors"></div>
          {user ? (
            <>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors hidden sm:block"
              >
                Sign Out
              </button>
              <button 
                onClick={onStart}
                className="px-5 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors active:scale-95"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onLogin}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors hidden sm:block"
              >
                Log in
              </button>
              <button 
                onClick={onStart}
                className="px-5 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors active:scale-95"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
