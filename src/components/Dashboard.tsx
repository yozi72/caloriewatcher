
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import NutritionCard from './NutritionCard';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  dailyStats: {
    calories: number;
    calorieGoal: number;
    bloodSugarAvg: number;
    mealCount: number;
    healthScore: number;
  };
  weeklyData: {
    day: string;
    calories: number;
    healthScore: number;
  }[];
}

const Dashboard: React.FC<DashboardProps> = ({ dailyStats, weeklyData }) => {
  const navigate = useNavigate();
  const percentToGoal = Math.min(Math.round((dailyStats.calories / dailyStats.calorieGoal) * 100), 100);
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'bg-health-green';
    if (score >= 5) return 'bg-health-yellow';
    return 'bg-health-red';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500">Today's Progress</p>
        <div className="mt-1 flex items-baseline justify-center">
          <h2 className="text-3xl font-bold">{dailyStats.calories}</h2>
          <span className="text-sm text-gray-500 ml-1">/ {dailyStats.calorieGoal} kcal</span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 mx-auto w-full max-w-xs bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-health-blue h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentToGoal}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <NutritionCard
          title="Health Score"
          value={dailyStats.healthScore.toFixed(1)}
          unit="/10"
          color={getHealthScoreColor(dailyStats.healthScore)}
        />
        <NutritionCard
          title="Meals Today"
          value={dailyStats.mealCount}
          color="bg-health-orange"
        />
        <NutritionCard
          title="Avg. Blood Sugar"
          value={dailyStats.bloodSugarAvg}
          unit="mg/dL"
          color="bg-health-blue"
          className="col-span-2"
        />
      </div>
      
      {/* Weekly Chart */}
      <div className="bg-white rounded-xl p-4 shadow-subtle">
        <h3 className="text-lg font-medium mb-1">Weekly Overview</h3>
        <p className="text-sm text-gray-500 mb-4">Calories and health scores</p>
        
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              barGap={0}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax + 20%']}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                hide
              />
              <Tooltip />
              <Bar 
                yAxisId="left"
                dataKey="calories" 
                fill="#0EA5E9" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Bar 
                yAxisId="right"
                dataKey="healthScore" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Quick Add Meal Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => navigate('/capture')}
          className="flex items-center space-x-2 py-3 px-6 bg-health-blue text-white rounded-full shadow-lg"
        >
          <Camera size={20} />
          <span>Log a Meal</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
