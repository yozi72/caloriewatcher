
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
  
  // Generate a simple hash from a string
  const simpleHash = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < 100; i++) { // Only use a portion of the string for performance
      const char = str.charCodeAt(i % str.length);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // This simulates the AI food analysis but with varying results based on the image
  const analyzeFoodImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a hash from the image data to create consistent but different results
    const hash = simpleHash(imageData);
    
    // Use the hash to create variations in the results
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
    
    // Create variations in nutritional values
    const baseCalories = 300 + (hash % 400);
    const baseProtein = 20 + (hash % 30);
    const baseCarbs = 15 + (hash % 40);
    const baseFat = 10 + (hash % 25);
    const baseHealthScore = 65 + (hash % 31); // 65-95 range
    
    // Generate varying blood sugar impact
    const generateBloodSugar = () => {
      const startLevel = 80 + (hash % 10);
      const peakOffset = 20 + (hash % 40);
      
      return [
        { time: '0 min', level: startLevel },
        { time: '30 min', level: startLevel + peakOffset / 2 },
        { time: '60 min', level: startLevel + peakOffset },
        { time: '90 min', level: startLevel + (peakOffset / 2) },
      ];
    };
    
    // Generate food-specific explanation
    const explanations = [
      "Rich in omega-3 fatty acids and protein. The vegetables provide essential fiber and vitamins.",
      "A good source of lean protein. Watch the dressing as it may contain hidden sugars.",
      "High in fiber and antioxidants from the variety of vegetables.",
      "High-quality protein but be mindful of the saturated fat content.",
      "Plant-based protein with healthy fats from the avocado.",
      "Complex carbohydrates that provide steady energy. Consider whole grain pasta for better nutrition.",
      "Excellent source of probiotics and calcium. The berries add antioxidants and natural sweetness."
    ];
    
    const mockResult: FoodAnalysisResult = {
      foodName: foodTypes[foodIndex],
      calories: baseCalories,
      protein: baseProtein,
      carbs: baseCarbs,
      fat: baseFat,
      healthScore: baseHealthScore,
      bloodSugarImpact: generateBloodSugar(),
      explanation: explanations[foodIndex],
      advice: "Consider portion control and pairing with a balanced mix of other food groups."
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: "Your meal has been analyzed successfully",
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
