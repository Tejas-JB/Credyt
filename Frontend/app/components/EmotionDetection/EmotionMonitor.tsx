'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionDetector from './EmotionDetector';
import { isNegativeEmotion } from './faceApiUtils';
import toast from 'react-hot-toast';

interface EmotionHistory {
  emotion: string;
  probability: number;
  timestamp: number;
}

interface EmotionMonitorProps {
  isTransactionFormOpen?: boolean;
}

const NEGATIVE_EMOTIONS = ['sad', 'angry', 'disgusted', 'fearful'];

const EMOTION_THRESHOLD = 0.7;

const EmotionMonitor: React.FC<EmotionMonitorProps> = ({ isTransactionFormOpen }) => {
  const [isActive, setIsActive] = useState(true);
  const [showEmotionDetector, setShowEmotionDetector] = useState(false);
  
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<string>('Initializing...');
  
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory[]>([]);
  const maxHistoryLength = 30;
  
  const [detectionCount, setDetectionCount] = useState(0);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getCurrentEmotionalState = () => ({ 
        emotion: 'neutral', 
        probability: 0, 
        negative: false,
        timestamp: Date.now(),
        faceDetected: false
      });
      
      (window as any).isEmotionallyFitForTransaction = () => true;
    }
  }, []);

  useEffect(() => {
    if (isTransactionFormOpen) {
      setIsActive(true);
    }
  }, [isTransactionFormOpen]);

  const toggleEmotionDetector = () => {
    setShowEmotionDetector(!showEmotionDetector);
    
    if (!showEmotionDetector && !isActive) {
      setIsActive(true);
    }
  };

  const handleEmotionDetected = (emotion: string, probability: number, faceDetected: boolean) => {
    setCurrentEmotion(emotion);
    setEmotionConfidence(probability);
    setIsFaceDetected(faceDetected);
    setDetectionCount(prevCount => prevCount + 1);
    
    if (faceDetected) {
      setNoFaceCount(0);
      setFaceDetectionStatus('Face detected');
      setLastDetectionTime(Date.now());
      
      setEmotionHistory(prev => {
        const newHistory = [...prev, { 
          emotion, 
          probability, 
          timestamp: Date.now() 
        }];
        
        if (newHistory.length > maxHistoryLength) {
          return newHistory.slice(newHistory.length - maxHistoryLength);
        }
        return newHistory;
      });
      
      updateGlobalEmotionalState(emotion, probability);
    } else {
      setNoFaceCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount === 5) {
          setFaceDetectionStatus('No face detected');
          try {
            toast.error('No face detected. Please ensure your face is visible to the camera.', {
              duration: 4000,
              id: 'no-face-error'
            });
          } catch (err) {
            console.error('Toast error:', err);
          }
        }
        
        if (newCount > 10) {
          updateGlobalEmotionalState('unknown', 0);
        }
        
        return newCount;
      });
    }
  };

  const getEmotionClasses = () => {
    if (!isFaceDetected) {
      return 'bg-gray-200 text-gray-700';
    }
    
    if (isNegativeEmotion(currentEmotion) && emotionConfidence > 0.5) {
      return 'bg-red-600 text-white animate-pulse';
    }
    
    switch (currentEmotion) {
      case 'happy':
        return 'bg-green-500 text-white';
      case 'surprised':
        return 'bg-purple-500 text-white';
      case 'neutral':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const updateGlobalEmotionalState = (emotion: string, probability: number) => {
    if (typeof window !== 'undefined') {
      (window as any).getCurrentEmotionalState = () => ({
        emotion, 
        probability,
        negative: isNegativeEmotion(emotion) && probability > 0.5,
        timestamp: Date.now(),
        faceDetected: emotion !== 'unknown'
      });
      
      (window as any).isEmotionallyFitForTransaction = () => {
        return !isNegativeEmotion(emotion) || probability <= 0.5;
      };
    }
  };

  const getDetectionTimingInfo = () => {
    if (lastDetectionTime === 0) return "No detection yet";
    const timeSinceLast = Date.now() - lastDetectionTime;
    return `${timeSinceLast}ms ago`;
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Emotion Security Monitor</h3>
        <div className="flex space-x-2">
          <button 
            onClick={toggleEmotionDetector}
            className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            {showEmotionDetector ? 'Hide Camera' : 'Show Camera'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Current Emotion</div>
            <div className={`py-1 px-3 rounded-full text-center text-sm ${getEmotionClasses()}`}>
              {isFaceDetected ? currentEmotion : 'No face detected'}
            </div>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Confidence</div>
            <div className="text-lg font-semibold">
              {isFaceDetected ? `${Math.round(emotionConfidence * 100)}%` : '-'}
            </div>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className="text-sm font-medium">
              {isFaceDetected ? 
                (isNegativeEmotion(currentEmotion) && emotionConfidence > 0.5 ? 
                  <span className="text-red-600">Blocked</span> : 
                  <span className="text-green-600">Approved</span>
                ) : 
                <span className="text-yellow-600">Face required</span>
              }
            </div>
          </div>
        </div>
        
        {showEmotionDetector && (
          <div className="mb-4">
            <EmotionDetector 
              onEmotionDetected={handleEmotionDetected} 
              isActive={isActive}
            />
          </div>
        )}

        {emotionHistory.length > 0 && (
          <div className="my-4">
            <h4 className="text-sm font-medium mb-2">Emotion Timeline</h4>
            <div className="flex h-8 rounded-md overflow-hidden">
              {emotionHistory.map((entry, index) => {
                let bgColor = 'bg-blue-500';
                if (entry.emotion === 'happy') bgColor = 'bg-green-500';
                if (entry.emotion === 'angry') bgColor = 'bg-red-600';
                if (entry.emotion === 'sad') bgColor = 'bg-red-400';
                if (entry.emotion === 'fearful') bgColor = 'bg-orange-500';
                if (entry.emotion === 'disgusted') bgColor = 'bg-red-800';
                if (entry.emotion === 'surprised') bgColor = 'bg-purple-500';
                
                return (
                  <div 
                    key={index} 
                    className={`${bgColor} flex-1`} 
                    title={`${entry.emotion} (${Math.round(entry.probability * 100)}%)`}
                    style={{ opacity: Math.max(0.3, entry.probability) }}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-medium mb-1">Transaction Security</h4>
          {!isFaceDetected ? (
            <p className="text-sm text-yellow-600">
              Face detection is required to authorize transactions. Please allow camera access and ensure your face is visible.
            </p>
          ) : isNegativeEmotion(currentEmotion) && emotionConfidence > 0.5 ? (
            <p className="text-sm text-red-600">
              Your current emotional state indicates you may not be in the right mindset for financial decisions. Transactions are temporarily blocked.
            </p>
          ) : (
            <p className="text-sm text-green-600">
              Your emotional state indicates you are in a suitable mindset for making financial decisions.
            </p>
          )}
        </div>
        
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-500">
            <h4 className="font-medium mb-1">Debug Info</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>Face Detection Active: {isActive ? 'Yes' : 'No'}</div>
              <div>Detection Count: {detectionCount}</div>
              <div>Face Missing Count: {noFaceCount}</div>
              <div>Last Detection: {getDetectionTimingInfo()}</div>
            </div>
          </div>
        )}
      </div>

      {!showEmotionDetector && isActive && (
        <EmotionDetector 
          onEmotionDetected={handleEmotionDetected} 
          isActive={isActive}
          hideUI={true}
        />
      )}
    </div>
  );
};

export default EmotionMonitor;