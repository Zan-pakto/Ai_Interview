"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Target, LineChart, Shield, Layout, Zap, ChevronRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingViewProps {
  onGetStarted: () => void;
}

export default function LandingView({ onGetStarted }: LandingViewProps) {
  const features = [
    {
      icon: <Brain className="text-blue-500 dark:text-blue-400" size={24} />,
      title: "Contextual AI Engine",
      description: "Our advanced models adapt in real-time, asking follow-up questions based on your specific responses and experience.",
      gradient: "from-blue-500/10 to-indigo-500/10"
    },
    {
      icon: <Target className="text-purple-500 dark:text-purple-400" size={24} />,
      title: "Role-Specific Scenarios",
      description: "From Frontend Engineering to Product Management, practice with scenarios tailored to your exact target role.",
      gradient: "from-purple-500/10 to-fuchsia-500/10"
    },
    {
      icon: <LineChart className="text-emerald-500 dark:text-emerald-400" size={24} />,
      title: "Actionable Analytics",
      description: "Get detailed post-interview breakdowns on your communication clarity, technical accuracy, and pacing.",
      gradient: "from-emerald-500/10 to-teal-500/10"
    },
    {
      icon: <Layout className="text-cyan-500 dark:text-cyan-400" size={24} />,
      title: "Immersive Environment",
      description: "Experience a realistic, pressure-tested video interview environment designed to eliminate interview anxiety.",
      gradient: "from-cyan-500/10 to-blue-500/10"
    },
    {
      icon: <Shield className="text-amber-500 dark:text-amber-400" size={24} />,
      title: "Private & Secure",
      description: "Your voice, video, and transcripts are strictly confidential, processed with end-to-end encryption protocols.",
      gradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      icon: <Zap className="text-rose-500 dark:text-rose-400" size={24} />,
      title: "Instant Feedback Loop",
      description: "Receive micro-corrections and alternative phrasing suggestions immediately after complex technical questions.",
      gradient: "from-rose-500/10 to-pink-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#020202] text-neutral-900 dark:text-[#ededed] font-outfit selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      {/* SaaS Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none transition-colors duration-300"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[100%] h-[50%] bg-blue-500/5 dark:bg-blue-600/10 blur-[150px] rounded-full pointer-events-none transition-colors duration-300" />

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-2xl px-6 py-3 shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/50 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center transition-colors">
              <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white transition-colors">Aura</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-4 w-px bg-neutral-200 dark:bg-white/10 hidden md:block transition-colors"></div>
            <button className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors hidden sm:block">
              Log in
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide mb-8 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Aura AI v2.0 is now live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight text-neutral-900 dark:text-white max-w-5xl mb-8 transition-colors"
          >
            Master the interview. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Secure the offer.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mb-12 font-light leading-relaxed transition-colors"
          >
            Simulate high-pressure technical and behavioral interviews with our conversational AI. Get real-time feedback and detailed analytics to refine your approach.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <button 
              onClick={onGetStarted}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-2xl font-semibold text-base transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 w-full sm:w-auto overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              <span>Start Free Practice</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white rounded-2xl font-semibold text-base transition-all hover:bg-neutral-50 dark:hover:bg-white/[0.06] active:scale-95 w-full sm:w-auto">
              View Demo
            </button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-500/5 dark:bg-purple-600/5 blur-[120px] rounded-full pointer-events-none -z-10 transition-colors" />
          
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-900 dark:text-white tracking-tight transition-colors">
              Engineered for excellence
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto font-light transition-colors">
              Everything you need to transform interview anxiety into unshakeable confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={index}
                className="group relative rounded-3xl bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 p-10 transition-all hover:bg-neutral-50 dark:hover:bg-white/[0.04] dark:hover:border-white/10 overflow-hidden shadow-sm dark:shadow-none"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-black/50 border border-neutral-100 dark:border-white/10 flex items-center justify-center shadow-inner transition-colors">
                    {feature.icon}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white transition-colors">{feature.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-light text-base transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-900 dark:text-white tracking-tight transition-colors">
              How it Works
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto font-light transition-colors">
              Get started in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent z-0 transition-colors"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl relative transition-colors">
                <div className="absolute inset-0 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-xl transition-colors"></div>
                <span className="text-4xl font-semibold text-neutral-900 dark:text-white relative z-10 transition-colors">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white transition-colors">Configure Session</h3>
              <p className="text-neutral-600 dark:text-neutral-400 font-light text-base max-w-sm transition-colors">
                Select your target role, difficulty level, and duration to generate a highly customized interview plan.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl relative transition-colors">
                <div className="absolute inset-0 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-xl transition-colors"></div>
                <span className="text-4xl font-semibold text-neutral-900 dark:text-white relative z-10 transition-colors">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white transition-colors">Engage the AI</h3>
              <p className="text-neutral-600 dark:text-neutral-400 font-light text-base max-w-sm transition-colors">
                Turn on your mic and camera. Answer dynamically generated questions in a realistic environment.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-28 h-28 rounded-full bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 flex items-center justify-center shadow-xl dark:shadow-2xl relative transition-colors">
                <div className="absolute inset-0 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl transition-colors"></div>
                <span className="text-4xl font-semibold text-neutral-900 dark:text-white relative z-10 transition-colors">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white transition-colors">Review Analytics</h3>
              <p className="text-neutral-600 dark:text-neutral-400 font-light text-base max-w-sm transition-colors">
                Get immediate, actionable feedback on your performance, communication style, and technical accuracy.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 dark:border-white/5 bg-white dark:bg-black/50 py-12 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600 dark:text-blue-500 transition-colors" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight transition-colors">Aura AI Copilot</span>
          </div>
          <div className="text-xs text-neutral-500">
            © 2026 Aura Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
