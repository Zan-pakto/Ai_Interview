"use client";

import React, { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_SERVER = "http://localhost:5000";

interface InterviewViewProps {
  topic: string;
  difficulty: string;
  duration: string;
}

export default function InterviewView({ topic, difficulty, duration }: InterviewViewProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
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

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          socket?.emit('user-answer', { roomId: 'test-room', audio: base64Audio });
        };
        audioChunksRef.current = [];
      };

    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const joinInterview = () => {
    socket?.emit('join-interview', { 
      roomId: 'test-room', 
      userId: 'user-' + Math.random(),
      topic,
      difficulty,
      duration
    });
    setIsJoined(true);
    startStream();
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      mediaRecorderRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden">
      {/* Cinematic Header */}
      <header className="h-20 px-8 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">AURA <span className="text-blue-500">AI</span></h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Active Session</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          <div className="px-4 py-2 bg-white/5 rounded-xl text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            {topic}
          </div>
          <div className="px-4 py-2 bg-blue-500/10 rounded-xl text-[11px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/20">
            {difficulty}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Ambient background glows */}
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px] -z-10" />

        {/* Left Section: Immersive Video Feed */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 group">
            {/* Video Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
            
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover transition-all duration-1000 ${videoOn ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} 
            />
            
            {!videoOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/40 backdrop-blur-2xl transition-all duration-500">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                  <VideoOff size={40} className="text-neutral-600" />
                </div>
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-[0.2em]">Visual Stream Paused</span>
              </div>
            )}
            
            {/* Immersive Overlays */}
            <div className="absolute top-8 left-8 z-20">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="text-xs font-black tracking-widest uppercase">Recording</span>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-20">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Mic size={14} className={audioOn ? "text-blue-400" : "text-red-400"} />
                </div>
                <span className="text-xs font-bold text-white/80">Audio Active</span>
              </div>
            </div>
          </div>

          {!isJoined && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505]/95 backdrop-blur-3xl"
            >
              <div className="text-center max-w-lg space-y-10 px-8">
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl border border-white/20">
                    <Rocket size={48} className="text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tight">Ready for takeoff?</h2>
                  <p className="text-neutral-500 leading-relaxed">
                    Take a deep breath. Your AI interviewer is ready to evaluate your skills in <span className="text-blue-400 font-bold">{topic}</span>.
                  </p>
                </div>
                <button 
                  onClick={joinInterview}
                  className="group relative w-full py-6 bg-white text-black rounded-3xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-white/10 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    ENTER INTERVIEW ROOM <ChevronRight size={24} />
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Section: Glassmorphic Sidebar */}
        <aside className="w-[450px] flex flex-col bg-white/[0.02] border-l border-white/5 backdrop-blur-4xl z-10">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <MessageSquare size={18} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="font-black text-sm uppercase tracking-widest text-neutral-300">Live Transcript</h2>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">AI Analysis Active</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            <AnimatePresence initial={false}>
              {transcript.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
                >
                  <div className={`max-w-[90%] p-6 rounded-[28px] text-[15px] leading-relaxed relative ${
                    m.role === 'ai' 
                      ? 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none shadow-xl shadow-black/20' 
                      : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-xl shadow-blue-500/20'
                  }`}>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 block ${
                      m.role === 'ai' ? 'text-blue-500' : 'text-blue-200'
                    }`}>
                      {m.role === 'ai' ? 'Interviewer' : 'You'}
                    </span>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5">
            {liveTranscript ? (
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <p className="text-sm italic text-neutral-400 leading-relaxed">
                  "{liveTranscript}"
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-neutral-600">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Response...</p>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Floating Control Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30">
        <button 
          onClick={() => setAudioOn(!audioOn)}
          className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${
            audioOn 
              ? 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white' 
              : 'bg-red-500/20 border-red-500/40 text-red-500'
          }`}
        >
          {audioOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button 
          onClick={toggleRecording}
          disabled={!isJoined}
          className={`group relative h-14 px-10 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center gap-4 disabled:opacity-50 ${
            isRecording 
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isRecording ? 'Finish Answer' : 'Start Answer'}
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-neutral-950'}`} />
        </button>

        <button 
          onClick={() => setVideoOn(!videoOn)}
          className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${
            videoOn 
              ? 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white' 
              : 'bg-red-500/20 border-red-500/40 text-red-500'
          }`}
        >
          {videoOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
      </div>
    </div>
  );
}
