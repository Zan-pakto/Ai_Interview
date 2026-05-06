"use client";

import React, { useState, useEffect } from 'react';
import LandingView from "@/components/LandingView";
import InterviewView from "@/components/InterviewView";
import SetupView from "@/components/SetupView";
import AuthView from "@/components/AuthView";

type ViewState = 'landing' | 'login' | 'signup' | 'setup' | 'interview';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [interviewData, setInterviewData] = useState({
    topic: "",
    difficulty: "Mid-level",
    duration: "30 min"
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }
  }, []);

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

  const handleStartInterview = (data: { topic: string; difficulty: string; duration: string }) => {
    setInterviewData(data);
    setCurrentView('interview');
  };

  return (
    <main>
      {currentView === 'landing' && (
        <LandingView 
          onGetStarted={handleStartSetup} 
          onLoginClick={handleLoginClick} 
        />
      )}
      {(currentView === 'login' || currentView === 'signup') && (
        <AuthView 
          initialMode={currentView}
          onSuccess={handleAuthSuccess}
          onBack={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'setup' && <SetupView onStart={handleStartInterview} />}
      {currentView === 'interview' && (
        <InterviewView 
          topic={interviewData.topic} 
          difficulty={interviewData.difficulty} 
          duration={interviewData.duration} 
          userId={user?.id}
        />
      )}
    </main>
  );
}
