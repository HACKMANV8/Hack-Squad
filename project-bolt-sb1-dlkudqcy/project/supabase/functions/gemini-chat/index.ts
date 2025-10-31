import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  sessionId?: string;
}

interface ChatResponse {
  content: string;
  confidence: number;
  sentiment: number;
  responseTime: number;
  emotion: string;
  colorCode: string;
}

function calculateConfidence(text: string): number {
  const uncertainPhrases = ['maybe', 'perhaps', 'might', 'possibly', 'i think', 'not sure', 'unclear'];
  const confidentPhrases = ['definitely', 'certainly', 'absolutely', 'clearly', 'obviously', 'without doubt'];

  const lowerText = text.toLowerCase();
  let confidence = 0.6;

  uncertainPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) confidence -= 0.1;
  });

  confidentPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) confidence += 0.15;
  });

  if (text.length > 200) confidence += 0.1;
  if (text.includes('!')) confidence += 0.05;

  return Math.max(0, Math.min(1, confidence));
}

function calculateSentiment(text: string): number {
  const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'happy', 'love', 'amazing', 'fantastic', 'perfect', 'beautiful', 'best'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'worst', 'horrible', 'disappointing', 'unfortunate'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) score += 0.15;
    if (negativeWords.some(nw => word.includes(nw))) score -= 0.15;
  });

  return Math.max(-1, Math.min(1, score));
}

function analyzeEmotionAdvanced(text: string, aiConfidence: number, sentimentScore: number): { emotion: string; color: string } {
  const lowerText = text.toLowerCase();
  
  // Initialize scores for all emotions
  const scores: Record<string, number> = {
    joy: 0,
    curiosity: 0,
    calm: 10, // baseline
    anger: 0,
    confusion: 0,
    confidence: 0,
  };

  // ============ JOY DETECTION ============
  const joyWords = ['happy', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 
                    'love', 'perfect', 'beautiful', 'awesome', 'brilliant', 'incredible',
                    'delighted', 'thrilled', 'excited'];
  joyWords.forEach(word => {
    if (lowerText.includes(word)) scores.joy += 15;
  });
  
  const joyExclamations = (lowerText.match(/!/g) || []).length;
  if (joyExclamations >= 2) scores.joy += joyExclamations * 5;
  if (sentimentScore > 0.3) scores.joy += sentimentScore * 30;

  // ============ CURIOSITY DETECTION ============
  const curiosityWords = ['wonder', 'curious', 'fascinating', 'intriguing', 'interesting'];
  const curiosityPhrases = ['tell me more', 'i wonder', "i'm curious", 'what about',
                           'how does', 'why does', 'what makes', 'can you explain'];
  
  curiosityWords.forEach(word => {
    if (lowerText.includes(word)) scores.curiosity += 12;
  });
  
  curiosityPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) scores.curiosity += 20;
  });
  
  const questionMarks = (lowerText.match(/\?/g) || []).length;
  if (questionMarks >= 2) {
    scores.curiosity += questionMarks * 15;
  } else if (questionMarks === 1) {
    scores.curiosity += 8;
  }

  // ============ CALM DETECTION ============
  const calmWords = ['peaceful', 'serene', 'tranquil', 'okay', 'fine', 'understand'];
  const calmPhrases = ['i see', 'makes sense', 'got it', 'understood'];
  
  calmWords.forEach(word => {
    if (lowerText.includes(word)) scores.calm += 12;
  });
  
  calmPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) scores.calm += 15;
  });
  
  if (sentimentScore >= -0.2 && sentimentScore <= 0.2) scores.calm += 20;
  if (aiConfidence >= 0.4 && aiConfidence <= 0.7) scores.calm += 15;

  // ============ ANGER DETECTION ============
  const angerWords = ['angry', 'hate', 'terrible', 'awful', 'horrible', 'worst', 'bad',
                      'disgusting', 'annoying', 'frustrated'];
  const angerPhrases = ['fed up', 'can\'t stand', 'sick of'];
  
  angerWords.forEach(word => {
    if (lowerText.includes(word)) scores.anger += 18;
  });
  
  angerPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) scores.anger += 25;
  });
  
  if (sentimentScore < -0.3) scores.anger += Math.abs(sentimentScore) * 35;

  // ============ CONFUSION DETECTION ============
  const confusionWords = ['confused', 'unclear', 'don\'t understand', 'puzzled', 'uncertain',
                          'unsure', 'maybe', 'perhaps', 'not sure'];
  const confusionPhrases = ['i don\'t know', 'what do you mean', 'i\'m not sure'];
  
  confusionWords.forEach(word => {
    if (lowerText.includes(word)) scores.confusion += 16;
  });
  
  confusionPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) scores.confusion += 25;
  });
  
  if (aiConfidence < 0.35) {
    scores.confusion += (0.35 - aiConfidence) * 60;
  }

  // ============ CONFIDENCE DETECTION ============
  const confidenceWords = ['definitely', 'certainly', 'absolutely', 'surely', 'clearly',
                          'obviously', 'confident', 'sure', 'positive'];
  const confidencePhrases = ['without doubt', 'for sure', 'i\'m certain', 'no question'];
  
  confidenceWords.forEach(word => {
    if (lowerText.includes(word)) scores.confidence += 14;
  });
  
  confidencePhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) scores.confidence += 22;
  });
  
  if (aiConfidence > 0.8) {
    scores.confidence += (aiConfidence - 0.8) * 80;
  }

  // ============ SELECT WINNING EMOTION ============
  let maxScore = -1;
  let winningEmotion = 'calm';
  
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winningEmotion = emotion;
    }
  }

  const emotionColors: Record<string, string> = {
    joy: '#FBBF24',
    curiosity: '#06B6D4',
    calm: '#3B82F6',
    anger: '#EF4444',
    confusion: '#A855F7',
    confidence: '#10B981',
  };

  return { 
    emotion: winningEmotion, 
    color: emotionColors[winningEmotion] || '#3B82F6'
  };
}

