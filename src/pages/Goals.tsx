
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import GoalSetting from '@/components/GoalSetting';

// Mock initial goals
const initialGoals = [
  {
    id: '1',
    name: 'Daily Calorie Limit',
    target: 2000,
    unit: 'kcal',
    priority: 'high' as const,
  },
  {
    id: '2',
    name: 'Protein Intake',
    target: 120,
    unit: 'g',
    priority: 'medium' as const,
  },
  {
    id: '3',
    name: 'Keep Blood Sugar Below',
    target: 140,
    unit: 'mg/dL',
    priority: 'high' as const,
  },
];

const Goals = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Simulating a first-time user check
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);
  
  const handleSaveGoals = (updatedGoals: typeof goals) => {
    setGoals(updatedGoals);
    setShowWelcome(false);
  };
  
  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {showWelcome ? (
        <div className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center px-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-health-blue mb-6 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to NutriScan</h1>
          <p className="text-gray-500 text-center mb-8 max-w-md">
            Let's set up your health goals to personalize your experience and track your progress.
          </p>
          
          <button
            onClick={handleCloseWelcome}
            className="py-3 px-8 bg-health-blue text-white rounded-full shadow-lg"
          >
            Get Started
          </button>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Health Goals</h1>
            <p className="text-gray-500">Set and track your nutritional targets</p>
          </div>
          
          <GoalSetting 
            goals={goals}
            onSaveGoals={handleSaveGoals}
          />
        </main>
      )}
      <Header />
    </div>
  );
};

export default Goals;
