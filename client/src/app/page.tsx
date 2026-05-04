"use client";

import React, { useState } from 'react';
import InterviewView from "@/components/InterviewView";
import SetupView from "@/components/SetupView";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [interviewData, setInterviewData] = useState({
    topic: "",
    difficulty: "Mid-level",
    duration: "30 min"
  });

  const handleStart = (data: { topic: string; difficulty: string; duration: string }) => {
    setInterviewData(data);
    setIsStarted(true);
  };

  return (
    <main>
      {!isStarted ? (
        <SetupView onStart={handleStart} />
      ) : (
        <InterviewView 
          topic={interviewData.topic} 
          difficulty={interviewData.difficulty} 
          duration={interviewData.duration} 
        />
      )}
    </main>
  );
}
