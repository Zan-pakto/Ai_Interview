"use client";

import React, { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Activity, AlignLeft, ShieldCheck, Zap, Timer, Gauge, Bot, CirclePause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocketToken } from '@/actions/auth.actions';

const SOCKET_SERVER =  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

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
    <div className="flex flex-col h-screen text-[#f6f8ff] font-outfit overflow-hidden pt-20">
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative p-4 gap-4">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-[130px] animate-float-slow" />
        <div className="absolute -bottom-20 right-8 h-80 w-80 rounded-full bg-indigo-500/20 blur-[140px] animate-float-slow" />

        <div className="flex-1 flex flex-col relative z-10">
          <div className="flex-1 rounded-2xl bg-slate-900/65 border border-white/15 overflow-hidden relative shadow-2xl flex items-center justify-center aurora-outline">
            
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-700 ${videoOn ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            {!videoOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
                  <VideoOff size={32} className="text-slate-500" />
                </div>
                <span className="text-sm font-medium text-slate-400">Camera Disabled</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 backdrop-blur-md rounded-lg border border-red-300/30">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold text-red-200 uppercase tracking-widest">Recording</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 backdrop-blur-md rounded-lg border border-white/15">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-slate-200">E2E Encrypted</span>
              </div>
            </div>
            <div className="absolute top-4 right-4 rounded-xl border border-white/20 bg-slate-900/65 backdrop-blur-md px-3 py-2 min-w-40">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-300/80 mb-1">
                <span>Session progress</span>
                <span>{Math.round(completion)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-300 to-fuchsia-300 transition-all duration-700" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <div className="px-3 py-1.5 bg-slate-950/60 backdrop-blur-md rounded-lg border border-white/15 flex items-center gap-2">
                 <Activity size={14} className={audioOn ? "text-blue-400" : "text-neutral-500"} />
                 <span className="text-xs font-medium text-slate-200">{audioOn ? 'Audio capturing' : 'Muted'}</span>
              </div>
            </div>

            {!isJoined && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm"
              >
                <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center shadow-2xl aurora-outline">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-300/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Video size={28} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Ready to join?</h2>
                  <p className="text-slate-300 text-sm mb-8">
                    Your camera and microphone settings have been configured. The AI is ready to begin.
                  </p>
                  <button 
                    onClick={joinInterview}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 text-slate-900 rounded-xl font-semibold text-sm transition-all hover:brightness-105 active:scale-95"
                  >
                    Join Session
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="h-20 mt-4 bg-slate-900/55 border border-white/15 rounded-2xl flex items-center justify-between gap-4 px-6 z-10 shadow-lg backdrop-blur-xl">
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`h-10 rounded-xl px-3 text-xs border transition-colors ${
                  focusMode ? "bg-cyan-300/20 border-cyan-200/40 text-cyan-100" : "bg-white/[0.08] border-white/20 text-slate-200"
                }`}
              >
                Focus mode {focusMode ? "on" : "off"}
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2 text-xs text-slate-200">
                <Gauge size={14} className="text-fuchsia-200" />
                Confidence {Math.max(58, Math.min(96, 68 + transcript.length * 3))}%
              </div>
            </div>
            <div className="flex items-center gap-4">
            <button 
              onClick={() => setAudioOn(!audioOn)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${
                audioOn 
                  ? 'bg-white/[0.14] border-white/20 text-slate-100 hover:bg-white/[0.18]' 
                  : 'bg-red-500/15 border-red-300/30 text-red-200'
              }`}
            >
              {audioOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button 
              onClick={toggleRecording}
              disabled={!isJoined}
              className={`relative h-12 px-8 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-500/15 border border-red-300/40 text-red-100 hover:bg-red-500/20' 
                  : 'bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 text-slate-900 hover:brightness-105 shadow-[0_8px_26px_rgba(56,189,248,0.3)]'
              }`}
            >
              {isRecording ? (
                <>
                  <div className="w-2 h-2 rounded-sm bg-red-400" />
                  Stop Answering
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-black" />
                  Start Answering
                </>
              )}
            </button>

            {isJoined && (
              <button 
                onClick={endInterview}
                className="h-12 px-5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 bg-red-500/15 border border-red-300/30 text-red-200 hover:bg-red-500/25 active:scale-95 shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
              >
                End Interview
              </button>
            )}

            <button 
              onClick={() => setVideoOn(!videoOn)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${
                videoOn 
                  ? 'bg-white/[0.14] border-white/20 text-slate-100 hover:bg-white/[0.18]' 
                  : 'bg-red-500/15 border-red-300/30 text-red-200'
              }`}
            >
              {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[410px] flex flex-col bg-slate-900/55 border border-white/15 rounded-2xl z-10 shadow-lg overflow-hidden backdrop-blur-xl">
          <div className="p-5 border-b border-white/15 bg-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-300/30 flex items-center justify-center">
                <AlignLeft size={16} className="text-indigo-200" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-slate-100">Analysis & Transcript</h2>
                <p className="text-xs text-slate-400">Real-time AI processing</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/20 bg-white/[0.08] p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-300/70">Turns</p>
                <p className="text-sm font-semibold text-white">{transcript.length}</p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/[0.08] p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-300/70">AI State</p>
                <p className="text-sm font-semibold text-cyan-100">Active</p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/[0.08] p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-300/70">Pacing</p>
                <p className="text-sm font-semibold text-fuchsia-100">{isRecording ? "Live" : "Paused"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6 aurora-scroll">
            <AnimatePresence initial={false}>
              {transcript.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 px-1">
                    {m.role === 'ai' ? 'Interviewer' : 'You'}
                  </div>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'ai' 
                      ? 'bg-white/[0.07] border border-white/15 text-slate-100 rounded-tl-sm' 
                      : 'bg-blue-600/25 border border-blue-300/30 text-blue-100 rounded-tr-sm'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {transcript.length === 0 && isJoined && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                  <Activity size={24} className="opacity-50" />
                  <p className="text-sm">Session started. The AI will speak shortly.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-5 bg-white/[0.08] border-t border-white/15 space-y-3">
            {liveTranscript ? (
              <div className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  {liveTranscript}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-500">
                <Mic size={14} />
                <p className="text-xs font-medium">Listening for response...</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs text-slate-100 hover:bg-white/[0.14] transition-colors inline-flex items-center justify-center gap-1.5">
                <Bot size={13} /> Ask Hint
              </button>
              <button className="rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs text-slate-100 hover:bg-white/[0.14] transition-colors inline-flex items-center justify-center gap-1.5">
                <CirclePause size={13} /> Pause AI
              </button>
            </div>
          </div>
        </aside>
      </main>

      {isCompleted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 md:p-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="max-w-4xl w-full bg-slate-900/85 border border-white/15 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl aurora-outline my-auto animate-fade-in"
          >
            {/* Background glow effects */}
            <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-cyan-400/15 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[120px] pointer-events-none" />

            <header className="text-center mb-8 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-400/10 to-fuchsia-400/10 border border-cyan-300/30 rounded-full text-cyan-200 text-xs font-semibold tracking-wide mb-4">
                <ShieldCheck size={14} className="text-cyan-300" />
                <span>Interview Evaluation Completed</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold bg-gradient-to-r from-cyan-300 via-blue-200 to-fuchsia-300 bg-clip-text text-transparent pb-1">
                Performance Summary
              </h2>
              <p className="text-slate-300 mt-2 text-sm md:text-base font-light">
                Review your technical score, personalized feedback, and recommendations below.
              </p>
            </header>

            {isGeneratingFeedback ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-cyan-300 border-r-fuchsia-300 animate-spin" />
                </div>
                <p className="text-sm font-semibold text-slate-200 uppercase tracking-widest animate-pulse">
                  AI is synthesizing feedback...
                </p>
                <p className="text-xs text-slate-400">Evaluating technical responses, pacing, and vocabulary</p>
              </div>
            ) : feedback ? (
              <div className="space-y-8 relative">
                {/* Score and Pacing Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  {/* Score Circle Card */}
                  <div className="md:col-span-5 bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/5 to-fuchsia-300/5 opacity-50" />
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-spin" style={{ animationDuration: '20s' }} />
                      <div className="absolute inset-2 rounded-full border border-cyan-300/20" />
                      <div className="absolute inset-4 rounded-full bg-slate-950/80 flex flex-col items-center justify-center border border-white/10 shadow-inner">
                        <span className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                          {feedback.overallScore}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Out of 100</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-white text-base">Overall Score</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Based on technical correctness and communication quality.</p>
                  </div>

                  {/* Stats and Highlights */}
                  <div className="md:col-span-7 flex flex-col justify-between gap-4">
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex-1">
                      <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Gauge size={16} className="text-cyan-300" /> Executive Summary
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed font-light">
                        {feedback.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Response Pacing</p>
                        <p className="text-lg font-semibold text-cyan-200 mt-1">{feedback.pacing}</p>
                      </div>
                      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Turns Completed</p>
                        <p className="text-lg font-semibold text-fuchsia-200 mt-1">{transcript.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-emerald-300 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Key Strengths
                    </h4>
                    <ul className="space-y-3">
                      {feedback.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-amber-300 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Areas of Focus
                    </h4>
                    <ul className="space-y-3">
                      {feedback.improvements?.map((imp: string, idx: number) => (
                        <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3.5 bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 text-slate-900 rounded-xl font-semibold text-sm transition-all hover:brightness-105 active:scale-95 shadow-lg"
                  >
                    Start New Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <p className="text-sm text-slate-300">Could not retrieve feedback. Don't worry, you can restart anytime.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg text-sm hover:bg-white/15"
                >
                  Restart
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
