
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

const mockDailyStats = {
  calories: 1450,
  calorieGoal: 2000,
  bloodSugarAvg: 105,
  mealCount: 3,
  healthScore: 7.8,
};

const mockWeeklyData = [
  { day: 'Mon', calories: 1820, healthScore: 6.5 },
  { day: 'Tue', calories: 1650, healthScore: 7.2 },
  { day: 'Wed', calories: 1930, healthScore: 5.8 },
  { day: 'Thu', calories: 1720, healthScore: 8.1 },
  { day: 'Fri', calories: 1450, healthScore: 7.8 },
  { day: 'Sat', calories: 0, healthScore: 0 },
  { day: 'Sun', calories: 0, healthScore: 0 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NutriScan</h1>
            <p className="text-gray-500">Track your nutrition and health</p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
        
        <Dashboard 
          dailyStats={mockDailyStats}
          weeklyData={mockWeeklyData}
        />
      </main>
      <Header />
    </div>
  );
};

export default Index;
