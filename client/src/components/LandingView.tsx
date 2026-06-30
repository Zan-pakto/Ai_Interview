"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Target, LineChart, Shield, Layout, Zap, Play } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { logoutAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LandingViewProps {
  onStart: () => void;
  onLogin: () => void;
  user: { id: string; email: string; name: string } | null;
}

export default function LandingView({ onStart, onLogin, user }: LandingViewProps) {
  const handleLogout = async () => {
    await logoutAction();
    window.location.reload();
  };

  const features = [
    {
      icon: <Brain className="text-blue-500 dark:text-blue-400" size={22} />,
      title: "Contextual AI Engine",
      description: "Our advanced models adapt in real-time, asking follow-up questions based on your specific responses and experience.",
      gradient: "from-blue-500/10 to-indigo-500/10"
    },
    {
      icon: <Target className="text-purple-500 dark:text-purple-400" size={22} />,
      title: "Role-Specific Scenarios",
      description: "From Frontend Engineering to Product Management, practice with scenarios tailored to your exact target role.",
      gradient: "from-purple-500/10 to-fuchsia-500/10"
    },
    {
      icon: <LineChart className="text-emerald-500 dark:text-emerald-400" size={22} />,
      title: "Actionable Analytics",
      description: "Get detailed post-interview breakdowns on your communication clarity, technical accuracy, and pacing.",
      gradient: "from-emerald-500/10 to-teal-500/10"
    },
    {
      icon: <Layout className="text-cyan-500 dark:text-cyan-400" size={22} />,
      title: "Immersive Environment",
      description: "Experience a realistic, pressure-tested video interview environment designed to eliminate interview anxiety.",
      gradient: "from-cyan-500/10 to-blue-500/10"
    },
    {
      icon: <Shield className="text-amber-500 dark:text-amber-400" size={22} />,
      title: "Private & Secure",
      description: "Your voice, video, and transcripts are strictly confidential, processed with end-to-end encryption protocols.",
      gradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      icon: <Zap className="text-rose-500 dark:text-rose-400" size={22} />,
      title: "Instant Feedback Loop",
      description: "Receive micro-corrections and alternative phrasing suggestions immediately after complex technical questions.",
      gradient: "from-rose-500/10 to-pink-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-outfit selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      {/* SaaS Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none transition-colors duration-300" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[50%] bg-blue-500/5 dark:bg-blue-600/10 blur-[150px] rounded-full pointer-events-none transition-colors duration-300" />

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl border border-border/40 dark:border-white/5 rounded-2xl px-6 py-2.5 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center transition-colors">
              <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white transition-colors">Aura</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-4 w-px bg-border hidden md:block"></div>
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                >
                  Sign Out
                </Button>
                <Button 
                  onClick={onStart}
                  size="sm"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-sm"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onLogin}
                  className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                >
                  Log in
                </Button>
                <Button 
                  onClick={onStart}
                  size="sm"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Aura AI v3.0 is now live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-neutral-900 dark:text-white max-w-5xl mb-8 transition-colors"
          >
            Master the interview. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Secure the offer.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-light leading-relaxed transition-colors"
          >
            Simulate high-pressure technical and behavioral interviews with our conversational AI. Get real-time feedback and detailed analytics to refine your approach.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <Button 
              onClick={onStart}
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 group transition-all"
            >
              <span>{user ? 'Go to Dashboard' : 'Start Free Practice'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl border-border/80 text-foreground bg-background hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <Play size={14} fill="currentColor" />
              <span>View Demo</span>
            </Button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-500/5 dark:bg-purple-600/5 blur-[120px] rounded-full pointer-events-none -z-10 transition-colors" />
          
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
              Engineered for excellence
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light transition-colors">
              Everything you need to transform interview anxiety into unshakeable confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={index}
                className="group relative"
              >
                <Card className="h-full border border-border/60 dark:border-white/5 bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:bg-white dark:hover:bg-zinc-950/70 p-1 flex flex-col justify-between shadow-sm dark:shadow-none">
                  <div className="p-6 space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-muted dark:bg-black/50 border border-border/50 dark:border-white/5 flex items-center justify-center shadow-inner transition-colors">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold text-foreground">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed font-light text-sm pt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
              How it Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light transition-colors">
              Get fully prepared in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border dark:via-white/10 to-transparent z-0" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-950 border border-border dark:border-white/10 flex items-center justify-center shadow-md relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-md" />
                <span className="text-3xl font-bold text-foreground relative z-10">1</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Configure Session</h3>
              <p className="text-muted-foreground font-light text-sm max-w-sm leading-relaxed">
                Select your target role, difficulty level, and duration to generate a highly customized interview plan.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-950 border border-border dark:border-white/10 flex items-center justify-center shadow-md relative">
                <div className="absolute inset-0 rounded-full bg-purple-500/5 blur-md" />
                <span className="text-3xl font-bold text-foreground relative z-10">2</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Engage the AI</h3>
              <p className="text-muted-foreground font-light text-sm max-w-sm leading-relaxed">
                Turn on your mic and camera. Answer dynamically generated questions in a realistic environment.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-950 border border-border dark:border-white/10 flex items-center justify-center shadow-md relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-md" />
                <span className="text-3xl font-bold text-foreground relative z-10">3</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Review Analytics</h3>
              <p className="text-muted-foreground font-light text-sm max-w-sm leading-relaxed">
                Get immediate, actionable feedback on your performance, communication style, and technical accuracy.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/40 dark:border-white/5 bg-white dark:bg-black/40 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600 dark:text-blue-500" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Aura AI Copilot</span>
          </div>
          <div className="text-xs text-muted-foreground">
            © 2026 Aura Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
