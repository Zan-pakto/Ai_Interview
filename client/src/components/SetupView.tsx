"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Rocket, Sparkles, ChevronRight, WandSparkles, Brain, Gauge, Activity } from 'lucide-react';
import { createSessionAction } from '@/actions/interview.actions';

interface SetupViewProps {
  onStart: (config: { topic: string; difficulty: string; duration: string; roomId: string }) => void;
  user: { id: string; email: string; name: string } | null;
}

export default function SetupView({ onStart, user }: SetupViewProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Mid-level");
  const [duration, setDuration] = useState("30 min");
  const [coachMode, setCoachMode] = useState("Challenger");
  const [isCreating, setIsCreating] = useState(false);
  const quickTopics = ["React System Design", "Node.js APIs", "Behavioral Leadership", "Frontend Performance"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setIsCreating(true);
    try {
      const session = await createSessionAction({ topic, difficulty, duration });
      onStart({ topic, difficulty, duration, roomId: session.roomId });
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center pt-32 pb-12 px-6 selection:bg-accent/30 overflow-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hero-light.png')] dark:bg-[url('/images/hero-dark.png')] bg-cover bg-center transition-all duration-1000 scale-110 brightness-95 dark:brightness-50 blur-xl" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
      </div>

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        {/* Left Content - Editorial Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-5 space-y-12"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 backdrop-blur-md text-accent text-[11px] font-bold tracking-[0.2em] uppercase">
              <Sparkles size={12} />
              Session Configuration
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-foreground">
              Configure Your <br />
              <span className="opacity-60 dark:opacity-40 italic serif">Experience.</span>
            </h1>
            <p className="text-foreground/80 dark:text-foreground/60 text-xl font-medium leading-relaxed max-w-md">
              Walk into every interview with unshakeable confidence. Aura synchronizes with your specific career objectives.
            </p>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
              <WandSparkles size={16} className="text-accent" />
              Quick Start Templates
            </div>
            <div className="flex flex-wrap gap-3">
              {quickTopics.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className="px-5 py-2.5 rounded-full border border-foreground/5 bg-foreground/[0.03] text-[13px] font-bold text-foreground/80 dark:text-foreground/60 hover:bg-accent hover:text-background hover:border-accent transition-all duration-300 active:scale-95"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 rounded-[2.5rem] glass-card transition-all hover:bg-background/40">
              <div className="text-4xl font-bold text-foreground mb-2 tracking-tighter">12k+</div>
              <div className="text-[10px] text-foreground/60 dark:text-foreground/40 font-bold uppercase tracking-[0.2em]">Global Professionals</div>
            </div>
            <div className="p-8 rounded-[2.5rem] glass-card transition-all hover:bg-background/40">
              <div className="text-4xl font-bold text-foreground mb-2 tracking-tighter">99.9%</div>
              <div className="text-[10px] text-foreground/60 dark:text-foreground/40 font-bold uppercase tracking-[0.2em]">Real-time Uptime</div>
            </div>
          </div>
        </motion.div>

        {/* Right Content - The Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-7"
        >
          <div className="glass-card rounded-[3.5rem] p-1 shadow-3xl">
            <form 
              onSubmit={handleSubmit}
              className="relative rounded-[3.2rem] p-10 lg:p-14 bg-background/40"
            >
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[10px] font-bold text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] ml-1">
                    <BookOpen size={16} className="text-accent" /> Focus Area
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer, System Design"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-6 py-5 text-foreground placeholder:text-foreground/40 dark:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-bold text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-[10px] font-bold text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] ml-1">
                      <Target size={16} className="text-accent" /> Difficulty
                    </label>
                    <div className="flex flex-col gap-3">
                      {["Junior", "Mid-level", "Senior"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 border ${
                            difficulty === level 
                              ? 'bg-accent text-background border-accent shadow-xl shadow-accent/20' 
                              : 'bg-foreground/[0.03] border-foreground/5 text-foreground/60 dark:text-foreground/40 hover:bg-foreground/[0.06]'
                          }`}
                        >
                          {level}
                          {difficulty === level && <div className="w-1.5 h-1.5 rounded-full bg-background"></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-[10px] font-bold text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] ml-1">
                      <Clock size={16} className="text-accent" /> Duration
                    </label>
                    <div className="flex flex-col gap-3">
                      {["15 min", "30 min", "45 min"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setDuration(time)}
                          className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 border ${
                            duration === time 
                              ? 'bg-accent text-background border-accent shadow-xl shadow-accent/20' 
                              : 'bg-foreground/[0.03] border-foreground/5 text-foreground/60 dark:text-foreground/40 hover:bg-foreground/[0.06]'
                          }`}
                        >
                          {time}
                          {duration === time && <div className="w-1.5 h-1.5 rounded-full bg-background"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[10px] font-bold text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] ml-1">
                    <Brain size={16} className="text-accent" /> Coach Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Friendly", "Challenger", "Expert"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCoachMode(mode)}
                        className={`py-3.5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                          coachMode === mode
                            ? "bg-accent text-background border-accent"
                            : "bg-foreground/[0.03] border-foreground/5 text-foreground/60 dark:text-foreground/40 hover:bg-foreground/[0.06]"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Pressure', val: difficulty === "Senior" ? "High" : difficulty === "Mid-level" ? "Medium" : "Balanced", icon: <Gauge size={16} /> },
                    { label: 'Pace', val: duration === "15 min" ? "Fast" : duration === "30 min" ? "Steady" : "Deep", icon: <Activity size={16} /> },
                    { label: 'Tone', val: coachMode, icon: <Sparkles size={16} /> }
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-foreground/[0.03] border border-foreground/5 p-4 space-y-1 group hover:bg-foreground/[0.06] transition-colors">
                      <div className="text-accent mx-auto opacity-60 dark:opacity-40 group-hover:opacity-100 transition-opacity flex justify-center mb-1">{s.icon}</div>
                      <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-foreground/30">{s.label}</p>
                      <p className="text-xs text-foreground font-bold">{s.val}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="w-full group relative flex items-center justify-center gap-4 px-10 py-6 bg-accent text-background rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-2xl shadow-accent/20"
                  >
                    <span>Initialize Session</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
