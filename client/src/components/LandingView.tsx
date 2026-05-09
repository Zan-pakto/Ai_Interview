"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Target, LineChart, Shield, Layout, Zap, ChevronRight, PlayCircle, Star, Users, CheckCircle2 } from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  onLogin: () => void;
  user: { id: string; email: string; name: string } | null;
}

export default function LandingView({ onStart, onLogin, user }: LandingViewProps) {
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
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#030303] text-foreground font-outfit selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      {/* SaaS Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none transition-colors duration-300"></div>
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[100%] bg-blue-500/5 dark:bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide mb-8">
                <Sparkles size={14} className="animate-pulse" />
                Aura AI Engine V3.0 Live
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-neutral-900 dark:text-white mb-8">
                Master the <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Future of Work.
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-xl mb-12 font-light leading-relaxed">
                Experience high-stakes interviews simulated by cinematic-grade AI. Gain the confidence and technical edge needed to secure your dream offer at world-class tech companies.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <button 
                  onClick={onStart}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-2xl font-semibold text-lg transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 w-full sm:w-auto shadow-2xl shadow-blue-500/20"
                >
                  <span>{user ? 'Go to Dashboard' : 'Start Free Practice'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white rounded-2xl font-semibold text-lg transition-all hover:bg-neutral-50 dark:hover:bg-white/[0.06] active:scale-95 w-full sm:w-auto">
                  <PlayCircle size={20} />
                  Watch Demo
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6 text-neutral-500 dark:text-neutral-400">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#030303] bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-light">
                  <span className="font-semibold text-neutral-900 dark:text-white">12,000+</span> engineers already practicing
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-[2rem] overflow-hidden border border-neutral-200 dark:border-white/10 shadow-2xl shadow-black/20">
                <img 
                  src="/images/hero.png" 
                  alt="Aura AI Dashboard"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Floating micro-cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 p-4 bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-500">Live Feedback</div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">Accuracy: 94%</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Cinematic Experience Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative rounded-[2.5rem] overflow-hidden border border-neutral-200 dark:border-white/10 shadow-2xl shadow-blue-500/5"
                >
                  <img 
                    src="/images/interviewer.png" 
                    alt="AI Interview Experience"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 inline-flex items-center gap-3 self-start">
                      <Zap size={20} className="text-yellow-400" />
                      <span className="text-sm font-medium text-white">Adaptive Difficulty Active</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Experience the <br />
                    <span className="text-blue-500">Cinematic Difference.</span>
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Generic chat-based AI is a thing of the past. Aura provides a truly immersive environment that mimics the physical and psychological pressure of a real technical interview.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { title: "Real-time Voice Synthesis", desc: "Natural, human-like dialogue that follows up on your answers." },
                    { title: "Behavioral Analysis", desc: "We track your confidence, pacing, and vocabulary in every turn." },
                    { title: "Dynamic Coding Environment", desc: "Solve complex problems in our integrated cinematic IDE." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mt-1">
                        <Star size={14} className="text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section className="py-24 bg-neutral-50 dark:bg-neutral-900/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Data-Driven <br />
                    <span className="text-purple-500">Self Improvement.</span>
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Don't just practice—optimize. Aura breaks down every session into granular data points, providing you with a roadmap to mastery.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/5 rounded-3xl">
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">89%</div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-medium">Avg. Success Rate</div>
                  </div>
                  <div className="p-6 bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/5 rounded-3xl">
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">150+</div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-medium">Roles Supported</div>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-blue-500 font-semibold hover:gap-4 transition-all">
                  Explore full analytics capabilities <ChevronRight size={20} />
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full" />
                <div className="relative rounded-[2.5rem] overflow-hidden border border-neutral-200 dark:border-white/10 shadow-2xl">
                  <img 
                    src="/images/analytics.png" 
                    alt="Analytics Report"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Engineered for Excellence.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto font-light">
              Everything you need to transform interview anxiety into unshakeable confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={index}
                className="group relative rounded-[2rem] bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 p-10 transition-all hover:bg-neutral-50 dark:hover:bg-white/[0.04] dark:hover:border-white/10 overflow-hidden shadow-sm dark:shadow-none"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-black/50 border border-neutral-100 dark:border-white/10 flex items-center justify-center shadow-inner transition-colors">
                    {feature.icon}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white transition-colors">{feature.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-light text-base transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="bg-neutral-900 dark:bg-white rounded-[3rem] p-16 md:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white dark:text-black tracking-tight">
                Ready to land your dream offer?
              </h2>
              <p className="text-lg text-neutral-400 dark:text-neutral-600 font-light leading-relaxed">
                Join 12,000+ engineers who are mastering their communication and technical skills with Aura AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <button 
                  onClick={onStart}
                  className="px-10 py-5 bg-white dark:bg-black text-black dark:text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
                >
                  Get Started for Free
                </button>
                <button className="px-10 py-5 bg-transparent border-2 border-neutral-700 dark:border-neutral-200 text-white dark:text-black rounded-2xl font-bold text-lg hover:bg-neutral-800 dark:hover:bg-neutral-50 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-white/5 bg-white dark:bg-[#030303] py-12 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600 dark:text-blue-500 transition-colors" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">Aura AI</span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Mastering interviews with cinematic-grade intelligence.</p>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">LinkedIn</a>
          </div>
          
          <div className="text-sm text-neutral-500">
            © 2026 Aura Technologies.
          </div>
        </div>
      </footer>
    </div>
  );
}
