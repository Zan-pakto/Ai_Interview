"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Rocket, Sparkles, ChevronRight, WandSparkles, Brain, Gauge, Settings2, Upload, FileText, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createSessionAction } from '@/actions/interview.actions';
import { getSocketToken } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

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

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const handleResumeUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadStatus("error");
      setUploadMessage("Only PDF resumes are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File size must be less than 5MB.");
      return;
    }

    setResumeFile(file);
    setUploadStatus("uploading");
    setUploadMessage("");

    try {
      const token = await getSocketToken();
      if (!token) {
        setUploadStatus("error");
        setUploadMessage("Authentication token not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload resume.");
      }

      const data = await response.json();
      setUploadStatus("success");
      setUploadMessage(data.message || "Resume parsed and indexed successfully!");
    } catch (err: any) {
      console.error("Failed to upload resume:", err);
      setUploadStatus("error");
      setUploadMessage(err.message || "Failed to process resume. Please try again.");
    }
  };

  const handleClearResume = () => {
    setResumeFile(null);
    setUploadStatus("idle");
    setUploadMessage("");
  };

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
    <div className="min-h-screen relative flex items-center justify-center pt-24 pb-12 px-4 md:px-6 selection:bg-blue-500/30 overflow-x-hidden font-outfit">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/hero-light.png')] dark:bg-[url('/images/hero-dark.png')] bg-cover bg-center transition-all duration-1000 scale-110 brightness-95 dark:brightness-40 blur-xl" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
      </div>

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Info Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 dark:text-cyan-300 text-xs font-semibold tracking-wide backdrop-blur-md">
              <Sparkles size={13} className="text-blue-400" /> 
              <span>Aura Engine V3 Live</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-foreground">
              Configure your <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-blue-300 dark:to-fuchsia-300 bg-clip-text text-transparent">
                mock session.
              </span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed font-light">
              Walk into every interview with absolute readiness. Customize your focus area, set the AI pressure level, and begin practicing with instant audio feedback.
            </p>
          </div>

          {/* Quick Start Templates */}
          <div className="bg-zinc-900/10 dark:bg-black/30 border border-border/60 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3.5 font-semibold">
              <WandSparkles size={14} className="text-blue-400" />
              Quick Templates
            </div>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTopic(item)}
                  className="rounded-full border-border/80 hover:border-blue-500/30 bg-background/50 hover:bg-background/80 text-xs font-light px-3.5 text-foreground transition-all"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/60 bg-zinc-900/10 dark:bg-black/20 backdrop-blur-xl">
              <div className="text-2xl font-bold text-foreground">12,000+</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Simulations Run</div>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-zinc-900/10 dark:bg-black/20 backdrop-blur-xl">
              <div className="text-2xl font-bold text-foreground">99.9%</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Linguistic Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Right Form Card Column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <Card className="border border-border/60 dark:border-white/10 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-2xl shadow-2xl p-1 rounded-3xl">
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1.5 pb-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="text-blue-500 dark:text-cyan-400 size-5" />
                  <CardTitle className="text-xl font-bold">Interview Preferences</CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground font-light">
                  Define the parameters for your customized AI Interview session
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Focus Area Input */}
                <div className="space-y-2">
                  <Label htmlFor="focus-area" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <BookOpen size={14} className="text-blue-500" /> Focus Area
                  </Label>
                  <Input 
                    id="focus-area"
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer, System Design"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-11 border-border/80 bg-background/50 dark:bg-black/35 focus-visible:border-blue-500/50 text-foreground placeholder:text-muted-foreground font-light rounded-xl"
                    required
                  />
                </div>

                {/* Resume Upload Section */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <FileText size={14} className="text-blue-500" /> Professional Resume (Optional)
                  </Label>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragActive(true);
                    }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragActive(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleResumeUpload(file);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 ${
                      isDragActive
                        ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 scale-[0.99]"
                        : "border-border/80 hover:border-border hover:bg-zinc-900/5 dark:hover:bg-white/5"
                    } ${
                      uploadStatus === "success"
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                        : uploadStatus === "error"
                        ? "border-red-500/40 bg-red-500/5 dark:bg-red-500/10"
                        : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleResumeUpload(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadStatus === "uploading"}
                    />

                    {uploadStatus === "idle" && (
                      <div className="space-y-2">
                        <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Drag & drop your resume, or <span className="text-blue-500 dark:text-cyan-400">browse</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            PDF format only (Max 5MB)
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="space-y-2 py-1.5">
                        <Loader2 className="mx-auto w-8 h-8 text-blue-500 animate-spin" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Processing Resume...
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Extracting text and building vector embeddings for RAG
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "success" && (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left font-sans">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 animate-bounce">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[240px] md:max-w-[320px]">
                              {resumeFile?.name}
                            </p>
                            <p className="text-[10px] text-emerald-500 font-medium">
                              Ingested & index optimized
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearResume();
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 relative z-10"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                            <AlertCircle size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-500">
                              Upload Failed
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[240px] md:max-w-[320px]">
                              {uploadMessage}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearResume();
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg hover:bg-background/80 relative z-10"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Difficulty & Duration grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Difficulty Selection */}
                  <div className="space-y-3.5">
                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Target size={14} className="text-indigo-500" /> Difficulty
                    </Label>
                    <div className="flex flex-col gap-2">
                      {["Junior", "Mid-level", "Senior"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            difficulty === level 
                              ? 'bg-blue-500/10 border-blue-500/35 text-blue-600 dark:text-blue-200 dark:shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                              : 'bg-background/40 border-border/80 text-muted-foreground hover:border-border hover:text-foreground'
                          }`}
                        >
                          <span>{level}</span>
                          {difficulty === level && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-3.5">
                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock size={14} className="text-cyan-500" /> Duration
                    </Label>
                    <div className="flex flex-col gap-2">
                      {["15 min", "30 min", "45 min"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setDuration(time)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            duration === time 
                              ? 'bg-blue-500/10 border-blue-500/35 text-blue-600 dark:text-blue-200 dark:shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                              : 'bg-background/40 border-border/80 text-muted-foreground hover:border-border hover:text-foreground'
                          }`}
                        >
                          <span>{time}</span>
                          {duration === time && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Coach Mode Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Brain size={14} className="text-purple-500 animate-pulse" /> Interviewer Personality
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Friendly", "Challenger", "Expert"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCoachMode(mode)}
                        className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                          coachMode === mode
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-200 shadow-sm"
                            : "bg-background/40 border-border/80 text-muted-foreground hover:bg-background/60 hover:border-border"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="rounded-xl border border-border/60 bg-background/40 p-2.5">
                    <Gauge size={14} className="mx-auto mb-1 text-blue-500" />
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Pressure</p>
                    <p className="text-xs text-foreground font-bold mt-0.5">{difficulty === "Senior" ? "Intense" : difficulty === "Mid-level" ? "Standard" : "Gentle"}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/40 p-2.5">
                    <Rocket size={14} className="mx-auto mb-1 text-indigo-500" />
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Pacing</p>
                    <p className="text-xs text-foreground font-bold mt-0.5">{duration === "15 min" ? "Fast-track" : duration === "30 min" ? "Standard" : "Deep-dive"}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/40 p-2.5">
                    <Sparkles size={14} className="mx-auto mb-1 text-purple-500" />
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Tone</p>
                    <p className="text-xs text-foreground font-bold mt-0.5">{coachMode}</p>
                  </div>
                </div>

              </CardContent>

              <CardFooter className="pb-8 pt-4">
                <Button 
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Session...
                    </span>
                  ) : (
                    <>
                      <span>Initialize Session</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
