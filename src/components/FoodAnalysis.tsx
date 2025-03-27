
import React from 'react';
import NutritionCard from './NutritionCard';
import BloodSugarChart from './BloodSugarChart';
import { ChartBar } from 'lucide-react';

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  bloodSugarImpact: {
    time: string;
    level: number;
  }[];
}

interface FoodAnalysisProps {
  result: FoodAnalysisResult;
  loading?: boolean;
}

const FoodAnalysis: React.FC<FoodAnalysisProps> = ({ result, loading = false }) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'bg-health-green';
    if (score >= 5) return 'bg-health-yellow';
    return 'bg-health-red';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-60 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">{result.foodName}</h2>
        <p className="text-gray-500 mt-1">Nutritional Analysis</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <NutritionCard
          title="Calories"
          value={result.calories}
          unit="kcal"
          color="bg-health-blue"
          className="col-span-2"
        />
        <NutritionCard
          title="Protein"
          value={result.protein}
          unit="g"
          color="bg-health-purple"
        />
        <NutritionCard
          title="Carbs"
          value={result.carbs}
          unit="g"
          color="bg-health-orange"
        />
        <NutritionCard
          title="Fat"
          value={result.fat}
          unit="g"
          color="bg-health-yellow"
        />
        <NutritionCard
          title="Health Score"
          value={result.healthScore}
          unit="/10"
          color={getHealthScoreColor(result.healthScore)}
          icon={<ChartBar className="w-5 h-5" color={result.healthScore >= 8 ? "#10B981" : result.healthScore >= 5 ? "#FBBF24" : "#EF4444"} />}
        />
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-subtle">
        <h3 className="text-lg font-medium mb-2">Blood Sugar Impact</h3>
        <p className="text-sm text-gray-500 mb-4">Estimated impact over time</p>
        <BloodSugarChart data={result.bloodSugarImpact} />
      </div>
    </div>
  );
};

export default FoodAnalysis;
