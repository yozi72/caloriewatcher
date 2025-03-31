
import React from 'react';
import { FoodAnalysisResult } from './FoodAnalysis';
import FoodAnalysis from './FoodAnalysis';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { saveMeal } from '@/utils/mealStorage';

interface FoodAnalysisViewProps {
  capturedImage: string | null;
  analysisResult: FoodAnalysisResult | null;
  isAnalyzing: boolean;
}

const FoodAnalysisView = ({ capturedImage, analysisResult, isAnalyzing }: FoodAnalysisViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSaveMeal = async () => {
    const result = await saveMeal(user, analysisResult, capturedImage, toast);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-xl overflow-hidden shadow-subtle">
        <img 
          src={capturedImage ?? ''} 
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
  );
};

export default FoodAnalysisView;
