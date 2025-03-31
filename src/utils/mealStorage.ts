
import { FoodAnalysisResult } from '@/components/FoodAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export const saveMeal = async (
  user: User | null,
  analysisResult: FoodAnalysisResult | null,
  capturedImage: string | null,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (!user || !analysisResult || !capturedImage) {
    toast({
      title: "Error",
      description: "Missing data for saving meal",
      variant: "destructive",
    });
    return { success: false };
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
        health_score: analysisResult.healthScore,
        blood_sugar_impact: analysisResult.bloodSugarImpact,
      });
    
    if (insertError) {
      throw insertError;
    }
    
    toast({
      title: "Meal Saved",
      description: "Your meal has been added to your daily log",
    });
    
    return { success: true };
  } catch (error: any) {
    toast({
      title: "Error Saving Meal",
      description: error.message,
      variant: "destructive",
    });
    console.error("Error saving meal:", error);
    return { success: false, error };
  }
};
