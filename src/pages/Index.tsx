
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  daily_calorie_goal: number;
}

interface DailyStats {
  calories: number;
  calorieGoal: number;
  bloodSugarAvg: number;
  mealCount: number;
  healthScore: number;
}

interface WeeklyData {
  day: string;
  calories: number;
  healthScore: number;
}

// Define a type for the blood sugar impact data
interface BloodSugarPoint {
  time: string;
  level: number;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    calories: 0,
    calorieGoal: 2000,
    bloodSugarAvg: 0,
    mealCount: 0,
    healthScore: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('daily_calorie_goal')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Get today's date at midnight for filtering today's meals
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch today's meals
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });

        if (mealsError) throw mealsError;

        // Calculate daily stats
        if (mealsData && mealsData.length > 0) {
          const totalCalories = mealsData.reduce((sum, meal) => sum + meal.calories, 0);
          const avgHealthScore = mealsData.reduce((sum, meal) => sum + meal.health_score, 0) / mealsData.length;
          
          // Properly handle blood sugar impact data with type checking
          const avgBloodSugar = mealsData.reduce((sum, meal) => {
            if (meal.blood_sugar_impact && Array.isArray(meal.blood_sugar_impact)) {
              // Safely handle the JSON data by checking each item has the expected structure
              const validPoints = meal.blood_sugar_impact.filter(
                (point): point is BloodSugarPoint => 
                  typeof point === 'object' && 
                  point !== null && 
                  'level' in point && 
                  typeof point.level === 'number'
              );
              
              if (validPoints.length > 0) {
                const mealAvg = validPoints.reduce((s, point) => s + point.level, 0) / validPoints.length;
                return sum + mealAvg;
              }
            }
            return sum;
          }, 0) / (mealsData.length || 1); // Avoid division by zero

          setDailyStats({
            calories: totalCalories,
            calorieGoal: profileData?.daily_calorie_goal || 2000,
            bloodSugarAvg: Math.round(avgBloodSugar) || 100,
            mealCount: mealsData.length,
            healthScore: Number(avgHealthScore.toFixed(1)) || 7.5,
          });
        } else {
          setDailyStats({
            calories: 0,
            calorieGoal: profileData?.daily_calorie_goal || 2000,
            bloodSugarAvg: 95,
            mealCount: 0,
            healthScore: 0,
          });
        }

        // Fetch and calculate weekly data
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: weekData, error: weekError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false });

        if (weekError) throw weekError;

        // Process weekly data
        const weeklyStats: { [key: string]: { calories: number, healthScore: number, count: number } } = {};
        
        // Initialize all days
        weekDays.forEach(day => {
          weeklyStats[day] = { calories: 0, healthScore: 0, count: 0 };
        });

        // Fill with actual data
        if (weekData && weekData.length > 0) {
          weekData.forEach(meal => {
            const date = new Date(meal.created_at);
            const day = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Sunday
            
            if (weeklyStats[day]) {
              weeklyStats[day].calories += meal.calories;
              weeklyStats[day].healthScore += meal.health_score;
              weeklyStats[day].count += 1;
            }
          });
        }

        // Calculate averages and prepare final data
        const processedWeeklyData = weekDays.map(day => {
          const dayData = weeklyStats[day];
          return {
            day,
            calories: dayData.calories,
            healthScore: dayData.count > 0 ? Number((dayData.healthScore / dayData.count).toFixed(1)) : 0,
          };
        });

        setWeeklyData(processedWeeklyData);
      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, loading, navigate]);

  // Redirect to onboarding if user doesn't have a complete profile
  useEffect(() => {
    if (!loading && user && profile && profile.daily_calorie_goal === 0) {
      navigate('/onboarding');
    }
  }, [profile, user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HealthHub</h1>
            <p className="text-gray-500">Track your nutrition and health</p>
          </div>
          <div onClick={() => navigate('/goals')} className="w-10 h-10 bg-health-blue text-white rounded-full flex items-center justify-center cursor-pointer">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-health-blue"></div>
          </div>
        ) : (
          <Dashboard 
            dailyStats={dailyStats}
            weeklyData={weeklyData}
          />
        )}
      </main>
      <Header />
    </div>
  );
};

export default Index;
