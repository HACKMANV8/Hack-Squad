import Sentiment from 'sentiment';

export type EmotionType = 'joy' | 'curiosity' | 'calm' | 'anger' | 'confusion' | 'confidence' | 'surprise' | 'sadness';

export interface EmotionData {
  emotion: EmotionType;
  color: string;
  intensity: number;
  description: string;
}

export const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: '#FBBF24',
  curiosity: '#06B6D4',
  calm: '#3B82F6',
  anger: '#EF4444',
  confusion: '#A855F7',
  confidence: '#10B981',
  surprise: '#8B5CF6',
  sadness: '#3B82F6',
};

// Initialize sentiment analyzer
const sentiment = new Sentiment();

interface EmotionScores {
  [key: string]: number;
}

export const analyzeEmotion = (
  text: string,
  confidence: number,
  sentimentScore: number
): EmotionData => {
  const lowerText = text.toLowerCase().trim();
  
  // Enhanced sentiment analysis (not used directly here; provided via sentimentScore)
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  // Initialize emotion scores
  const emotionScores: EmotionScores = {
    joy: 0,
    curiosity: 0,
    calm: 0,
    anger: 0,
    confusion: 0,
    confidence: 0,
    surprise: 0,
    sadness: 0
  };

  // Calculate base emotion scores based on sentiment and confidence
  if (sentimentScore > 0.4) {
    emotionScores.joy = Math.min(1, sentimentScore * 1.5);
  } else if (sentimentScore < -0.3) {
    emotionScores.anger = Math.min(1, Math.abs(sentimentScore) * 1.2);
    emotionScores.sadness = Math.min(1, Math.abs(sentimentScore) * 0.8);
  }

  // Adjust confidence score based on text characteristics
  emotionScores.confidence = Math.min(1, confidence * 0.8 + (wordCount > 10 ? 0.1 : 0));
  
  // Detect questions and curiosity
  const questionCount = (lowerText.match(/\?/g) || []).length;
  const hasQuestionMark = questionCount > 0;
  const isQuestion = hasQuestionMark || lowerText.startsWith('what') || 
                    lowerText.startsWith('why') || lowerText.startsWith('how') ||
                    lowerText.startsWith('when') || lowerText.startsWith('where');
  
  // Curiosity detection with more nuanced conditions
  const curiosityPhrases = [
    'i wonder', 'curious', 'fascinating', 'intriguing', 'let me explore',
    'i\'m interested', 'tell me more', 'how interesting', 'what if',
    'i\'d like to know', 'can you explain', 'could you tell me', 'i was wondering'
  ];
  
  const hasCuriosityPhrase = curiosityPhrases.some(phrase => lowerText.includes(phrase));
  
  if (isQuestion || hasCuriosityPhrase) {
    emotionScores.curiosity = 0.6 + (hasCuriosityPhrase ? 0.2 : 0);
    if (questionCount >= 2) {
      emotionScores.curiosity = Math.min(1, emotionScores.curiosity + 0.2);
    }
  }
  
  // Detect surprise
  const surpriseWords = ['wow', 'amazing', 'incredible', 'unbelievable', 'surprise', 'surprised'];
  const hasSurpriseWord = surpriseWords.some(word => lowerText.includes(word));
  const hasExclamation = (lowerText.match(/!/g) || []).length > 0;
  
  if (hasSurpriseWord || hasExclamation) {
    emotionScores.surprise = 0.7;
  }
  
  // Detect sadness
  const sadnessWords = ['sad', 'unhappy', 'disappointed', 'sorry', 'regret', 'miss'];
  const hasSadnessWord = sadnessWords.some(word => lowerText.includes(word));
  
  if (hasSadnessWord) {
    emotionScores.sadness = Math.max(emotionScores.sadness, 0.7);
  }
  
  // Adjust for confidence level
  if (confidence < 0.3) {
    emotionScores.confusion = Math.max(0.7, 1 - confidence);
  } else if (confidence > 0.8) {
    emotionScores.confidence = Math.max(emotionScores.confidence, 0.7);
  }
  
  // Default calm score if no strong emotions detected
  if (Object.values(emotionScores).every(score => score < 0.5)) {
    emotionScores.calm = 0.6;
  }
  
  // Find the dominant emotion
  let dominantEmotion: EmotionType = 'calm';
  let maxScore = 0;
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion as EmotionType;
    }
  }
  
  // Get emotion description
  const emotionDescriptions: Record<EmotionType, string> = {
    joy: maxScore > 0.8 ? 'extremely happy and enthusiastic' : 'happy and cheerful',
    curiosity: maxScore > 0.8 ? 'deeply curious and inquisitive' : 'interested and curious',
    calm: maxScore > 0.8 ? 'completely at peace' : 'calm and composed',
    anger: maxScore > 0.8 ? 'very frustrated or upset' : 'slightly annoyed',
    confusion: maxScore > 0.8 ? 'very confused and uncertain' : 'slightly puzzled',
    confidence: maxScore > 0.8 ? 'very confident and certain' : 'assured',
    surprise: maxScore > 0.8 ? 'very surprised' : 'slightly surprised',
    sadness: maxScore > 0.8 ? 'very sad' : 'slightly down'
  };
  
  return {
    emotion: dominantEmotion,
    color: EMOTION_COLORS[dominantEmotion],
    intensity: maxScore,
    description: emotionDescriptions[dominantEmotion],
  };
};

// Enhanced sentiment analysis using the sentiment package
export const calculateSentiment = (text: string): number => {
  if (!text || typeof text !== 'string') return 0;
  
  try {
    const result = sentiment.analyze(text);
    // Normalize score to [-1, 1] range
    const normalizedScore = Math.max(-1, Math.min(1, result.score / 5));
    return normalizedScore;
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return 0; // Return neutral on error
  }
};

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex = (c: string) => parseInt(c.slice(1), 16);
  const r1 = (hex(color1) >> 16) & 255;
  const g1 = (hex(color1) >> 8) & 255;
  const b1 = hex(color1) & 255;

  const r2 = (hex(color2) >> 16) & 255;
  const g2 = (hex(color2) >> 8) & 255;
  const b2 = hex(color2) & 255;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
