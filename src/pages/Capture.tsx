
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
  
  // TODO: In a real app, this would call an AI service
  const analyzeFoodImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock result - in a real app this would come from OpenAI or Gemini API
    const mockResult: FoodAnalysisResult = {
      foodName: 'Grilled Salmon with Vegetables',
      calories: 420,
      protein: 35,
      carbs: 18,
      fat: 22,
      healthScore: 8.5,
      bloodSugarImpact: [
        { time: '0 min', level: 85 },
        { time: '30 min', level: 110 },
        { time: '60 min', level: 125 },
        { time: '90 min', level: 105 },
      ]
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
          health_score: Math.round(analysisResult.healthScore * 10), // Convert to 50-100 scale
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
