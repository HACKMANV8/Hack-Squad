import { EmotionType, EMOTION_COLORS } from './emotions';

interface EmotionScore {
  emotion: EmotionType;
  score: number;
  factors: string[];
}

interface EmotionAnalysisResult {
  emotion: EmotionType;
  color: string;
  intensity: number;
  description: string;
  confidence: number;
  allScores: EmotionScore[];
}

/**
 * Advanced emotion detection with multi-factor scoring system
 */
export function analyzeEmotionAdvanced(
  text: string,
  aiConfidence: number,
  sentimentScore: number
): EmotionAnalysisResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Initialize scores for all emotions
  const scores: Record<EmotionType, { score: number; factors: string[] }> = {
    joy: { score: 0, factors: [] },
    curiosity: { score: 0, factors: [] },
    calm: { score: 0, factors: [] },
    anger: { score: 0, factors: [] },
    confusion: { score: 0, factors: [] },
    confidence: { score: 0, factors: [] },
    surprise: { score: 0, factors: [] },
    sadness: { score: 0, factors: [] },
  };

  // ============ JOY DETECTION ============
  const joyWords = ['happy', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 
                    'love', 'perfect', 'beautiful', 'awesome', 'brilliant', 'incredible',
                    'delighted', 'thrilled', 'excited', 'joy', 'glad', 'pleased'];
  const joyEmojis = ['😊', '😄', '🎉', '❤️', '👍', '✨', '🌟'];
  const joyExclamations = lowerText.match(/!/g)?.length || 0;
  
  joyWords.forEach(word => {
    if (lowerText.includes(word)) {
      scores.joy.score += 15;
      scores.joy.factors.push(`keyword: ${word}`);
    }
  });
  
  joyEmojis.forEach(emoji => {
    if (text.includes(emoji)) {
      scores.joy.score += 10;
      scores.joy.factors.push(`emoji: ${emoji}`);
    }
  });
  
  if (sentimentScore > 0.3) {
    scores.joy.score += sentimentScore * 30;
    scores.joy.factors.push(`positive sentiment: ${sentimentScore.toFixed(2)}`);
  }
  
  if (joyExclamations >= 2) {
    scores.joy.score += joyExclamations * 5;
    scores.joy.factors.push(`excitement (${joyExclamations} !)`);
  }

  // ============ CURIOSITY DETECTION ============
  const curiosityWords = ['wonder', 'curious', 'fascinating', 'intriguing', 'interesting',
                          'explore', 'discover', 'learn', 'why', 'how', 'what if'];
  const curiosityPhrases = ['tell me more', 'i wonder', "i'm curious", 'what about',
                           'how does', 'why does', 'what makes', 'can you explain'];
  const questionMarks = (lowerText.match(/\?/g) || []).length;
  
  curiosityWords.forEach(word => {
    if (lowerText.includes(word)) {
      scores.curiosity.score += 12;
      scores.curiosity.factors.push(`keyword: ${word}`);
    }
  });
  
  curiosityPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      scores.curiosity.score += 20;
      scores.curiosity.factors.push(`phrase: "${phrase}"`);
    }
  });
  
  if (questionMarks >= 2) {
    scores.curiosity.score += questionMarks * 15;
    scores.curiosity.factors.push(`multiple questions (${questionMarks})`);
  } else if (questionMarks === 1) {
    scores.curiosity.score += 8;
    scores.curiosity.factors.push('single question');
  }

  // ============ CALM DETECTION ============
  const calmWords = ['peaceful', 'serene', 'tranquil', 'relaxed', 'composed', 'balanced',
                     'steady', 'neutral', 'okay', 'fine', 'alright', 'understand'];
  const calmPhrases = ['i see', 'makes sense', 'got it', 'understood', 'thank you'];
  
  calmWords.forEach(word => {
    if (lowerText.includes(word)) {
      scores.calm.score += 12;
      scores.calm.factors.push(`keyword: ${word}`);
    }
  });
  
  calmPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      scores.calm.score += 15;
      scores.calm.factors.push(`phrase: "${phrase}"`);
    }
  });
  
  // Neutral sentiment favors calm
  if (sentimentScore >= -0.2 && sentimentScore <= 0.2) {
    scores.calm.score += 20;
    scores.calm.factors.push('neutral sentiment');
  }
  
  // Moderate confidence favors calm
  if (aiConfidence >= 0.4 && aiConfidence <= 0.7) {
    scores.calm.score += 15;
    scores.calm.factors.push('moderate confidence');
  }

  // ============ ANGER/FRUSTRATION DETECTION ============
  const angerWords = ['angry', 'hate', 'terrible', 'awful', 'horrible', 'worst', 'bad',
                      'disgusting', 'annoying', 'frustrated', 'mad', 'furious', 'outraged'];
  const angerPhrases = ['fed up', 'can\'t stand', 'sick of', 'had enough'];
  const angerEmojis = ['😠', '😡', '🤬', '💢'];
  
  angerWords.forEach(word => {
    if (lowerText.includes(word)) {
      scores.anger.score += 18;
      scores.anger.factors.push(`keyword: ${word}`);
    }
  });
  
  angerPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      scores.anger.score += 25;
      scores.anger.factors.push(`phrase: "${phrase}"`);
    }
  });
  
  angerEmojis.forEach(emoji => {
    if (text.includes(emoji)) {
      scores.anger.score += 20;
      scores.anger.factors.push(`emoji: ${emoji}`);
    }
  });
  
  if (sentimentScore < -0.3) {
    scores.anger.score += Math.abs(sentimentScore) * 35;
    scores.anger.factors.push(`negative sentiment: ${sentimentScore.toFixed(2)}`);
  }

  // ============ CONFUSION DETECTION ============
  const confusionWords = ['confused', 'unclear', 'don\'t understand', 'puzzled', 'uncertain',
                          'unsure', 'maybe', 'perhaps', 'possibly', 'not sure', 'dunno'];
  const confusionPhrases = ['i don\'t know', 'what do you mean', 'i\'m not sure',
                           'can you clarify', 'doesn\'t make sense'];
  const confusionEmojis = ['🤔', '😕', '😵', '🤷'];
  
  confusionWords.forEach(word => {
    if (lowerText.includes(word)) {
      scores.confusion.score += 16;
      scores.confusion.factors.push(`keyword: ${word}`);
    }
  });
  
  confusionPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      scores.confusion.score += 25;
      scores.confusion.factors.push(`phrase: "${phrase}"`);
    }
  });
  
  confusionEmojis.forEach(emoji => {
    if (text.includes(emoji)) {
      scores.confusion.score += 15;
      scores.confusion.factors.push(`emoji: ${emoji}`);
    }
  });
  
  // Low AI confidence indicates confusion
  if (aiConfidence < 0.35) {
    scores.confusion.score += (0.35 - aiConfidence) * 60;
    scores.confusion.factors.push(`low confidence: ${aiConfidence.toFixed(2)}`);
  }

  // ============ CONFIDENCE DETECTION ============
  const confidenceWords = ['definitely', 'certainly', 'absolutely', 'surely', 'clearly',
                          'obviously', 'indeed', 'confident', 'sure', 'positive', 'know'];
  const confidencePhrases = ['without doubt', 'for sure', 'i\'m certain', 'i know',
                            'no question', 'absolutely right'];
  
  confidenceWords.forEach(word => {
    if (lowerText.includes(word)) {
      scores.confidence.score += 14;
      scores.confidence.factors.push(`keyword: ${word}`);
    }
  });
  
  confidencePhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      scores.confidence.score += 22;
      scores.confidence.factors.push(`phrase: "${phrase}"`);
    }
  });
  
  // High AI confidence
  if (aiConfidence > 0.8) {
    scores.confidence.score += (aiConfidence - 0.8) * 80;
    scores.confidence.factors.push(`high confidence: ${aiConfidence.toFixed(2)}`);
  }
  
  // Length indicates thoroughness/confidence
  if (words.length > 30) {
    scores.confidence.score += 10;
    scores.confidence.factors.push('detailed response');
  }

  // ============ BASELINE SCORES ============
  // Give calm a baseline to be the default
  scores.calm.score += 10;
  scores.calm.factors.push('baseline');

  // ============ SELECT WINNING EMOTION ============
  const emotionScores: EmotionScore[] = Object.entries(scores).map(([emotion, data]) => ({
    emotion: emotion as EmotionType,
    score: data.score,
    factors: data.factors,
  }));

  emotionScores.sort((a, b) => b.score - a.score);
  const winningEmotion = emotionScores[0];
  
  // Calculate intensity based on score difference
  const secondScore = emotionScores[1]?.score || 0;
  const scoreDifference = winningEmotion.score - secondScore;
  const intensity = Math.min(1, Math.max(0.3, winningEmotion.score / 100));

  return {
    emotion: winningEmotion.emotion,
    color: EMOTION_COLORS[winningEmotion.emotion],
    intensity,
    description: getEmotionDescription(winningEmotion.emotion),
    confidence: scoreDifference / winningEmotion.score,
    allScores: emotionScores,
  };
}

function getEmotionDescription(emotion: EmotionType): string {
  const descriptions: Record<EmotionType, string> = {
    joy: 'happy and enthusiastic',
    curiosity: 'curious and inquisitive',
    calm: 'peaceful and composed',
    anger: 'frustrated or upset',
    confusion: 'uncertain and puzzled',
    confidence: 'assured and certain',
    surprise: 'astonished or impressed',
    sadness: 'down or discouraged',
  };
  return descriptions[emotion];
}

// Export for testing
export function getEmotionScores(text: string, confidence: number, sentiment: number) {
  const result = analyzeEmotionAdvanced(text, confidence, sentiment);
  return result.allScores;
}
