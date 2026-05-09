"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Target, LineChart, Zap, Star, ChevronRight, PlayCircle, Book, Clock, UserCheck, Activity, Gauge } from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  onLogin: () => void;
  user: { id: string; email: string; name: string } | null;
}

const DashboardMockup = () => {
  return (
    <div className="w-full glass-card rounded-[3rem] p-8 md:p-12 shadow-3xl border border-white/20 dark:border-white/5 relative overflow-hidden group">
      {/* Background Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col gap-10">
        {/* Header Area */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest self-start">
            <Sparkles size={12} />
            Aura Engine V3 Live
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-none">
            Interview Prep, <br />
            <span className="opacity-60 dark:opacity-40 italic serif">Cinematic Edition.</span>
          </h3>
          <p className="text-sm text-foreground/70 dark:text-foreground/50 max-w-sm font-medium leading-relaxed">
            Walk into every interview with confidence. Build a realistic AI session with dynamic prompts and instant feedback.
          </p>
        </div>

        {/* Setup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                <Book size={14} className="text-accent" />
                Focus Area
              </div>
              <div className="p-4 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-sm text-foreground/60 dark:text-foreground/40 font-medium">
                e.g. Senior Frontend Engineer, System Design
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                  <Activity size={14} className="text-accent" />
                  Difficulty
                </div>
                <div className="space-y-2">
                  {['Junior', 'Mid-level', 'Senior'].map((d) => (
                    <div key={d} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${d === 'Mid-level' ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/5' : 'bg-foreground/[0.03] border-foreground/5 text-foreground/60 dark:text-foreground/40'}`}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                  <Clock size={14} className="text-accent" />
                  Duration
                </div>
                <div className="space-y-2">
                  {['15 min', '30 min', '45 min'].map((d) => (
                    <div key={d} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${d === '30 min' ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/5' : 'bg-foreground/[0.03] border-foreground/5 text-foreground/60 dark:text-foreground/40'}`}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                <UserCheck size={14} className="text-accent" />
                Coach Mode
              </div>
              <div className="flex gap-2">
                {['Friendly', 'Challenger', 'Expert'].map((m) => (
                  <div key={m} className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border text-center transition-all ${m === 'Challenger' ? 'bg-accent text-background border-accent' : 'bg-foreground/[0.03] border-foreground/5 text-foreground/60 dark:text-foreground/40'}`}>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pressure', val: 'Medium', icon: <Gauge size={14} /> },
                { label: 'Pace', val: 'Steady', icon: <Activity size={14} /> },
                { label: 'Tone', val: 'Challenger', icon: <Target size={14} /> }
              ].map((s) => (
                <div key={s.label} className="p-4 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-center space-y-1">
                  <div className="text-accent flex justify-center mb-1 opacity-50">{s.icon}</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-foreground/30">{s.label}</div>
                  <div className="text-[10px] font-bold text-foreground">{s.val}</div>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-accent text-background rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-2xl shadow-accent/20 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Initialize Session
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex gap-12 pt-4 border-t border-foreground/5">
          <div>
            <div className="text-2xl font-bold text-foreground">12k+</div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-foreground/30">Sessions Simulated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">99.9%</div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-foreground/30">Realtime Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingView({ onStart, onLogin, user }: LandingViewProps) {
  const features = [
    {
      icon: <Brain size={24} />,
      title: "Contextual AI Engine",
      description: "Our advanced models adapt in real-time, asking follow-up questions based on your specific responses and experience.",
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: <Target size={24} />,
      title: "Role-Specific Scenarios",
      description: "From Frontend Engineering to Product Management, practice with scenarios tailored to your exact target role.",
      gradient: "from-purple-500/20 to-fuchsia-500/20"
    },
    {
      icon: <LineChart size={24} />,
      title: "Actionable Analytics",
      description: "Get detailed post-interview breakdowns on your communication clarity, technical accuracy, and pacing.",
      gradient: "from-emerald-500/20 to-teal-500/20"
    }
  ];

  return (
    <div className="relative min-h-screen selection:bg-accent/30 overflow-x-hidden">
      {/* Cinematic Hero Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hero-light.png')] dark:bg-[url('/images/hero-dark.png')] bg-cover bg-center transition-all duration-1000 scale-105 brightness-105 dark:brightness-75" />
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 hero-vignette" />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 backdrop-blur-md text-accent text-[11px] font-bold tracking-[0.2em] uppercase mb-10"
            >
              <Sparkles size={12} className="animate-pulse" />
              Aura AI Engine V3.0 Live
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.95] tracking-tight text-foreground mb-10">
              Master the <br />
              <span className="opacity-60 dark:opacity-40 italic serif text-foreground">Future of Work.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
              Experience high-stakes interviews simulated by cinematic-grade AI. Gain the confidence and technical edge needed to secure your dream offer at world-class tech companies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <button 
                onClick={onStart}
                className="group relative px-10 py-5 bg-accent text-background rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-accent/20 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">{user ? 'Go to Dashboard' : 'Start Free Practice'}</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="flex items-center justify-center gap-3 px-10 py-5 bg-background/30 backdrop-blur-md border border-foreground/10 text-foreground rounded-full font-bold text-lg transition-all hover:bg-background/50 active:scale-95">
                <PlayCircle size={20} />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Social Proof Removed */}
        </section>

        {/* Cinematic Experience Section */}
        <section id="experience" className="py-32 relative px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="w-full lg:w-[60%] order-2 lg:order-1"
              >
                <DashboardMockup />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="w-full lg:w-[40%] order-1 lg:order-2 space-y-12"
              >
                <div className="space-y-6 text-left">
                  <h2 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                    Experience the <br />
                    <span className="opacity-60 dark:opacity-40 italic serif text-foreground">Cinematic Difference.</span>
                  </h2>
                  <p className="text-xl text-foreground/80 dark:text-foreground/60 font-medium leading-relaxed">
                    Generic chat-based AI is a thing of the past. Aura provides a truly immersive environment that mimics the physical and psychological pressure of a real technical interview.
                  </p>
                </div>
                
                <div className="space-y-8">
                  {[
                    { title: "Real-time Voice Synthesis", desc: "Natural, human-like dialogue that follows up on your answers." },
                    { title: "Behavioral Analysis", desc: "We track your confidence, pacing, and vocabulary in every turn." },
                    { title: "Dynamic Coding Environment", desc: "Solve complex problems in our integrated cinematic IDE." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass-card flex items-center justify-center transition-all group-hover:bg-accent group-hover:text-background">
                        <Star size={20} className="transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                        <p className="text-foreground/70 dark:text-foreground/50 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section id="insights" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div className="space-y-6 text-left">
                  <h2 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                    Data-Driven <br />
                    <span className="opacity-60 dark:opacity-40 italic serif">Self Improvement.</span>
                  </h2>
                  <p className="text-xl text-foreground/80 dark:text-foreground/60 font-medium leading-relaxed">
                    Don't just practice—optimize. Aura breaks down every session into granular data points, providing you with a roadmap to mastery.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 glass-card rounded-[2.5rem] hover:bg-background/40 transition-all duration-500">
                    <div className="text-4xl font-bold text-foreground mb-2">89%</div>
                    <div className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] font-bold">Avg. Success Rate</div>
                  </div>
                  <div className="p-8 glass-card rounded-[2.5rem] hover:bg-background/40 transition-all duration-500">
                    <div className="text-4xl font-bold text-foreground mb-2">150+</div>
                    <div className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] font-bold">Roles Supported</div>
                  </div>
                </div>

                <button className="group flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-xs">
                  Explore full analytics capabilities <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-accent/20 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative rounded-[3rem] overflow-hidden glass-card p-2 shadow-3xl">
                  <img 
                    src="/images/analytics.png" 
                    alt="Analytics Report"
                    className="w-full h-auto rounded-[2.5rem]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Engineered for Excellence.
            </h2>
            <p className="text-foreground/70 dark:text-foreground/50 text-xl max-w-2xl mx-auto font-medium">
              Everything you need to transform interview anxiety into unshakeable confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                key={index}
                className="group relative rounded-[3rem] glass-card p-12 transition-all duration-500 hover:bg-background/40 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500 rounded-[3rem]`} />
                <div className="relative z-10 space-y-8 text-left">
                  <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-background transition-all duration-500">
                    {feature.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-foreground tracking-tight">{feature.title}</h3>
                    <p className="text-foreground/80 dark:text-foreground/60 leading-relaxed font-medium text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-[4rem] p-20 md:p-32 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-12">
              <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.05]">
                Ready to land your <br />
                <span className="opacity-60 dark:opacity-40 italic serif">dream offer?</span>
              </h2>
              <p className="text-xl text-foreground/70 dark:text-foreground/50 font-medium leading-relaxed max-w-xl mx-auto">
                Join 12,000+ engineers who are mastering their communication and technical skills with Aura AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <button 
                  onClick={onStart}
                  className="px-12 py-6 bg-accent text-background rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20"
                >
                  Get Started for Free
                </button>
                <button className="px-12 py-6 bg-background/30 backdrop-blur-md border border-foreground/10 text-foreground rounded-full font-bold text-xl hover:bg-background/50 active:scale-95 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-24 px-6 border-t border-foreground/5 bg-background/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-accent" />
                  <span className="text-2xl font-bold tracking-tighter">AURA AI</span>
                </div>
                <p className="text-foreground/60 dark:text-foreground/40 font-medium max-w-xs">
                  Mastering interviews with cinematic-grade intelligence and professional precision.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">Platform</div>
                  <div className="flex flex-col gap-3 text-[13px] font-bold text-foreground/70 dark:text-foreground/50">
                    <a href="#" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#" className="hover:text-foreground transition-colors">Methodology</a>
                    <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">Company</div>
                  <div className="flex flex-col gap-3 text-[13px] font-bold text-foreground/70 dark:text-foreground/50">
                    <a href="#" className="hover:text-foreground transition-colors">About</a>
                    <a href="#" className="hover:text-foreground transition-colors">Journal</a>
                    <a href="#" className="hover:text-foreground transition-colors">Careers</a>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">Legal</div>
                  <div className="flex flex-col gap-3 text-[13px] font-bold text-foreground/70 dark:text-foreground/50">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-foreground/5 gap-8">
              <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 dark:text-foreground/20">
                © 2026 Aura Technologies. All rights reserved.
              </div>
              <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
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
