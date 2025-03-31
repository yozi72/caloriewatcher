
import React, { useState } from 'react';
import Header from '@/components/Header';
import FoodCapture from '@/components/FoodCapture';
import { FoodAnalysisResult } from '@/components/FoodAnalysis';
import { useToast } from '@/hooks/use-toast';
import { analyzeFoodImage } from '@/utils/foodAnalysis';
import FoodAnalysisView from '@/components/FoodAnalysisView';

const Capture = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    analyzeFoodImage(imageData, setIsAnalyzing, setAnalysisResult, toast);
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
          <FoodAnalysisView 
            capturedImage={capturedImage}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>
      <Header />
    </div>
  );
};

export default Capture;
