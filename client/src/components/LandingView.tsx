"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Target, LineChart, Zap, Star, ChevronRight, PlayCircle, Book, Clock, UserCheck, Activity, Gauge, Layout, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { logoutAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LandingViewProps {
  onStart: () => void;
  onLogin: () => void;
  user: { id: string; email: string; name: string } | null;
}

const DashboardMockup = () => {
  return (
    <div className="w-full bg-white/70 dark:bg-zinc-950/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-border/60 dark:border-white/5 relative overflow-hidden group">
      {/* Background Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col gap-8">
        {/* Header Area */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-300 text-[10px] font-bold uppercase tracking-widest self-start">
            <Sparkles size={12} />
            Aura Engine V3 Live
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Interview Prep, <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">Cinematic Edition.</span>
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm font-light leading-relaxed">
            Walk into every interview with confidence. Build a realistic AI session with dynamic prompts and instant feedback.
          </p>
        </div>

        {/* Setup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Book size={14} className="text-blue-500" />
                Focus Area
              </div>
              <div className="p-3 bg-background/50 border border-border/80 rounded-xl text-xs text-foreground/80 font-light">
                e.g. Senior Frontend Engineer, System Design
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Activity size={14} className="text-blue-500" />
                  Difficulty
                </div>
                <div className="space-y-1.5">
                  {['Junior', 'Mid-level', 'Senior'].map((d) => (
                    <div key={d} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border text-center transition-all ${d === 'Mid-level' ? 'bg-blue-500/10 border-blue-500/35 text-blue-600 dark:text-blue-200' : 'bg-background/40 border-border/80 text-muted-foreground'}`}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Clock size={14} className="text-blue-500" />
                  Duration
                </div>
                <div className="space-y-1.5">
                  {['15 min', '30 min', '45 min'].map((d) => (
                    <div key={d} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border text-center transition-all ${d === '30 min' ? 'bg-blue-500/10 border-blue-500/35 text-blue-600 dark:text-blue-200' : 'bg-background/40 border-border/80 text-muted-foreground'}`}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <UserCheck size={14} className="text-blue-500" />
                Coach Mode
              </div>
              <div className="flex gap-2">
                {['Friendly', 'Challenger', 'Expert'].map((m) => (
                  <div key={m} className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border text-center transition-all ${m === 'Challenger' ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500/25 dark:text-blue-200 dark:border-blue-500/35' : 'bg-background/40 border-border/80 text-muted-foreground'}`}>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Pressure', val: 'Medium', icon: <Gauge size={14} /> },
                { label: 'Pace', val: 'Steady', icon: <Activity size={14} /> },
                { label: 'Tone', val: 'Challenger', icon: <Target size={14} /> }
              ].map((s) => (
                <div key={s.label} className="p-3 bg-background/40 border border-border/85 rounded-xl text-center space-y-0.5">
                  <div className="text-blue-500 flex justify-center mb-0.5 opacity-70">{s.icon}</div>
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="text-[10px] font-bold text-foreground">{s.val}</div>
                </div>
              ))}
            </div>

            <Button className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md">
              Initialize Session
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex gap-10 pt-4 border-t border-border/40">
          <div>
            <div className="text-xl font-bold text-foreground">12k+</div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Sessions Simulated</div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">99.9%</div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Realtime Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: <Target className="text-purple-500 dark:text-purple-400" size={22} />,
      title: "Role-Specific Scenarios",
      description: "From Frontend Engineering to Product Management, practice with scenarios tailored to your exact target role.",
      gradient: "from-purple-500/20 to-fuchsia-500/20"
    },
    {
      icon: <LineChart className="text-emerald-500 dark:text-emerald-400" size={22} />,
      title: "Actionable Analytics",
      description: "Get detailed post-interview breakdowns on your communication clarity, technical accuracy, and pacing.",
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: <Layout className="text-cyan-500 dark:text-cyan-400" size={22} />,
      title: "Immersive Environment",
      description: "Experience a realistic, pressure-tested video interview environment designed to eliminate interview anxiety.",
      gradient: "from-cyan-500/20 to-blue-500/20"
    },
    {
      icon: <Shield className="text-amber-500 dark:text-amber-400" size={22} />,
      title: "Private & Secure",
      description: "Your voice, video, and transcripts are strictly confidential, processed with end-to-end encryption protocols.",
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: <Zap className="text-rose-500 dark:text-rose-400" size={22} />,
      title: "Instant Feedback Loop",
      description: "Receive micro-corrections and alternative phrasing suggestions immediately after complex technical questions.",
      gradient: "from-rose-500/20 to-pink-500/20"
    }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground font-outfit selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Cinematic Hero Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/hero-light.png')] dark:bg-[url('/images/hero-dark.png')] bg-cover bg-center scale-105 brightness-100 dark:brightness-50 transition-all duration-1000" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 dark:bg-zinc-950/40 backdrop-blur-xl border border-border/40 dark:border-white/5 rounded-2xl px-6 py-2.5 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center transition-colors">
              <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white transition-colors">Aura</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#experience" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Experience</a>
            <a href="#insights" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Insights</a>
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

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide mb-8"
            >
              <Sparkles size={12} className="animate-pulse" />
              Aura AI Engine V3.0 Live
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-foreground mb-8">
              Master the interview. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent italic font-light">Secure the offer.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Experience high-stakes interviews simulated by conversational AI. Gain the confidence and technical edge needed to secure your dream offer at world-class companies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Button 
                onClick={onStart}
                size="lg"
                className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
              >
                <span>{user ? 'Go to Dashboard' : 'Start Free Practice'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto h-12 px-8 rounded-xl border-border/80 text-foreground bg-background/40 backdrop-blur-md hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={16} className="text-foreground" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Cinematic Experience Section */}
        <section id="experience" className="py-24 relative px-4 md:px-6 border-t border-border/20 bg-zinc-900/[0.02] dark:bg-black/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-[55%] order-2 lg:order-1"
              >
                <DashboardMockup />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-[45%] order-1 lg:order-2 space-y-10"
              >
                <div className="space-y-5 text-left">
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                    Experience the <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent italic font-light">Cinematic Difference.</span>
                  </h2>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    Generic chat-based AI is a thing of the past. Aura provides a truly immersive environment that mimics the physical and psychological pressure of a real technical interview.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { title: "Real-time Voice Synthesis", desc: "Natural, human-like dialogue that follows up on your answers." },
                    { title: "Behavioral Analysis", desc: "We track your confidence, pacing, and vocabulary in every turn." },
                    { title: "Dynamic Coding Environment", desc: "Solve complex problems in our integrated mock IDE." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                        <Star size={16} />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section id="insights" className="py-24 px-4 md:px-6 border-t border-border/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <div className="space-y-5 text-left">
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                    Data-Driven <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent italic font-light">Self Improvement.</span>
                  </h2>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    Don't just practice—optimize. Aura breaks down every session into granular data points, providing you with a roadmap to mastery.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-zinc-900/[0.02] dark:bg-black/20 border border-border/60 rounded-2xl hover:bg-background/40 transition-all duration-300">
                    <div className="text-3xl font-bold text-foreground mb-1">89%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg. Success Rate</div>
                  </div>
                  <div className="p-6 bg-zinc-900/[0.02] dark:bg-black/20 border border-border/60 rounded-2xl hover:bg-background/40 transition-all duration-300">
                    <div className="text-3xl font-bold text-foreground mb-1">150+</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Roles Supported</div>
                  </div>
                </div>

                <button className="group flex items-center gap-2 text-blue-500 hover:text-blue-600 text-xs font-semibold uppercase tracking-wider transition-colors">
                  Explore full analytics capabilities <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative rounded-3xl overflow-hidden bg-white/70 dark:bg-zinc-950/40 border border-border/60 dark:border-white/5 p-2 shadow-2xl">
                  <img 
                    src="/images/analytics.png" 
                    alt="Analytics Report"
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 md:px-6 py-24 border-t border-border/20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Engineered for Excellence.
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light">
              Everything you need to transform interview anxiety into unshakeable confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                key={index}
                className="group relative rounded-[2rem] bg-white/70 dark:bg-zinc-950/40 border border-border/60 dark:border-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:bg-white dark:hover:bg-zinc-950/75 hover:-translate-y-1 shadow-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-[2rem]`} />
                <div className="relative z-10 space-y-6 text-left">
                  <div className="w-11 h-11 rounded-xl bg-muted dark:bg-black/50 border border-border/50 dark:border-white/5 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-xs font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-24 border-t border-border/20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/70 dark:bg-zinc-950/40 backdrop-blur-2xl border border-border/60 dark:border-white/5 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
                Ready to land your <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent italic font-light">dream offer?</span>
              </h2>
              <p className="text-base text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
                Join 12,000+ engineers who are mastering their communication and technical skills with Aura AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
                <Button 
                  onClick={onStart}
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl transition-all shadow-md"
                >
                  Get Started for Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl border-border/80 text-foreground bg-background/40 backdrop-blur-md hover:bg-muted transition-all"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 md:px-6 border-t border-border/20 bg-background/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-500" />
                  <span className="text-xl font-bold tracking-tight">AURA AI</span>
                </div>
                <p className="text-muted-foreground font-light text-sm max-w-xs leading-relaxed">
                  Mastering interviews with cinematic-grade intelligence and professional precision.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20">
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platform</div>
                  <div className="flex flex-col gap-2 text-xs font-light text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#" className="hover:text-foreground transition-colors">Methodology</a>
                    <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Company</div>
                  <div className="flex flex-col gap-2 text-xs font-light text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">About</a>
                    <a href="#" className="hover:text-foreground transition-colors">Journal</a>
                    <a href="#" className="hover:text-foreground transition-colors">Careers</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Legal</div>
                  <div className="flex flex-col gap-2 text-xs font-light text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/20 gap-4">
              <div className="text-xs text-muted-foreground font-light">
                © 2026 Aura Technologies. All rights reserved.
              </div>
              <div className="flex gap-6 text-xs text-muted-foreground font-light">
                <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
