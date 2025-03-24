import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceDetectionModels = async (
  progressCallback?: (stage: string, progress: number) => void
): Promise<boolean> => {
  if (modelsLoaded) {
    console.log('Face detection models already loaded');
    return true;
  }
  
  try {
    if (progressCallback) progressCallback('Loading face detection models...', 10);
    
    const MODEL_URL = '/models';
    
    if (progressCallback) progressCallback('Loading TinyFaceDetector...', 30);
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    if (progressCallback) progressCallback('Loading FaceExpressionNet...', 60);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    
    if (progressCallback) progressCallback('Models loaded successfully!', 100);
    
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    modelsLoaded = false;
    throw error;
  }
};

export const createDetectorOptions = (inputSize = 320, scoreThreshold = 0.3) => {
  return new faceapi.TinyFaceDetectorOptions({ 
    inputSize,
    scoreThreshold
  });
};

export const detectFace = async (
  video: HTMLVideoElement,
  options?: faceapi.TinyFaceDetectorOptions
): Promise<faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>> | null> => {
  if (!video || video.readyState !== 4) {
    return null;
  }
  
  try {
    const detectorOptions = options || createDetectorOptions();
    return await faceapi.detectSingleFace(video, detectorOptions)
      .withFaceLandmarks()
      .withFaceExpressions();
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
};

export const getDominantEmotion = (
  expressions: faceapi.FaceExpressions
): { emotion: string; probability: number } => {
  let highestScore = 0;
  let dominantEmotion = 'neutral';
  
  Object.entries(expressions).forEach(([emotion, score]) => {
    if (score > highestScore) {
      highestScore = score;
      dominantEmotion = emotion;
    }
  });
  
  return { emotion: dominantEmotion, probability: highestScore };
};

export const isNegativeEmotion = (emotion: string): boolean => {
  const negativeEmotions = ['angry', 'sad', 'fearful', 'disgusted'];
  return negativeEmotions.includes(emotion.toLowerCase());
};

export const drawFaceDetectionResults = (
  canvas: HTMLCanvasElement,
  detections: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>,
  displaySize: { width: number; height: number }
): void => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  faceapi.matchDimensions(canvas, displaySize);
  
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
  ctx.clearRect(0, 0, displaySize.width, displaySize.height);
  
  faceapi.draw.drawDetections(canvas, resizedDetections);
  
  const { emotion, probability } = getDominantEmotion(resizedDetections.expressions);
  
  const { x, y } = resizedDetections.detection.box;
  ctx.font = '16px Arial';
  ctx.fillStyle = isNegativeEmotion(emotion) ? 'red' : 'green';
  ctx.fillText(
    `${emotion} (${Math.round(probability * 100)}%)`,
    x, 
    y - 10
  );
}; 