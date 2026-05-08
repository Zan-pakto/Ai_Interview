"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Rocket, Sparkles, ChevronRight, WandSparkles, Brain, Gauge } from 'lucide-react';

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
    <div className="min-h-screen text-[#f8faff] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40" />
      <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-[120px] animate-float-slow" />
      <div className="absolute -bottom-28 right-0 h-[22rem] w-[22rem] rounded-full bg-indigo-500/20 blur-[140px] animate-float-slow" />
      <div className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[130px] animate-float-slow" />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-5 space-y-10"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-200 text-xs font-semibold tracking-wide backdrop-blur-md">
              <Sparkles size={14} className="text-blue-400" /> 
              <span>Aura Engine V3 Live</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-white">
              Interview Prep, <br />
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                Cinematic Edition.
              </span>
            </h1>
            <p className="text-slate-200/95 text-lg leading-relaxed max-w-md font-light">
              Walk into every interview with confidence. Build a realistic AI session with dynamic prompts, adaptive pressure, and instant voice feedback.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-200/70 mb-3">
              <WandSparkles size={14} className="text-cyan-300" />
              Quick Start Templates
            </div>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className="rounded-full border border-white/20 bg-white/[0.10] px-3 py-1.5 text-xs text-slate-100 hover:bg-white/[0.16] transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel transition-colors hover:bg-white/[0.12]">
              <div className="text-3xl font-medium text-white mb-1">12k+</div>
              <div className="text-xs text-slate-300/60 font-medium uppercase tracking-widest">Sessions Simulated</div>
            </div>
            <div className="p-5 rounded-2xl glass-panel transition-colors hover:bg-white/[0.12]">
              <div className="text-3xl font-medium text-white mb-1">99.9%</div>
              <div className="text-xs text-slate-300/60 font-medium uppercase tracking-widest">Realtime Uptime</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <div className="relative aurora-outline rounded-3xl">
            
            <form 
              onSubmit={handleSubmit}
              className="relative rounded-3xl p-8 lg:p-12 shadow-2xl glass-panel bg-white/[0.08]"
            >
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300/70 uppercase tracking-wider">
                    <BookOpen size={16} className="text-blue-400" /> Focus Area
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer, System Design"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30 transition-all font-light"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300/70 uppercase tracking-wider">
                      <Target size={16} className="text-fuchsia-300" /> Difficulty
                    </label>
                    <div className="flex flex-col gap-2.5">
                      {["Junior", "Mid-level", "Senior"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            difficulty === level 
                              ? 'bg-fuchsia-400/20 border-fuchsia-200/45 text-white shadow-[0_0_24px_rgba(192,132,252,0.3)]' 
                              : 'bg-slate-900/45 border-white/15 text-slate-200 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {level}
                          {difficulty === level && <div className="w-2 h-2 rounded-full bg-fuchsia-300"></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300/70 uppercase tracking-wider">
                      <Clock size={16} className="text-cyan-300" /> Duration
                    </label>
                    <div className="flex flex-col gap-2.5">
                      {["15 min", "30 min", "45 min"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setDuration(time)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            duration === time 
                              ? 'bg-cyan-400/20 border-cyan-200/45 text-white shadow-[0_0_24px_rgba(56,189,248,0.3)]' 
                              : 'bg-slate-900/45 border-white/15 text-slate-200 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {time}
                          {duration === time && <div className="w-2 h-2 rounded-full bg-cyan-300"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300/70 uppercase tracking-wider">
                    <Brain size={16} className="text-indigo-200" /> Coach Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Friendly", "Challenger", "Expert"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCoachMode(mode)}
                        className={`rounded-xl border px-3 py-2 text-xs transition-all ${
                          coachMode === mode
                            ? "bg-indigo-300/20 border-indigo-200/40 text-white"
                            : "bg-white/[0.05] border-white/15 text-slate-200 hover:bg-white/[0.1]"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/[0.08] border border-white/15 p-3">
                    <Gauge size={15} className="mx-auto mb-1 text-cyan-200" />
                    <p className="text-[10px] uppercase tracking-wider text-slate-300/80">Pressure</p>
                    <p className="text-sm text-white font-semibold">{difficulty === "Senior" ? "High" : difficulty === "Mid-level" ? "Medium" : "Balanced"}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.08] border border-white/15 p-3">
                    <Rocket size={15} className="mx-auto mb-1 text-fuchsia-200" />
                    <p className="text-[10px] uppercase tracking-wider text-slate-300/80">Pace</p>
                    <p className="text-sm text-white font-semibold">{duration === "15 min" ? "Fast" : duration === "30 min" ? "Steady" : "Deep"}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.08] border border-white/15 p-3">
                    <Sparkles size={15} className="mx-auto mb-1 text-indigo-200" />
                    <p className="text-[10px] uppercase tracking-wider text-slate-300/80">Tone</p>
                    <p className="text-sm text-white font-semibold">{coachMode}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 text-slate-900 rounded-2xl font-semibold text-base transition-all hover:brightness-105 active:scale-[0.98] overflow-hidden shadow-[0_8px_34px_rgba(56,189,248,0.32)]"
                  >
                    <span>Initialize Session</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
