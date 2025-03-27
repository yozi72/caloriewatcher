
import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

interface FoodCaptureProps {
  onCapture: (image: string) => void;
}

const FoodCapture: React.FC<FoodCaptureProps> = ({ onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        onCapture(imageData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-elevated">
      {/* Overlay instruction */}
      {isCapturing && !capturedImage && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="glass py-2 px-4 rounded-full animate-pulse-subtle">
            <p className="text-sm font-medium">Center your meal in the frame</p>
          </div>
        </div>
      )}
      
      {/* Camera view / Captured image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-xl">
        {isCapturing && (
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
          />
        )}
        
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured meal" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Camera controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {!isCapturing && !capturedImage ? (
          <button
            onClick={startCamera}
            className="glass py-3 px-6 rounded-full flex items-center space-x-2 shadow-elevated"
          >
            <Camera className="w-5 h-5 text-health-blue" />
            <span className="font-medium">Take a photo</span>
          </button>
        ) : isCapturing && !capturedImage ? (
          <button
            onClick={captureImage}
            className="glass w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-elevated"
          >
            <div className="w-12 h-12 bg-health-blue rounded-full"></div>
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={retakePhoto}
              className="glass py-3 px-6 rounded-full"
            >
              Retake
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCapture;
