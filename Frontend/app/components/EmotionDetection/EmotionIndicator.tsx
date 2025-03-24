'use client';

import React, { useState, useEffect } from 'react';

// Map emotions to emojis
const EMOTION_EMOJIS = {
  angry: '😠',
  disgusted: '🤢',
  fearful: '😨',
  happy: '😃',
  neutral: '😐',
  sad: '😢',
  surprised: '😲',
  unknown: '❓'
};

// Negative emotions that should restrict transactions
const NEGATIVE_EMOTIONS = ['sad', 'angry', 'disgusted', 'fearful'];

const EmotionIndicator: React.FC = () => {
  const [currentEmotion, setCurrentEmotion] = useState<string>('unknown');
  const [emotionProbability, setEmotionProbability] = useState<number>(0);
  
  useEffect(() => {
    // Function to update the indicator based on the global emotion state
    const updateEmotionIndicator = () => {
      if (typeof window !== 'undefined' && (window as any).currentEmotion) {
        const { emotion, probability } = (window as any).currentEmotion;
        setCurrentEmotion(emotion);
        setEmotionProbability(probability);
      }
    };
    
    // Initial update
    updateEmotionIndicator();
    
    // Set up interval to check for updates
    const intervalId = setInterval(updateEmotionIndicator, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Get the emoji for the current emotion
  const emoji = EMOTION_EMOJIS[currentEmotion as keyof typeof EMOTION_EMOJIS] || EMOTION_EMOJIS.unknown;
  
  // Determine color based on emotion type
  const isNegative = NEGATIVE_EMOTIONS.includes(currentEmotion);
  const emotionColor = isNegative ? 'text-red-500' : 'text-green-500';
  
  return (
    <div 
      className="flex items-center px-3 py-1 bg-card/50 rounded-full transition-all duration-300"
      title={`Current emotion: ${currentEmotion} (${Math.round(emotionProbability * 100)}% confidence)`}
    >
      <span className="text-lg mr-1">{emoji}</span>
      <span className={`text-sm ${emotionColor} font-medium capitalize`}>
        {currentEmotion}
      </span>
    </div>
  );
};

export default EmotionIndicator; 