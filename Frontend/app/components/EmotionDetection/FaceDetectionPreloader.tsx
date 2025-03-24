'use client';

import { useEffect, useState } from 'react';
import { loadFaceDetectionModels } from './faceApiUtils';

const FaceDetectionPreloader: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFaceDetectionModels()
        .then(() => {
          console.log('Face detection models preloaded successfully');
          setIsLoaded(true);
        })
        .catch(err => {
          console.error('Error preloading face detection models:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
};

export default FaceDetectionPreloader;