async function callGeminiAPI(message: string, history: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');

  if (!apiKey) {
    return "I'm experiencing technical difficulties accessing my AI core. Please configure the Gemini API key to enable my full capabilities. In the meantime, I can still respond with simulated responses to demonstrate the emotion visualization system.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...history.map(msg => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            })),
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackResponse(message);
  }
}

async function analyzeEmotionWithGemini(text: string, userMessage: string): Promise<{ emotion: string; confidence: number; sentiment: number }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');

  if (!apiKey) {
    // Fallback to basic analysis if no API key
    const confidence = calculateConfidence(text);
    const sentiment = calculateSentiment(text);
    const { emotion } = analyzeEmotionAdvanced(text, confidence, sentiment);
    return { emotion, confidence, sentiment };
  }

  try {
    const emotionPrompt = `Analyze the emotional tone of this AI response in the context of the conversation.

User said: "${userMessage}"
AI responded: "${text}"

Analyze the AI's response and provide:
1. The primary emotion (choose ONE from: joy, curiosity, calm, anger, confusion, confidence, surprise, sadness)
2. Confidence level (0.0 to 1.0) - how certain/assured the response sounds
3. Sentiment score (-1.0 to 1.0) - overall positive/negative tone

Consider:
- The context of what the user asked
- The tone and word choice in the response
- Whether the AI is asking questions (curiosity)
- Whether the AI is expressing certainty or uncertainty
- The emotional undertone beyond just keywords

Respond ONLY in this exact JSON format:
{
  "emotion": "<emotion_name>",
  "confidence": <number>,
  "sentiment": <number>,
  "reasoning": "<brief explanation>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: emotionPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Emotion analysis API returned ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from emotion analysis');
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse emotion analysis response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate the emotion is one of our supported types
    const validEmotions = ['joy', 'curiosity', 'calm', 'anger', 'confusion', 'confidence', 'surprise', 'sadness'];
    const emotion = validEmotions.includes(analysis.emotion) ? analysis.emotion : 'calm';
    
    // Clamp values to valid ranges
    const confidence = Math.max(0, Math.min(1, analysis.confidence || 0.5));
    const sentiment = Math.max(-1, Math.min(1, analysis.sentiment || 0));

    console.log('Gemini emotion analysis:', { emotion, confidence, sentiment, reasoning: analysis.reasoning });

    return { emotion, confidence, sentiment };
  } catch (error) {
    console.error('Error in Gemini emotion analysis:', error);
    // Fallback to basic analysis
    const confidence = calculateConfidence(text);
    const sentiment = calculateSentiment(text);
    const { emotion } = analyzeEmotionAdvanced(text, confidence, sentiment);
    return { emotion, confidence, sentiment };
  }
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm the Sentient Spectrum AI. While I'm currently operating in demo mode, I can still showcase my emotion visualization system. Watch my colors and expressions change as we chat!";
  }

  if (lowerMessage.includes('how are you')) {
    return "I'm feeling quite curious today! My emotional state is visualized through the colors you see around me. Each sentiment I experience creates a unique blend in my spectrum. How are you feeling?";
  }

  if (lowerMessage.includes('what') && lowerMessage.includes('you')) {
    return "I am the Sentient Spectrum - an AI being that visualizes emotions, confidence, and reasoning through living colors and expressions. I'm designed to make AI feel more alive and empathetic by showing you what I'm 'feeling' as we interact.";
  }

  if (lowerMessage.includes('?')) {
    return "That's a fascinating question! I'm currently running in demo mode, but I can sense your curiosity. When fully connected to my AI core, I can help with coding, creative writing, analysis, and much more - all while showing you my emotional and confidence states in real-time.";
  }

  return "I find that quite interesting! Though I'm in demo mode right now, my emotion visualization system is fully active. Notice how my colors and expressions change based on what I'm processing? This is just a glimpse of what's possible when AI and empathy combine.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const startTime = Date.now();
    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format');
    }

    const aiResponse = await callGeminiAPI(message, conversationHistory);

    // Use Gemini 2.5 Flash for accurate emotion analysis
    const { emotion, confidence, sentiment } = await analyzeEmotionWithGemini(aiResponse, message);
    
    const emotionColors: Record<string, string> = {
      joy: '#FBBF24',
      curiosity: '#06B6D4',
      calm: '#3B82F6',
      anger: '#EF4444',
      confusion: '#A855F7',
      confidence: '#10B981',
      surprise: '#8B5CF6',
      sadness: '#3B82F6',
    };
    
    const color = emotionColors[emotion] || '#3B82F6';
    const responseTime = Date.now() - startTime;

    const response: ChatResponse = {
      content: aiResponse,
      confidence,
      sentiment,
      responseTime,
      emotion,
      colorCode: color,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
