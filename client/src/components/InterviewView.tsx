"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Activity, AlignLeft, ShieldCheck, Zap, Timer, Gauge, Bot, CirclePause, ChevronRight, RefreshCw, X, Sparkles, Star, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocketToken } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { calculateEyeContact, calculateConfidence } from '@/lib/gaze';

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

interface InterviewViewProps {
  topic: string;
  difficulty: string;
  duration: string;
  roomId: string;
  userId?: string;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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
        
        const token = await getSocketToken();
        console.log("🔑 [Socket] Token response retrieved:", token ? "Token acquired" : "No token found");
        
        if (!active) return;

        const newSocket = io(SOCKET_SERVER, {
          auth: { token },
          transports: ['websocket']
        });

        newSocket.on('connect', () => {
          console.log("✅ [Socket] Connected successfully! Session ID:", newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
          console.error("❌ [Socket] Connection error event:", err.message);
        });

        newSocket.on('ai-message', async (data) => {
          console.log("🤖 [Socket] AI message received:", data);
          setTranscript(prev => [...prev, { role: 'ai', text: data.text }]);
          if (data.audio) {
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
    <div className="flex flex-col h-screen text-foreground font-outfit overflow-hidden bg-background">
      
      {/* Header Context Bar */}
      <header className="h-16 px-6 flex justify-between items-center bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border-b border-border/40 z-20 transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 shadow-sm">
            <Zap size={15} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-foreground">Aura Session Workspace</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-background/50 border border-border/80 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System Live</span>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-foreground">
            <Timer size={13} className="text-blue-500" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="h-4 w-px bg-border/80" />
          <div className="flex gap-2">
            <span className="px-2.5 py-1 bg-zinc-900/10 dark:bg-black/20 text-muted-foreground rounded-lg text-xs font-light border border-border/80">
              {topic}
            </span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/20">
              {difficulty}
            </span>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative p-4 gap-4 bg-background">
        
        {/* Decorative background glows */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-blue-500/5 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-20 right-8 h-80 w-80 rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

        {/* Left Side: Video container & bottom settings */}
        <div className="flex-1 flex flex-col relative z-10 gap-4">
          
          {/* Main Video Box */}
          <div className="flex-1 rounded-2xl bg-white/70 dark:bg-zinc-950/40 border border-border/60 overflow-hidden relative shadow-md flex items-center justify-center p-1">
            <div className="relative w-full h-full rounded-[1.2rem] overflow-hidden bg-zinc-900/10 dark:bg-black/20">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-700 ${videoOn ? 'opacity-100' : 'opacity-0'}`} 
              />
              
              {!videoOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95">
                  <div className="w-16 h-16 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center mb-4">
                    <VideoOff size={28} className="text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Camera Feed Paused</span>
                </div>
              )}
              
              {/* Internal top overlay indicators */}
              <div className="absolute top-4 left-4 flex gap-2">
                {isRecording && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 backdrop-blur-md rounded-full border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-red-500 uppercase tracking-widest">Recording Response</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-md rounded-full border border-border/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>Secure link</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md p-3 min-w-[160px]">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                  <span>Session progress</span>
                  <span>{Math.round(completion)}%</span>
                </div>
                <div className="h-1 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-600 dark:bg-cyan-400 transition-all duration-500" style={{ width: `${completion}%` }} />
                </div>
              </div>

              <div className="absolute bottom-4 left-4">
                <div className="px-3 py-1.5 bg-background/60 backdrop-blur-md rounded-full border border-border/60 flex items-center gap-2">
                   <Activity size={13} className={audioOn ? "text-blue-500 animate-pulse" : "text-muted-foreground"} />
                   <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{audioOn ? 'Audio active' : 'Muted'}</span>
                </div>
              </div>

              {/* Ready to join screen */}
              {!isJoined && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm"
                >
                  <div className="p-8 rounded-2xl max-w-sm w-full text-center border border-border/60 bg-white/90 dark:bg-zinc-900/60 shadow-xl backdrop-blur-xl">
                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                      <Video size={24} className="text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-1.5 text-foreground">Join the Room</h2>
                    <p className="text-muted-foreground text-xs font-light mb-8">
                      Your camera and microphone have been configured. Click join to initiate the session with the AI.
                    </p>
                    <Button 
                      onClick={joinInterview}
                      className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl shadow-md"
                    >
                      Join Session
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Lower Control Bar */}
          <div className="h-20 bg-white/70 dark:bg-zinc-950/50 border border-border/60 rounded-2xl flex items-center justify-between gap-4 px-6 z-10 shadow-sm backdrop-blur-xl">
            
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant={focusMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className="text-xs h-9 rounded-xl px-4 border border-border/80 bg-background/50"
              >
                Focus Mode {focusMode ? "On" : "Off"}
              </Button>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/50 px-3.5 py-1.5 text-xs text-muted-foreground">
                <Gauge size={13} className="text-blue-500" />
                <span>Confidence: <span className="font-semibold text-foreground">{modelsLoaded ? `${liveConfidence}%` : "Analyzing..."}</span></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/50 px-3.5 py-1.5 text-xs text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full ${isLookingAtScreen ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <span>Gaze: <span className="font-semibold text-foreground">{isLookingAtScreen ? "Focused" : "Away"}</span></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/50 px-3.5 py-1.5 text-xs text-muted-foreground">
                <span>Emotion: <span className="font-semibold text-foreground">{currentEmotion}</span></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              
              {/* Mic & Video toggles */}
              <Button 
                onClick={() => setAudioOn(!audioOn)}
                variant="outline"
                size="icon"
                className={`w-10 h-10 rounded-xl border ${
                  audioOn 
                    ? 'bg-background/50 border-border/80 text-muted-foreground hover:bg-muted' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {audioOn ? <Mic size={18} /> : <MicOff size={18} />}
              </Button>

              <Button 
                onClick={() => setVideoOn(!videoOn)}
                variant="outline"
                size="icon"
                className={`w-10 h-10 rounded-xl border ${
                  videoOn 
                    ? 'bg-background/50 border-border/80 text-muted-foreground hover:bg-muted' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </Button>

              <div className="h-4 w-px bg-border/80" />

              {/* Answering Toggle Button */}
              <Button 
                onClick={toggleRecording}
                disabled={!isJoined}
                className={`h-11 px-6 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isRecording 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white shadow-md'
                }`}
              >
                {isRecording ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
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
                  className="h-11 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                >
                  End Session
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Transcript & Analytics */}
        <aside className="w-full lg:w-[400px] flex flex-col bg-white/70 dark:bg-zinc-950/40 border border-border/60 rounded-2xl z-10 shadow-sm overflow-hidden backdrop-blur-xl">
          
          <div className="p-5 border-b border-border/60 bg-zinc-900/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <AlignLeft size={16} className="text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-foreground uppercase tracking-wider">Analysis & Transcript</h2>
                <p className="text-[10px] text-muted-foreground font-light">Real-time processing active</p>
              </div>
            </div>

            {/* Live stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border/60 bg-background/40 p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Turns</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{transcript.length}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">AI State</p>
                <p className="text-xs font-bold text-blue-500 mt-0.5">Active</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Pacing</p>
                <p className="text-xs font-bold text-purple-500 mt-0.5">{isRecording ? "Live" : "Idle"}</p>
              </div>
            </div>
          </div>
          
          {/* Scrollable conversation logs */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
            <AnimatePresence initial={false}>
              {transcript.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1">
                    {m.role === 'ai' ? 'Interviewer' : 'You'}
                  </div>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed border ${
                    m.role === 'ai' 
                      ? 'bg-zinc-900/10 dark:bg-black/20 border-border/80 text-foreground rounded-tl-none' 
                      : 'bg-blue-500/10 border-blue-500/20 text-foreground rounded-tr-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {transcript.length === 0 && isJoined && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 py-16">
                  <Activity size={20} className="opacity-40 animate-pulse text-blue-500" />
                  <p className="text-xs font-light">Session connected. Awaiting interviewer prompt...</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Lower live transcript preview */}
          <div className="p-4 bg-zinc-900/[0.02] border-t border-border/60 space-y-4">
            <div className="min-h-[40px]">
              {liveTranscript ? (
                <div className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  <p className="text-xs text-foreground/80 leading-relaxed italic">
                    {liveTranscript}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mic size={13} />
                  <p className="text-[10px] font-semibold uppercase tracking-wider">Listening for response...</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="border-border/80 bg-background/40 hover:bg-muted text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-xl">
                <Bot size={13} /> Ask Hint
              </Button>
              <Button size="sm" variant="outline" className="border-border/80 bg-background/40 hover:bg-muted text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-xl">
                <CirclePause size={13} /> Pause AI
              </Button>
            </div>
          </div>

        </aside>
      </main>

      {/* Evaluation Result Screen */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl overflow-y-auto p-4 md:p-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl w-full my-auto"
            >
              <Card className="border border-border/60 bg-white/90 dark:bg-zinc-950/70 backdrop-blur-2xl shadow-2xl relative overflow-hidden p-1 rounded-3xl">
                {/* Internal glowing elements */}
                <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

                <CardHeader className="text-center pb-6 pt-8 relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-cyan-300 text-xs font-semibold tracking-wide mb-4 mx-auto">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>Evaluation Completed</span>
                  </div>
                  <CardTitle className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent pb-1">
                    Session Summary
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2 text-sm font-light px-4">
                    Review your technical score, detailed breakdowns, and personalized coaching highlights
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-6">
                  {isGeneratingFeedback ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
                      <p className="text-sm font-bold text-foreground uppercase tracking-widest animate-pulse">
                        Synthesizing feedback...
                      </p>
                      <p className="text-xs text-muted-foreground font-light">Analyzing technical responses, pacing, and vocabulary</p>
                    </div>
                  ) : feedback ? (
                    <div className="space-y-6">
                      
                      {/* Score and summary blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                        
                        {/* Overall score radial card */}
                        <div className="md:col-span-5 border border-border/60 bg-zinc-900/[0.01] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                            <div className="absolute inset-0 rounded-full border border-dashed border-border/80 animate-spin" style={{ animationDuration: '25s' }} />
                            <div className="absolute inset-2 rounded-full border border-blue-500/20" />
                            <div className="absolute inset-3 rounded-full bg-background flex flex-col items-center justify-center border border-border/60 shadow-inner">
                              <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                                {feedback.overallScore}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">Rating</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-foreground text-sm">Overall Score</h4>
                          <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] font-light leading-relaxed">Derived from question compliance, speech patterns and subject knowledge.</p>
                        </div>

                        {/* Summary details */}
                        <div className="md:col-span-7 flex flex-col justify-between gap-4">
                          <div className="border border-border/60 bg-zinc-900/[0.01] rounded-2xl p-5 flex-1">
                            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <Gauge size={14} className="text-blue-500" /> Executive Summary
                            </h4>
                            <p className="text-xs text-foreground/80 leading-relaxed font-light">
                              {feedback.summary}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="border border-border/60 bg-zinc-900/[0.01] rounded-2xl p-3.5 text-center">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Response Pacing</p>
                              <p className="text-sm font-bold text-blue-500 mt-1">{feedback.pacing}</p>
                            </div>
                            <div className="border border-border/60 bg-zinc-900/[0.01] rounded-2xl p-3.5 text-center">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Turns Completed</p>
                              <p className="text-sm font-bold text-purple-500 mt-1">{transcript.length}</p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Strengths & Weaknesses row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Strengths */}
                        <div className="bg-emerald-500/[0.02] border border-emerald-500/20 rounded-2xl p-5">
                          <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider mb-3.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Key Strengths
                          </h4>
                          <ul className="space-y-2.5">
                            {feedback.strengths?.map((strength: string, idx: number) => (
                              <li key={idx} className="text-foreground/80 text-xs flex items-start gap-2 font-light">
                                <span className="text-emerald-500 font-semibold">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvements */}
                        <div className="bg-amber-500/[0.02] border border-amber-500/20 rounded-2xl p-5">
                          <h4 className="font-semibold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider mb-3.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Areas of Focus
                          </h4>
                          <ul className="space-y-2.5">
                            {feedback.improvements?.map((imp: string, idx: number) => (
                              <li key={idx} className="text-foreground/80 text-xs flex items-start gap-2 font-light">
                                <span className="text-amber-500 font-semibold">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <p className="text-xs text-muted-foreground">Failed to load session evaluation. Don't worry, your progress has been logged.</p>
                      <Button 
                        onClick={() => window.location.reload()}
                        size="sm"
                        className="bg-primary text-primary-foreground rounded-lg"
                      >
                        Start New Prep
                      </Button>
                    </div>
                  )}
                </CardContent>

                {feedback && !isGeneratingFeedback && (
                  <CardFooter className="pb-8 pt-4 justify-center border-t border-border/40 bg-zinc-900/[0.01]">
                    <Button 
                      onClick={() => window.location.reload()}
                      className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md"
                    >
                      Start New Practice Session
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
