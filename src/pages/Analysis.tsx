
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BloodSugarChart from '@/components/BloodSugarChart';
import NutritionCard from '@/components/NutritionCard';
import { ChartBar } from 'lucide-react';

// Mock data
const mockMeals = [
  {
    id: '1',
    name: 'Breakfast - Avocado Toast',
    time: '8:30 AM',
    calories: 350,
    healthScore: 8.2,
    bloodSugarImpact: [
      { time: '0 min', level: 88 },
      { time: '30 min', level: 115 },
      { time: '60 min', level: 130 },
      { time: '90 min', level: 110 },
    ]
  },
  {
    id: '2',
    name: 'Lunch - Grilled Salmon',
    time: '12:45 PM',
    calories: 420,
    healthScore: 8.5,
    bloodSugarImpact: [
      { time: '0 min', level: 85 },
      { time: '30 min', level: 110 },
      { time: '60 min', level: 125 },
      { time: '90 min', level: 105 },
    ]
  },
  {
    id: '3',
    name: 'Snack - Greek Yogurt',
    time: '3:30 PM',
    calories: 180,
    healthScore: 7.8,
    bloodSugarImpact: [
      { time: '0 min', level: 82 },
      { time: '30 min', level: 100 },
      { time: '60 min', level: 108 },
      { time: '90 min', level: 95 },
    ]
  },
];

const Analysis = () => {
  const [selectedMeal, setSelectedMeal] = useState(mockMeals[0]);
  const [showMealDetails, setShowMealDetails] = useState(false);
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'bg-health-green';
    if (score >= 5) return 'bg-health-yellow';
    return 'bg-health-red';
  };
  
  const handleMealSelect = (meal: typeof mockMeals[0]) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };
  
  useEffect(() => {
    // Animate in details when a meal is selected
    const timer = setTimeout(() => {
      const detailsEl = document.getElementById('meal-details');
      if (detailsEl) {
        detailsEl.classList.add('animate-scale-in');
        detailsEl.classList.remove('opacity-0', 'scale-95');
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [showMealDetails]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meal Analysis</h1>
          <p className="text-gray-500">Review your nutritional insights</p>
        </div>
        
        {showMealDetails ? (
          <div id="meal-details" className="space-y-6 opacity-0 transform scale-95 transition-all">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">{selectedMeal.name}</h2>
              <button 
                onClick={() => setShowMealDetails(false)}
                className="text-health-blue"
              >
                Back to meals
              </button>
            </div>
            
            <p className="text-gray-500">{selectedMeal.time}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <NutritionCard
                title="Calories"
                value={selectedMeal.calories}
                unit="kcal"
                color="bg-health-blue"
              />
              <NutritionCard
                title="Health Score"
                value={selectedMeal.healthScore.toFixed(1)}
                unit="/10"
                color={getHealthScoreColor(selectedMeal.healthScore)}
                icon={<ChartBar className="w-5 h-5" color={selectedMeal.healthScore >= 8 ? "#10B981" : selectedMeal.healthScore >= 5 ? "#FBBF24" : "#EF4444"} />}
              />
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-subtle">
              <h3 className="text-lg font-medium mb-2">Blood Sugar Impact</h3>
              <p className="text-sm text-gray-500 mb-4">Estimated impact over time</p>
              <BloodSugarChart data={selectedMeal.bloodSugarImpact} />
            </div>
            
            {/* Additional nutritional details could go here */}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Today's Meals</h2>
              <div className="text-sm text-gray-500">
                {mockMeals.length} meals
              </div>
            </div>
            
            {mockMeals.map((meal) => (
              <div 
                key={meal.id}
                onClick={() => handleMealSelect(meal)}
                className="bg-white rounded-xl p-4 shadow-subtle flex justify-between items-center cursor-pointer hover:shadow-elevated transition-shadow duration-300"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthScoreColor(meal.healthScore)}`} />
                    <h3 className="font-medium">{meal.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{meal.time}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{meal.calories}</p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Header />
    </div>
  );
};

export default Analysis;
