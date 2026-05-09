"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Activity, AlignLeft, ShieldCheck, Zap, Timer, Gauge, Bot, CirclePause, ChevronRight, Sparkles, LayoutDashboard, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocketToken } from '@/actions/auth.actions';
import { calculateEyeContact, calculateConfidence } from '@/lib/gaze';

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";


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
  
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [liveConfidence, setLiveConfidence] = useState(75);
  const [isLookingAtScreen, setIsLookingAtScreen] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState("Focused");

  const faceapiRef = useRef<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const endInterview = useCallback(() => {
    setIsCompleted(true);
    setIsGeneratingFeedback(true);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
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
    
    socketRef.current?.emit('end-interview', { roomId });
  }, [roomId]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        console.log("🔌 [Socket] Starting initialization. Server URL:", SOCKET_SERVER);
        
        // Fetch JWT socket token
        const token = await getSocketToken();
        console.log("🔑 [Socket] Token response retrieved:", token ? "Token acquired (length: " + token.length + ")" : "No token found");
        
        if (!active) {
          console.warn("⚠️ [Socket] Init aborted because component became inactive");
          return;
        }

        const newSocket = io(SOCKET_SERVER, {
          auth: { token },
          transports: ['websocket']
        });

        newSocket.on('connect', () => {
          console.log("✅ [Socket] Connected successfully! Session ID (socket.id):", newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
          console.error("❌ [Socket] Connection error event:", err.message, err);
        });

        newSocket.on('ai-message', async (data) => {
          console.log("🤖 [Socket] AI message event received:", data);
          setTranscript(prev => [...prev, { role: 'ai', text: data.text }]);
          if (data.audio) {
            console.log("🔊 [Socket] Playing AI speech audio buffer");
            const audio = new Audio("data:audio/mp3;base64," + data.audio);
            audio.play().catch(audioErr => console.error("❌ Audio playback failed:", audioErr));
          }
        });

        newSocket.on('user-transcript', (data) => {
          console.log("🗣️ [Socket] User transcription received:", data);
          setLiveTranscript(data.text);
          setTranscript(prev => [...prev, { role: 'user', text: data.text }]);
        });

        newSocket.on('interview-feedback', (data) => {
          console.log("📊 [Socket] Interview feedback received:", data);
          setFeedback(data.feedback);
          setIsGeneratingFeedback(false);
        });

        newSocket.on('disconnect', (reason) => {
          console.warn("🔌 [Socket] Disconnected. Reason:", reason);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
      } catch (err) {
        console.error("❌ [Socket] Critical exception during initialization:", err);
      }
    };

    init();

    return () => {
      active = false;
      if (socketRef.current) {
        console.log("🔌 [Socket] Cleaning up and disconnecting socket");
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 1. Dynamic SSR-Safe Model Loading
  useEffect(() => {
    let active = true;
    const loadModels = async () => {
      try {
        console.log("📥 [FaceAPI] Dynamic load started...");
        const faceapi = await import('@vladmandic/face-api');
        
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        
        if (!active) return;
        console.log("✅ [FaceAPI] Neural network models loaded successfully!");
        faceapiRef.current = faceapi;
        setModelsLoaded(true);
      } catch (err) {
        console.error("❌ [FaceAPI] Failed to dynamically load models:", err);
      }
    };
    loadModels();
    return () => { active = false; };
  }, []);

  // 2. Real-Time Facial Analysis Loop
  useEffect(() => {
    if (!modelsLoaded || !videoOn || !videoRef.current || isCompleted) return;

    let timeoutId: NodeJS.Timeout;
    const faceapi = faceapiRef.current;

    const trackFace = async () => {
      try {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (detection) {
            const eyeContact = calculateEyeContact(detection.landmarks);
            setIsLookingAtScreen(eyeContact);

            const sortedExpressions = Object.entries(detection.expressions)
              .sort((a: any, b: any) => b[1] - a[1]);
            
            if (sortedExpressions.length > 0) {
              const primary = sortedExpressions[0][0];
              setCurrentEmotion(primary.charAt(0).toUpperCase() + primary.slice(1));
            }

            const confidenceScore = calculateConfidence(detection.expressions, eyeContact);
            setLiveConfidence(confidenceScore);
          }
        }
      } catch (err) {
        console.error("❌ [FaceAPI] Error in tracking frame:", err);
      }
      
      timeoutId = setTimeout(() => {
        requestAnimationFrame(trackFace);
      }, 300);
    };

    requestAnimationFrame(trackFace);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [modelsLoaded, videoOn, isCompleted]);

  // 3. Socket Transmission of Live Metrics
  useEffect(() => {
    if (!isRecording || !socketRef.current) return;

    const interval = setInterval(() => {
      console.log(`📡 [Socket] Submitting live metrics - Confidence: ${liveConfidence}%, Gaze: ${isLookingAtScreen}, Emotion: ${currentEmotion}`);
      socketRef.current?.emit('submit-metrics', {
        roomId,
        confidence: liveConfidence,
        eyeContact: isLookingAtScreen,
        expression: currentEmotion
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isRecording, liveConfidence, isLookingAtScreen, currentEmotion, roomId]);

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
      
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/wav',
        ''
      ].find(type => type === '' || MediaRecorder.isTypeSupported(type));

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
          const durationMinutes = parseInt(duration, 10) || 30;
          const totalSecondsLimit = durationMinutes * 60;
          const remainingSeconds = Math.max(0, totalSecondsLimit - elapsedSeconds);
          
          socketRef.current?.emit('user-answer', { 
            roomId, 
            audio: base64Audio,
            remainingSeconds 
          });
        };
        audioChunksRef.current = [];
      };

    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const joinInterview = () => {
    if (!socketRef.current) {
      console.error("Socket not connected");
      return;
    }
    socketRef.current.emit('join-interview', { 
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
      setIsRecording(false);
    }
  };

  const completion = Math.min((elapsedSeconds / (parseInt(duration, 10) * 60 || 1)) * 100, 100);

  return (
    <div className="flex flex-col h-screen text-foreground font-outfit overflow-hidden pt-24 selection:bg-accent/30 relative">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hero-light.png')] dark:bg-[url('/images/hero-dark.png')] bg-cover bg-center transition-all duration-1000 scale-110 brightness-95 dark:brightness-50 blur-xl" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
      </div>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 p-6 gap-6">
        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 rounded-[2.5rem] glass-card overflow-hidden relative shadow-3xl flex items-center justify-center p-1">
            <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden bg-background/20">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-1000 ${videoOn ? 'opacity-100' : 'opacity-0'}`} 
              />
              
              {!videoOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
                  <div className="w-24 h-24 rounded-3xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center mb-6">
                    <VideoOff size={32} className="text-foreground/40 dark:text-foreground/20" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">Camera Disabled</span>
                </div>
              )}
              
              <div className="absolute top-6 left-6 flex gap-3">
                {isRecording && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2.5 px-4 py-2 bg-red-500/10 backdrop-blur-md rounded-full border border-red-500/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Recording</span>
                  </motion.div>
                )}
                <div className="flex items-center gap-2.5 px-4 py-2 bg-background/40 backdrop-blur-md rounded-full border border-foreground/5">
                  <ShieldCheck size={14} className="text-accent" />
                  <span className="text-[10px] font-bold text-foreground/80 dark:text-foreground/60 uppercase tracking-widest">E2E Encrypted</span>
                </div>
              </div>

              <div className="absolute top-6 right-6 rounded-2xl glass-card p-4 min-w-48 bg-background/40 backdrop-blur-xl border-foreground/5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-foreground/60 dark:text-foreground/40 mb-2">
                  <span>Session progress</span>
                  <span>{Math.round(completion)}%</span>
                </div>
                <div className="h-1 rounded-full bg-foreground/5 overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000 ease-out" style={{ width: `${completion}%` }} />
                </div>
              </div>

              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 bg-background/40 backdrop-blur-md rounded-full border border-foreground/5 flex items-center gap-2.5">
                   <Activity size={14} className={audioOn ? "text-accent" : "text-foreground/40 dark:text-foreground/20"} />
                   <span className="text-[10px] font-bold text-foreground/80 dark:text-foreground/60 uppercase tracking-widest">{audioOn ? 'Audio capturing' : 'Muted'}</span>
                </div>
              </div>

              {!isJoined && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-xl"
                >
                  <div className="glass-card p-12 rounded-[3rem] max-w-md w-full text-center shadow-3xl">
                    <div className="w-20 h-20 bg-accent text-background rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/20">
                      <Video size={32} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Ready to join?</h2>
                    <p className="text-foreground/70 dark:text-foreground/50 text-sm font-medium mb-10 leading-relaxed">
                      Your camera and microphone settings have been configured. The AI is ready to begin.
                    </p>
                    <button 
                      onClick={joinInterview}
                      className="w-full py-5 bg-accent text-background rounded-2xl font-bold text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-accent/20"
                    >
                      Join Session
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-24 glass-card rounded-[2rem] flex items-center justify-between gap-6 px-10 shadow-2xl">
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  focusMode ? "text-accent" : "text-foreground/60 dark:text-foreground/40 hover:text-foreground"
                }`}
              >
                <Zap size={14} fill={focusMode ? "currentColor" : "none"} />
                Focus mode {focusMode ? "on" : "off"}
              </button>
              <div className="h-4 w-px bg-foreground/10" />
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                <Gauge size={14} className="text-accent" />
                Confidence: <span className="text-foreground font-black">{modelsLoaded ? `${liveConfidence}%` : "Analyzing..."}</span>
              </div>
              <div className="h-4 w-px bg-foreground/10" />
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                <div className={`w-1.5 h-1.5 rounded-full ${isLookingAtScreen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                Gaze: <span className="text-foreground font-black">{isLookingAtScreen ? "Focused" : "Looking Away"}</span>
              </div>
              <div className="h-4 w-px bg-foreground/10" />
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40">
                Emotion: <span className="text-foreground font-black">{currentEmotion}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAudioOn(!audioOn)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                    audioOn 
                      ? 'bg-foreground/[0.03] border-foreground/5 text-foreground hover:bg-foreground/[0.06]' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}
                >
                  {audioOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button 
                  onClick={() => setVideoOn(!videoOn)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                    videoOn 
                      ? 'bg-foreground/[0.03] border-foreground/5 text-foreground hover:bg-foreground/[0.06]' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}
                >
                  {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
              </div>

              <div className="h-4 w-px bg-foreground/10 mx-2" />

              <button 
                onClick={toggleRecording}
                disabled={!isJoined}
                className={`relative h-14 px-10 rounded-2xl font-bold text-[13px] tracking-widest uppercase transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shadow-lg shadow-red-500/10' 
                    : 'bg-accent text-background hover:scale-[1.02] shadow-2xl shadow-accent/20'
                }`}
              >
                {isRecording ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-500 animate-pulse" />
                    Stop Answering
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-background" />
                    Start Answering
                  </>
                )}
              </button>

              {isJoined && (
                <button 
                  onClick={endInterview}
                  className="h-14 px-6 rounded-2xl font-bold text-[11px] tracking-widest uppercase transition-all bg-foreground/[0.03] border border-foreground/5 text-foreground/60 dark:text-foreground/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95"
                >
                  End Interview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Transcript & Intelligence */}
        <aside className="w-full lg:w-[440px] flex flex-col glass-card rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-foreground/5 bg-foreground/[0.02]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center shadow-lg shadow-accent/20">
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg tracking-tight">Analysis & Transcript</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 dark:text-foreground/30 italic serif">Real-time AI processing</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Turns', val: transcript.length },
                { label: 'AI State', val: 'Active', color: 'text-accent' },
                { label: 'Pacing', val: isRecording ? "Live" : "Paused" }
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-foreground/[0.03] border border-foreground/5 p-4 text-center group hover:bg-foreground/[0.06] transition-colors">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/40 dark:text-foreground/20 mb-1">{s.label}</p>
                  <p className={`text-xs font-bold ${s.color || 'text-foreground'}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10 aurora-scroll scrollbar-hide">
            <AnimatePresence initial={false}>
              {transcript.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[9px] font-black text-foreground/40 dark:text-foreground/20 uppercase tracking-[0.25em] mb-3 px-1">
                    {m.role === 'ai' ? 'Interviewer' : 'You'}
                  </div>
                  <div className={`max-w-[90%] p-6 rounded-[2rem] text-[15px] font-medium leading-relaxed ${
                    m.role === 'ai' 
                      ? 'bg-foreground/[0.03] border border-foreground/5 text-foreground rounded-tl-none' 
                      : 'bg-accent/10 border border-accent/20 text-foreground rounded-tr-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {transcript.length === 0 && isJoined && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center animate-pulse">
                    <Activity size={24} className="text-foreground/10" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 dark:text-foreground/20">Session started. The AI will speak shortly.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-foreground/[0.02] border-t border-foreground/5 space-y-6">
            <div className="min-h-[40px]">
              {liveTranscript ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                  <p className="text-[13px] text-foreground/80 dark:text-foreground/60 leading-relaxed font-medium italic">
                    {liveTranscript}
                  </p>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 text-foreground/40 dark:text-foreground/20">
                  <Mic size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Listening for response...</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-12 rounded-2xl border border-foreground/5 bg-foreground/[0.03] text-[11px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40 hover:bg-accent hover:text-background hover:border-accent transition-all duration-300 flex items-center justify-center gap-3">
                <Bot size={16} /> Ask Hint
              </button>
              <button className="h-12 rounded-2xl border border-foreground/5 bg-foreground/[0.03] text-[11px] font-bold uppercase tracking-widest text-foreground/60 dark:text-foreground/40 hover:bg-accent hover:text-background hover:border-accent transition-all duration-300 flex items-center justify-center gap-3">
                <CirclePause size={16} /> Pause AI
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Evaluation Result Layer */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-3xl overflow-y-auto p-6"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-5xl w-full glass-card rounded-[4rem] p-1 shadow-3xl overflow-hidden"
            >
              <div className="bg-background/40 p-12 md:p-20 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

                <header className="text-center mb-20 relative">
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
                    <ShieldCheck size={16} />
                    Interview Evaluation Completed
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
                    Performance Summary <br />
                    <span className="opacity-60 dark:opacity-40 italic serif text-foreground">Synthesis Complete.</span>
                  </h2>
                  <p className="text-foreground/70 dark:text-foreground/50 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Review your technical score, personalized feedback, and recommendations below.
                  </p>
                </header>

                {isGeneratingFeedback ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-10">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 rounded-full border-[6px] border-foreground/[0.03]" />
                      <div className="absolute inset-0 rounded-full border-[6px] border-t-accent animate-spin" />
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-xs font-bold text-accent uppercase tracking-[0.4em] animate-pulse">
                        AI is synthesizing feedback...
                      </p>
                      <p className="text-[10px] text-foreground/50 dark:text-foreground/30 font-bold uppercase tracking-widest">Evaluating technical responses, pacing, and vocabulary</p>
                    </div>
                  </div>
                ) : feedback ? (
                  <div className="space-y-16 relative">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-stretch">
                      {/* Score Sphere */}
                      <div className="md:col-span-5 glass-card rounded-[3rem] p-12 flex flex-col items-center justify-center text-center relative group">
                        <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                          <div className="absolute inset-0 rounded-full border border-accent/10 animate-spin-slow" />
                          <div className="absolute inset-4 rounded-full border border-accent/20" />
                          <div className="absolute inset-8 rounded-full bg-background flex flex-col items-center justify-center border border-foreground/5 shadow-2xl">
                            <span className="text-7xl font-black text-foreground tracking-tighter">
                              {feedback.overallScore}
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-foreground/40 dark:text-foreground/20">Out of 100</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Overall Score</h3>
                        <p className="text-[11px] font-bold text-foreground/60 dark:text-foreground/40 uppercase tracking-widest leading-relaxed">Based on technical correctness and communication quality.</p>
                      </div>

                      {/* Summary */}
                      <div className="md:col-span-7 flex flex-col gap-8">
                        <div className="glass-card rounded-[3rem] p-10 flex-1 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Activity size={32} className="text-accent" />
                          </div>
                          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/50 dark:text-foreground/30 mb-8 flex items-center gap-4">
                            Executive Summary
                            <div className="h-px flex-1 bg-foreground/5" />
                          </h3>
                          <p className="text-xl text-foreground font-medium leading-relaxed italic serif opacity-80">
                            "{feedback.summary}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="glass-card rounded-[2.5rem] p-8 text-center border-accent/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/50 dark:text-foreground/30 mb-2">Response Pacing</p>
                            <p className="text-xl font-bold text-foreground tracking-tight">{feedback.pacing}</p>
                          </div>
                          <div className="glass-card rounded-[2.5rem] p-8 text-center border-accent/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/50 dark:text-foreground/30 mb-2">Turns Completed</p>
                            <p className="text-xl font-bold text-foreground tracking-tight">{transcript.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="glass-card rounded-[3rem] p-12 border-accent/5">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/50 dark:text-foreground/30 mb-10 flex items-center gap-4">
                          Key Strengths
                          <div className="h-px flex-1 bg-foreground/5" />
                        </h4>
                        <ul className="space-y-6">
                          {feedback.strengths?.map((strength: string, idx: number) => (
                            <li key={idx} className="text-[15px] font-bold text-foreground flex items-start gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-card rounded-[3rem] p-12 border-foreground/10 bg-foreground/[0.01]">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/50 dark:text-foreground/30 mb-10 flex items-center gap-4">
                          Areas of Focus
                          <div className="h-px flex-1 bg-foreground/5" />
                        </h4>
                        <ul className="space-y-6">
                          {feedback.improvements?.map((imp: string, idx: number) => (
                            <li key={idx} className="text-[15px] font-bold text-foreground/60 dark:text-foreground/40 flex items-start gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-foreground/20 mt-2" />
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-10 flex flex-col md:flex-row justify-center gap-6">
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-12 py-6 bg-accent text-background rounded-full font-bold text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-3xl shadow-accent/20"
                      >
                        Start New Session
                      </button>
                      <button className="px-12 py-6 bg-foreground/[0.03] border border-foreground/5 text-foreground rounded-full font-bold text-xl hover:bg-foreground/[0.06] transition-all">
                        Archive Result
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <p className="text-xl font-medium text-foreground/60 dark:text-foreground/40">Evaluation retrieval failed. Neural link timeout.</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-10 py-4 bg-accent text-background rounded-full font-bold text-sm hover:scale-105 transition-all"
                    >
                      Restart Anytime
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
