"use client";

import React from 'react';
import { Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { logoutAction } from '@/actions/auth.actions';
import { motion } from 'framer-motion';

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
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-0 w-full z-50 px-6 py-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-nav rounded-[2rem] px-8 py-4 shadow-2xl shadow-black/5 transition-all duration-500 hover:shadow-black/10">
        <button onClick={onHome} className="flex items-center gap-3 hover:opacity-70 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-black/5">
            <Sparkles size={20} className="text-background" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Aura</span>
        </button>

        {showNavLinks && (
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: 'Experience', href: '#experience' },
              { label: 'Insights', href: '#insights' },
              { label: 'Features', href: '#features' }
            ].map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                className="text-[13px] font-bold uppercase tracking-[0.1em] text-foreground/70 dark:text-foreground/50 hover:text-foreground transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="h-6 w-px bg-foreground/10 hidden md:block"></div>
          
          {user ? (
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">Welcome back</span>
                <span className="text-sm font-bold text-foreground">{user.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={onStart}
                  className="px-6 py-2.5 bg-accent text-background rounded-full text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-accent/20 flex items-center gap-2"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-foreground/80 dark:text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all duration-300"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={onLogin}
                className="text-[13px] font-bold text-foreground/80 dark:text-foreground/60 hover:text-foreground transition-colors px-4 py-2"
              >
                Log in
              </button>
              <button 
                onClick={onStart}
                className="px-8 py-2.5 bg-accent text-background rounded-full text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-accent/20"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
