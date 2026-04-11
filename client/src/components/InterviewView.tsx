"use client";

import React, { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_SERVER = "http://localhost:5000";

export default function InterviewView() {
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
      
      // Setup MediaRecorder for audio chunks
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
    socket?.emit('join-interview', { roomId: 'test-room', userId: 'user-' + Math.random() });
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
    <div className="flex flex-col h-screen bg-neutral-900 text-white font-sans">
      {/* Header */}
      <header className="p-4 border-b border-neutral-800 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          AI Interview Copilot
        </h1>
        <div className="px-3 py-1 bg-neutral-800 rounded-full text-sm text-neutral-400">
          Session: Tech Round 1
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Video Area */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          <div className="relative aspect-video w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover ${videoOn ? 'opacity-100' : 'opacity-0'}`} 
            />
            {!videoOn && (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                <VideoOff size={64} />
              </div>
            )}
            
            {/* Overlay Status */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-xs">
                You (Candidate)
              </span>
            </div>
          </div>

          {!isJoined && (
            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-10">
              <button 
                onClick={joinInterview}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-lg hover:scale-105"
              >
                Enter Interview Room
              </button>
            </div>
          )}
        </div>

        {/* Right: Transcript Area */}
        <div className="w-96 border-l border-neutral-800 flex flex-col bg-neutral-950">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-400" />
            <h2 className="font-semibold text-neutral-300">Live Transcript</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {transcript.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`p-3 rounded-lg text-sm ${
                  m.role === 'ai' 
                    ? 'bg-neutral-800 border-l-2 border-blue-500 text-neutral-200' 
                    : 'bg-blue-900/20 border-l-2 border-emerald-500 text-neutral-100'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">
                  {m.role === 'ai' ? 'AI Interviewer' : 'You'}
                </div>
                {m.text}
              </motion.div>
            ))}
          </div>

          {liveTranscript && (
            <div className="p-4 bg-neutral-900 border-t border-neutral-800 italic text-neutral-400 text-xs">
              Live: {liveTranscript}
            </div>
          )}
        </div>
      </main>

      {/* Control Bar */}
      <footer className="p-6 bg-neutral-900 border-t border-neutral-800 flex justify-center items-center gap-6">
        <button 
          onClick={() => setAudioOn(!audioOn)}
          className={`p-4 rounded-full transition-all ${audioOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 hover:bg-red-500'}`}
        >
          {audioOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button 
          onClick={toggleRecording}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
            isRecording ? 'bg-red-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isRecording ? 'Stop Answering' : 'Start Answer'}
        </button>

        <button 
          onClick={() => setVideoOn(!videoOn)}
          className={`p-4 rounded-full transition-all ${videoOn ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-red-600 hover:bg-red-500'}`}
        >
          {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </footer>
    </div>
  );
}
