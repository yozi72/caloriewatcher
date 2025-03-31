
import { FoodAnalysisResult } from '@/components/FoodAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Analyze food image using OpenAI via Supabase Edge Function
export const analyzeFoodImage = async (
  imageData: string,
  setIsAnalyzing: (value: boolean) => void,
  setAnalysisResult: (result: FoodAnalysisResult | null) => void,
  toast: ReturnType<typeof useToast>['toast']
) => {
  setIsAnalyzing(true);
  
  try {
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { imageData },
    });
    
    if (error) {
      throw error;
    }
    
    setAnalysisResult(data);
    toast({
      title: "Analysis Complete",
      description: "Your meal has been analyzed successfully",
    });
  } catch (error: any) {
    console.error("Error analyzing food:", error);
    toast({
      title: "Analysis Failed",
      description: error.message || "Could not analyze the food image",
      variant: "destructive",
    });
    
    // Fallback to simulated analysis if AI analysis fails
    fallbackAnalysis(imageData, setAnalysisResult, toast);
  } finally {
    setIsAnalyzing(false);
  }
};

// Fallback analysis when AI analysis fails
export const fallbackAnalysis = (
  imageData: string, 
  setAnalysisResult: (result: FoodAnalysisResult) => void,
  toast: ReturnType<typeof useToast>['toast']
) => {
  // Generate a simple hash from the image to create consistent variations
  let hash = 0;
  for (let i = 0; i < 100; i++) {
    const char = imageData.charCodeAt(i % imageData.length);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  hash = Math.abs(hash);
  
  const foodTypes = [
    'Grilled Salmon with Vegetables',
    'Chicken Caesar Salad',
    'Vegetable Stir Fry',
    'Steak with Potatoes',
    'Quinoa Bowl with Avocado',
    'Pasta with Tomato Sauce',
    'Greek Yogurt with Berries'
  ];
  
  const foodIndex = hash % foodTypes.length;
  const baseCalories = 300 + (hash % 400);
  const baseProtein = 20 + (hash % 30);
  const baseCarbs = 15 + (hash % 40);
  const baseFat = 10 + (hash % 25);
  const baseHealthScore = 65 + (hash % 31);
  
  const explanations = [
    "Rich in omega-3 fatty acids and protein. The vegetables provide essential fiber and vitamins.",
    "A good source of lean protein. Watch the dressing as it may contain hidden sugars.",
    "High in fiber and antioxidants from the variety of vegetables.",
    "High-quality protein but be mindful of the saturated fat content.",
    "Plant-based protein with healthy fats from the avocado.",
    "Complex carbohydrates that provide steady energy. Consider whole grain pasta for better nutrition.",
    "Excellent source of probiotics and calcium. The berries add antioxidants and natural sweetness."
  ];
  
  const startLevel = 80 + (hash % 10);
  const peakOffset = 20 + (hash % 40);
  
  const mockResult: FoodAnalysisResult = {
    foodName: foodTypes[foodIndex],
    calories: baseCalories,
    protein: baseProtein,
    carbs: baseCarbs,
    fat: baseFat,
    healthScore: baseHealthScore,
    bloodSugarImpact: [
      { time: '0 min', level: startLevel },
      { time: '30 min', level: startLevel + peakOffset / 2 },
      { time: '60 min', level: startLevel + peakOffset },
      { time: '90 min', level: startLevel + (peakOffset / 2) },
    ],
    explanation: explanations[foodIndex],
    advice: "Consider portion control and pairing with a balanced mix of other food groups."
  };
  
  setAnalysisResult(mockResult);
  
  toast({
    title: "Using Simulated Analysis",
    description: "AI analysis unavailable. Using simulated results instead.",
    variant: "default",
  });
};
