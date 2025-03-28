
import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload } from 'lucide-react';

interface FoodCaptureProps {
  onCapture: (image: string) => void;
}

const FoodCapture: React.FC<FoodCaptureProps> = ({ onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setCameraError(err.message || "Could not access camera. Please check permissions.");
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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setCapturedImage(event.target.result);
          onCapture(event.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
        
        {!isCapturing && !capturedImage && (
          <div className="flex flex-col items-center justify-center h-full p-4">
            {cameraError ? (
              <>
                <p className="text-red-500 mb-2 text-center">{cameraError}</p>
                <p className="text-gray-400 text-center">You can still upload a photo</p>
              </>
            ) : (
              <p className="text-gray-400">Ready to capture or upload your meal</p>
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
      
      {/* Camera controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {!isCapturing && !capturedImage ? (
          <div className="flex space-x-4">
            <button
              onClick={startCamera}
              className="glass py-3 px-6 rounded-full flex items-center space-x-2 shadow-elevated"
            >
              <Camera className="w-5 h-5 text-health-blue" />
              <span className="font-medium">Take a photo</span>
            </button>
            
            <button
              onClick={triggerFileInput}
              className="glass py-3 px-6 rounded-full flex items-center space-x-2 shadow-elevated"
            >
              <Upload className="w-5 h-5 text-health-blue" />
              <span className="font-medium">Upload photo</span>
            </button>
          </div>
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
