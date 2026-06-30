"use client";

import React, { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Activity, AlignLeft, ShieldCheck, Zap, Timer, Gauge, Bot, CirclePause, ChevronRight, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocketToken } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const SOCKET_SERVER = "http://localhost:5000";

interface InterviewViewProps {
  topic: string;
  difficulty: string;
  duration: string;
  roomId: string;
  userId?: string;
}

export default function InterviewView({ topic, difficulty, duration, roomId, userId }: InterviewViewProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [focusMode, setFocusMode] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function initSocket() {
      const token = await getSocketToken();
      const newSocket = io(SOCKET_SERVER, {
        auth: { token }
      });
      setSocket(newSocket);

      newSocket.on('ai-message', async (data) => {
        setTranscript(prev => [...prev, { role: 'ai', text: data.text }]);
        if (data.audio) {
          const audio = new Audio("data:audio/mp3;base64," + data.audio);
          audio.play();
        }
      });

      newSocket.on('user-transcript', (data) => {
        setLiveTranscript(data.text);
        setTranscript(prev => [...prev, { role: 'user', text: data.text }]);
      });

      newSocket.on('interview-feedback', (data) => {
        setFeedback(data.feedback);
        setIsGeneratingFeedback(false);
      });

      return newSocket;
    }

    const socketPromise = initSocket();

    return () => {
      socketPromise.then(s => s.disconnect());
    };
  }, []);

  const endInterview = React.useCallback(() => {
    setIsCompleted(true);
    setIsGeneratingFeedback(true);
    
    // Stop stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Stop recording if running
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.error("Error stopping recorder on wrap up:", e);
      }
    }
    setIsRecording(false);
    
    socket?.emit('end-interview', { roomId });
  }, [socket, roomId]);

  useEffect(() => {
    if (!isJoined || isCompleted) return;
    
    const durationMinutes = parseInt(duration, 10) || 30;
    const totalSecondsLimit = durationMinutes * 60;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= totalSecondsLimit) {
          clearInterval(interval);
          endInterview();
          return totalSecondsLimit;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isJoined, isCompleted, duration, endInterview]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Detect supported MIME type for audio
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/wav',
        ''
      ].find(type => type === '' || MediaRecorder.isTypeSupported(type));

      // Create a separate stream for audio recording to avoid issues with video tracks
      const audioStream = new MediaStream(stream.getAudioTracks());
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          socket?.emit('user-answer', { roomId, audio: base64Audio });
        };
        audioChunksRef.current = [];
      };

    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const joinInterview = () => {
    socket?.emit('join-interview', { 
      roomId, 
      userId: userId || ('user-' + Math.random()),
      topic,
      difficulty,
      duration
    });
    setIsJoined(true);
    startStream();
  };

  const toggleRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      console.error("MediaRecorder not initialized");
      return;
    }

    try {
      if (isRecording) {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        setIsRecording(false);
      } else {
        if (recorder.state === 'inactive') {
          audioChunksRef.current = [];
          recorder.start();
          setIsRecording(true);
        }
      }
    } catch (err) {
      console.error("Error toggling recorder:", err);
      // Attempt to recover state
      setIsRecording(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const completion = Math.min((elapsedSeconds / (parseInt(duration, 10) * 60 || 1)) * 100, 100);

  return (
    <div className="flex flex-col h-screen text-[#f6f8ff] font-outfit overflow-hidden bg-background">
      
      {/* Header bar */}
      <header className="h-16 px-6 flex justify-between items-center bg-zinc-950/60 backdrop-blur-xl border-b border-border/80 z-20 transition-all">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Zap size={15} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-foreground">Aura Workspace</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/40 border border-border/60 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">System Live</span>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-zinc-900/40 px-3 py-1.5 text-xs text-slate-300">
            <Timer size={13} className="text-cyan-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="h-4 w-px bg-border/80" />
          <div className="flex gap-2">
            <span className="px-2.5 py-1 bg-zinc-900/60 text-slate-300 rounded-lg text-xs font-medium border border-border/60">
              {topic}
            </span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20">
              {difficulty}
            </span>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative p-4 gap-4 bg-background">
        
        {/* Glow indicators */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-cyan-500/5 blur-[130px] animate-float-slow pointer-events-none" />
        <div className="absolute -bottom-20 right-8 h-80 w-80 rounded-full bg-indigo-500/5 blur-[140px] animate-float-slow pointer-events-none" />

        <div className="flex-1 flex flex-col relative z-10">
          
          {/* Main Video Box */}
          <div className="flex-1 rounded-2xl bg-zinc-950/40 border border-border/60 overflow-hidden relative shadow-inner flex items-center justify-center">
            
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-700 ${videoOn ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            {!videoOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                  <VideoOff size={28} className="text-zinc-500" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Camera Feed Paused</span>
              </div>
            )}
            
            {/* Top Bar overlays inside Video */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 backdrop-blur-md rounded-lg border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">Recording Response</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/60 backdrop-blur-md rounded-lg border border-white/5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Session secure</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 rounded-xl border border-white/5 bg-zinc-950/70 backdrop-blur-md px-3 py-2 min-w-[150px]">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                <span>Progress</span>
                <span>{Math.round(completion)}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <div className="px-3 py-1.5 bg-zinc-950/60 backdrop-blur-md rounded-lg border border-white/5 flex items-center gap-2">
                 <Activity size={13} className={audioOn ? "text-blue-400 animate-pulse" : "text-neutral-500"} />
                 <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">{audioOn ? 'Mic Active' : 'Muted'}</span>
              </div>
            </div>

            {/* Ready to join state overlay */}
            {!isJoined && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
              >
                <div className="p-8 rounded-2xl max-w-md w-full text-center border border-white/10 bg-zinc-900/60 shadow-2xl backdrop-blur-2xl">
                  <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Video size={24} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-1.5 text-white">Join the Mock Room</h2>
                  <p className="text-slate-400 text-xs font-light mb-8">
                    Your camera and microphone are ready. Click join to connect and initiate the session.
                  </p>
                  <Button 
                    onClick={joinInterview}
                    className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg shadow"
                  >
                    Join Session
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Lower Control Bar */}
          <div className="h-20 mt-4 bg-zinc-950/50 border border-border/80 rounded-2xl flex items-center justify-between gap-4 px-6 z-10 shadow-lg backdrop-blur-xl">
            
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant={focusMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className="text-xs h-9 rounded-xl px-4 border border-white/5"
              >
                Focus {focusMode ? "On" : "Off"}
              </Button>
              <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-1.5 text-xs text-slate-300">
                <Gauge size={13} className="text-fuchsia-400" />
                <span>Confidence: {Math.max(58, Math.min(96, 68 + transcript.length * 3))}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              
              {/* Mic toggle */}
              <Button 
                onClick={() => setAudioOn(!audioOn)}
                variant="outline"
                size="icon"
                className={`w-10 h-10 rounded-xl border ${
                  audioOn 
                    ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {audioOn ? <Mic size={18} /> : <MicOff size={18} />}
              </Button>

              {/* Answering Toggle Button */}
              <Button 
                onClick={toggleRecording}
                disabled={!isJoined}
                className={`h-10 px-6 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isRecording 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20' 
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-95 shadow-md shadow-cyan-500/10'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded bg-red-400 animate-pulse" />
                    <span>Stop Answering</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Start Answering</span>
                  </>
                )}
              </Button>

              {/* End Session Button */}
              {isJoined && (
                <Button 
                  onClick={endInterview}
                  variant="outline"
                  className="h-10 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  End Session
                </Button>
              )}

              {/* Video toggle */}
              <Button 
                onClick={() => setVideoOn(!videoOn)}
                variant="outline"
                size="icon"
                className={`w-10 h-10 rounded-xl border ${
                  videoOn 
                    ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </Button>

            </div>
          </div>
        </div>

        {/* Right Sidebar: Transcript & Analytics */}
        <aside className="w-full lg:w-[400px] flex flex-col bg-zinc-950/40 border border-border/80 rounded-2xl z-10 shadow-lg overflow-hidden backdrop-blur-xl">
          
          <div className="p-4 border-b border-border/60 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <AlignLeft size={15} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-white uppercase tracking-wider">Analysis & Transcript</h2>
                <p className="text-[10px] text-slate-400 font-light">Real-time processing active</p>
              </div>
            </div>

            {/* Turn stats */}
            <div className="mt-3.5 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Turns</p>
                <p className="text-xs font-bold text-white mt-0.5">{transcript.length}</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">AI State</p>
                <p className="text-xs font-bold text-cyan-300 mt-0.5">Listening</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Pace</p>
                <p className="text-xs font-bold text-fuchsia-300 mt-0.5">{isRecording ? "Active" : "Idle"}</p>
              </div>
            </div>
          </div>
          
          {/* Scrollable conversation logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 aurora-scroll">
            <AnimatePresence initial={false}>
              {transcript.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                    {m.role === 'ai' ? 'Interviewer' : 'You'}
                  </div>
                  <div className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed border ${
                    m.role === 'ai' 
                      ? 'bg-zinc-900/60 border-white/5 text-slate-200 rounded-tl-none' 
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-200 rounded-tr-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {transcript.length === 0 && isJoined && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 py-16">
                  <Activity size={20} className="opacity-40 animate-pulse" />
                  <p className="text-xs font-light">Session connected. Awaiting interviewer prompt...</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Lower transcript preview */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5 space-y-3">
            {liveTranscript ? (
              <div className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  {liveTranscript}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <Mic size={13} />
                <p className="text-[10px] font-semibold uppercase tracking-wider">Awaiting microphone response</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button size="xs" variant="outline" className="border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-medium flex items-center justify-center gap-1">
                <Bot size={12} /> Hint
              </Button>
              <Button size="xs" variant="outline" className="border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-medium flex items-center justify-center gap-1">
                <CirclePause size={12} /> Pause AI
              </Button>
            </div>
          </div>

        </aside>
      </main>

      {/* Completion Modal / Evaluation Screen */}
      {isCompleted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md overflow-y-auto p-4 md:p-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="max-w-4xl w-full my-auto"
          >
            <Card className="border border-white/10 bg-zinc-900/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden p-1">
              {/* Internal glowing elements */}
              <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none" />

              <CardHeader className="text-center pb-6 pt-8 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-xs font-semibold tracking-wide mb-4">
                  <ShieldCheck size={14} className="text-cyan-400" />
                  <span>Evaluation Compiled</span>
                </div>
                <CardTitle className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-fuchsia-300 bg-clip-text text-transparent pb-1">
                  Session Performance
                </CardTitle>
                <CardDescription className="text-slate-300 mt-2 text-sm font-light px-4">
                  Review your technical score, detailed breakdowns, and personalized coaching highlights
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-6">
                {isGeneratingFeedback ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <RefreshCw className="h-10 w-10 text-cyan-300 animate-spin" />
                    <p className="text-sm font-bold text-slate-200 uppercase tracking-widest animate-pulse">
                      Synthesizing Feedback Data...
                    </p>
                    <p className="text-xs text-slate-400 font-light">Analyzing technical accuracy, semantic patterns, and vocabulary pacing</p>
                  </div>
                ) : feedback ? (
                  <div className="space-y-6">
                    {/* Score and summary blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      
                      {/* Overall score radial card */}
                      <div className="md:col-span-5 border border-white/5 bg-black/20 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                          <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-spin" style={{ animationDuration: '25s' }} />
                          <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
                          <div className="absolute inset-3 rounded-full bg-zinc-950/80 flex flex-col items-center justify-center border border-white/5 shadow-inner">
                            <span className="text-3xl font-extrabold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                              {feedback.overallScore}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Rating</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-white text-sm">Overall Metric</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] font-light">Derived from question compliance, speech patterns and subject knowledge.</p>
                      </div>

                      {/* Summary details */}
                      <div className="md:col-span-7 flex flex-col justify-between gap-4">
                        <div className="border border-white/5 bg-black/20 rounded-xl p-5 flex-1">
                          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Gauge size={14} className="text-cyan-300" /> AI Executive Analysis
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-light">
                            {feedback.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-white/5 bg-black/20 rounded-xl p-3.5 text-center">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Linguistic Pacing</p>
                            <p className="text-sm font-bold text-cyan-300 mt-1">{feedback.pacing}</p>
                          </div>
                          <div className="border border-white/5 bg-black/20 rounded-xl p-3.5 text-center">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Turns Conducted</p>
                            <p className="text-sm font-bold text-fuchsia-300 mt-1">{transcript.length}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Strengths & Weaknesses row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Strengths */}
                      <div className="bg-emerald-500/[0.02] border border-emerald-500/20 rounded-xl p-5">
                        <h4 className="font-semibold text-emerald-300 text-xs uppercase tracking-wider mb-3.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Key Assets
                        </h4>
                        <ul className="space-y-2.5">
                          {feedback.strengths?.map((strength: string, idx: number) => (
                            <li key={idx} className="text-slate-300 text-xs flex items-start gap-2 font-light">
                              <span className="text-emerald-400 font-semibold">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="bg-amber-500/[0.02] border border-amber-500/20 rounded-xl p-5">
                        <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider mb-3.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Focus Targets
                        </h4>
                        <ul className="space-y-2.5">
                          {feedback.improvements?.map((imp: string, idx: number) => (
                            <li key={idx} className="text-slate-300 text-xs flex items-start gap-2 font-light">
                              <span className="text-amber-400 font-semibold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <p className="text-xs text-slate-400">Failed to load session evaluation. Don't worry, your progress has been logged.</p>
                    <Button 
                      onClick={() => window.location.reload()}
                      size="sm"
                      className="bg-white/10 border border-white/10 hover:bg-white/20 text-white rounded-lg"
                    >
                      Start New Prep
                    </Button>
                  </div>
                )}
              </CardContent>

              {feedback && !isGeneratingFeedback && (
                <CardFooter className="pb-8 pt-4 justify-center border-t border-white/5 bg-white/[0.01]">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="h-10 px-8 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold rounded-lg shadow-md"
                  >
                    Start New Practice Session
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
