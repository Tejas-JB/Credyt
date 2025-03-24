'use client';

import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const NEGATIVE_EMOTIONS = ['angry', 'sad', 'fearful', 'disgusted'];

interface EmotionDetectorProps {
  onEmotionDetected: (emotion: string, probability: number, faceDetected: boolean) => void;
  isActive: boolean;
  hideUI?: boolean;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({ 
  onEmotionDetected, 
  isActive,
  hideUI = false 
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [detectionStarted, setDetectionStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...");
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        if (isMounted) {
          setLoadingStatus("Loading face detection models...");
          setModelLoadProgress(10);
        }

        const MODEL_URL = '/models';
        
        if (isMounted) {
          setLoadingStatus("Loading TinyFaceDetector...");
          setModelLoadProgress(30);
        }
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        if (isMounted) {
          setLoadingStatus("Loading FaceExpressionNet...");
          setModelLoadProgress(60);
        }
        
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        
        if (isMounted) {
          setLoadingStatus("Models loaded successfully!");
          setModelLoadProgress(100);
          console.log("Face models loaded successfully");
          setIsModelLoaded(true);
          
          setTimeout(() => {
            if (isMounted) {
              setDetectionStarted(true);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error loading face detection models:', error);
        if (isMounted) {
          setModelLoadError(`Failed to load face detection models: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page.`);
        }
      }
    };

    loadModels();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isActive || !isModelLoaded || !detectionStarted) {
      return;
    }

    let noFaceDetectedCount = 0;
    const MAX_NO_FACE_COUNT = 3;
    
    const runDetection = async () => {
      if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
        return;
      }
      
      const video = webcamRef.current.video;
      
      try {
        const options = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320,  
          scoreThreshold: 0.2
        });
        
        const detections = await faceapi.detectSingleFace(video, options)
          .withFaceExpressions();
        
        setDetectionCount(prev => prev + 1);

        if (!detections) {
          noFaceDetectedCount++;
          console.log(`No face detected (${noFaceDetectedCount}/${MAX_NO_FACE_COUNT})`);
          
          if (noFaceDetectedCount >= MAX_NO_FACE_COUNT) {
            onEmotionDetected('neutral', 0, false);
          }
          return;
        }

        noFaceDetectedCount = 0;
        
        const expressions = detections.expressions;
        let highestExpression = { emotion: 'neutral', probability: 0 };
        
        Object.entries(expressions).forEach(([emotion, probability]) => {
          if (probability > highestExpression.probability) {
            highestExpression = { emotion, probability };
          }
        });
        
        console.log(`Face detected: ${highestExpression.emotion} (${Math.round(highestExpression.probability * 100)}%)`);
        onEmotionDetected(highestExpression.emotion, highestExpression.probability, true);
        
        if (canvasRef.current && !hideUI) {
          const displaySize = {
            width: video.width,
            height: video.height
          };
          
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            faceapi.matchDimensions(canvasRef.current, displaySize);
            
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);
            
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            
            const { x, y } = resizedDetections.detection.box;
            ctx.font = '16px Arial';
            ctx.fillStyle = NEGATIVE_EMOTIONS.includes(highestExpression.emotion) ? 'red' : 'green';
            ctx.fillText(
              `${highestExpression.emotion} (${Math.round(highestExpression.probability * 100)}%)`,
              x, 
              y - 10
            );
          }
        }
      } catch (error) {
        console.error('Error during face detection:', error);
      }
    };
    
    detectionIntervalRef.current = setInterval(runDetection, 200);
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isModelLoaded, isActive, onEmotionDetected, hideUI, detectionStarted]);

  const handleWebcamError = (error: string | DOMException) => {
    console.error('Webcam error:', error);
    setPermissionDenied(true);
    
    onEmotionDetected('neutral', 0, false);
  };

  if (permissionDenied) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <p className="font-semibold">Camera Access Denied</p>
        <p className="text-sm">Please allow camera access to enable emotion detection. Without camera access, transactions will be blocked for security reasons.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry Camera Access
        </button>
      </div>
    );
  }

  if (modelLoadError) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <p className="font-semibold">Error Loading Face Detection</p>
        <p className="text-sm">{modelLoadError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!isModelLoaded) {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <span className="mb-2">{loadingStatus}</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${modelLoadProgress}%` }}></div>
        </div>
        <p className="text-xs text-gray-500">If loading takes too long, try refreshing the page</p>
      </div>
    );
  }

  if (hideUI) {
    return (
      <div className="opacity-0 absolute top-0 left-0 pointer-events-none" style={{ height: "1px", width: "1px", overflow: "hidden" }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          className="w-full rounded-lg"
          videoConstraints={{
            width: 320, 
            height: 240,
            facingMode: "user"
          }}
          onUserMediaError={handleWebcamError}
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        className="w-full rounded-lg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
        onUserMediaError={handleWebcamError}
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        Detection count: {detectionCount}
      </div>
    </div>
  );
};

export default EmotionDetector;