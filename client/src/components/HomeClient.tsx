"use client";

import React, { useState } from 'react';
import LandingView from "@/components/LandingView";
import InterviewView from "@/components/InterviewView";
import SetupView from "@/components/SetupView";
import AuthView from "@/components/AuthView";
import { Navbar } from "@/components/Navbar";

type ViewState = 'landing' | 'login' | 'signup' | 'setup' | 'interview';

interface HomeClientProps {
  initialUser: { id: string; email: string; name: string } | null;
}

export default function HomeClient({ initialUser }: HomeClientProps) {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState(initialUser);
  const [interviewConfig, setInterviewConfig] = useState({
    topic: '',
    difficulty: '',
    duration: '',
    roomId: ''
  });

  const handleStartSetup = () => {
    if (user) {
      setCurrentView('setup');
    } else {
      setCurrentView('signup');
    }
  };

  const handleLoginClick = () => {
    if (user) {
      setCurrentView('setup');
    } else {
      setCurrentView('login');
    }
  };

  const handleAuthSuccess = (authenticatedUser: { id: string; email: string; name: string }) => {
    setUser(authenticatedUser);
    setCurrentView('setup');
  };

  const handleSetupComplete = (config: { topic: string; difficulty: string; duration: string; roomId: string }) => {
    setInterviewConfig(config);
    setCurrentView('interview');
  };

  return (
    <main className="min-h-screen bg-background font-outfit">
      <Navbar 
        user={user} 
        onStart={handleStartSetup} 
        onLogin={handleLoginClick} 
        onHome={() => setCurrentView('landing')}
        showNavLinks={currentView === 'landing'}
      />
      {currentView === 'landing' && (
        <LandingView onStart={handleStartSetup} onLogin={handleLoginClick} user={user} />
      )}
      {(currentView === 'login' || currentView === 'signup') && (
        <AuthView initialMode={currentView} onSuccess={handleAuthSuccess} onBack={() => setCurrentView('landing')} />
      )}
      {currentView === 'setup' && (
        <SetupView onStart={handleSetupComplete} user={user} />
      )}
      {currentView === 'interview' && (
        <InterviewView 
          topic={interviewConfig.topic} 
          difficulty={interviewConfig.difficulty} 
          duration={interviewConfig.duration}
          roomId={interviewConfig.roomId}
          userId={user?.id}
        />
      )}
    </main>
  );
}
