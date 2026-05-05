"use client";

import React, { useState } from 'react';
import LandingView from "@/components/LandingView";
import InterviewView from "@/components/InterviewView";
import SetupView from "@/components/SetupView";

type ViewState = 'landing' | 'setup' | 'interview';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [interviewData, setInterviewData] = useState({
    topic: "",
    difficulty: "Mid-level",
    duration: "30 min"
  });

  const handleStartSetup = () => {
    setCurrentView('setup');
  };

  const handleStartInterview = (data: { topic: string; difficulty: string; duration: string }) => {
    setInterviewData(data);
    setCurrentView('interview');
  };

  return (
    <main>
      {currentView === 'landing' && <LandingView onGetStarted={handleStartSetup} />}
      {currentView === 'setup' && <SetupView onStart={handleStartInterview} />}
      {currentView === 'interview' && (
        <InterviewView 
          topic={interviewData.topic} 
          difficulty={interviewData.difficulty} 
          duration={interviewData.duration} 
        />
      )}
    </main>
  );
}
