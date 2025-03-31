
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FoodCapture from '@/components/FoodCapture';
import FoodAnalysis, { FoodAnalysisResult } from '@/components/FoodAnalysis';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Capture = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Analyze food image using OpenAI via Supabase Edge Function
  const analyzeFoodImage = async (imageData: string) => {
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
      fallbackAnalysis(imageData);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Fallback analysis when AI analysis fails
  const fallbackAnalysis = (imageData: string) => {
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
      variant: "default", // Fixed error by changing from "warning" to "default"
    });
  };
  
  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    analyzeFoodImage(imageData);
  };
  
  const handleSaveMeal = async () => {
    if (!user || !analysisResult || !capturedImage) {
      toast({
        title: "Error",
        description: "Missing data for saving meal",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload image to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      // Convert base64 to blob
      const base64Data = capturedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal_images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meal_images')
        .getPublicUrl(fileName);
      
      // Save meal data to database
      const { error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          name: analysisResult.foodName,
          image_url: publicUrl,
          calories: analysisResult.calories,
          protein: analysisResult.protein,
          carbs: analysisResult.carbs,
          fat: analysisResult.fat,
          health_score: analysisResult.healthScore, // Already on 50-100 scale
          blood_sugar_impact: analysisResult.bloodSugarImpact,
        });
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: "Meal Saved",
        description: "Your meal has been added to your daily log",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error Saving Meal",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error saving meal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Capture Your Meal</h1>
          <p className="text-gray-500">Take a photo to analyze nutrition content</p>
        </div>
        
        {!capturedImage ? (
          <FoodCapture onCapture={handleImageCapture} />
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="relative rounded-xl overflow-hidden shadow-subtle">
              <img 
                src={capturedImage} 
                alt="Captured meal" 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {isAnalyzing ? (
              <FoodAnalysis loading={true} result={{} as FoodAnalysisResult} />
            ) : analysisResult && (
              <>
                <FoodAnalysis result={analysisResult} />
                
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleSaveMeal}
                    className="py-3 px-8 bg-health-blue text-white rounded-full shadow-lg"
                  >
                    Save Meal to Log
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Header />
    </div>
  );
};

export default Capture;
