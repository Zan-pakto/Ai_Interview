"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Rocket, Sparkles } from 'lucide-react';

interface SetupData {
  topic: string;
  difficulty: string;
  duration: string;
}

interface SetupViewProps {
  onStart: (data: SetupData) => void;
}

export default function SetupView({ onStart }: SetupViewProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Mid-level");
  const [duration, setDuration] = useState("30 min");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    onStart({ topic, difficulty, duration });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Branding/Intro */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={12} /> Powered by Aura AI
          </div>
          <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
            Elevate Your <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Career Path.
            </span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
            Step into the future of interview preparation. Our AI-driven sessions are tailored to your specific goals, helping you master every conversation.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">98%</div>
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Accuracy Rate</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs text-neutral-500 uppercase font-bold tracking-tighter">Availability</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Setup Card */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-10 shadow-2xl relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                <BookOpen size={14} className="text-blue-500" /> Syllabus / Focus Area
              </label>
              <input 
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-lg placeholder:text-neutral-700"
                required
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  <Target size={14} className="text-emerald-500" /> Challenge Level
                </label>
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                  {["Junior", "Mid-level", "Senior"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        difficulty === level 
                          ? 'bg-neutral-800 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                          : 'text-neutral-600 hover:text-neutral-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  <Clock size={14} className="text-amber-500" /> Session Length
                </label>
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                  {["15 min", "30 min", "45 min"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDuration(time)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        duration === time 
                          ? 'bg-neutral-800 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                          : 'text-neutral-600 hover:text-neutral-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full group relative py-6 rounded-[24px] font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-3 text-white tracking-tight">
                LAUNCH SESSION <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
