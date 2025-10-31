// Direct Gemini API integration for emotion analysis
// This bypasses Supabase and calls Gemini directly from the frontend

const GEMINI_API_KEY = 'AIzaSyCbrTicon3y9UxXuzjwEURxIBKuHCsWb34';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface GeminiResponse {
  content: string;
  emotion: string;
  confidence: number;
  sentiment: number;
}

interface ConversationMessage {
  role: string;
  content: string;
}

export async function callGeminiWithEmotionAnalysis(
  userMessage: string,
  conversationHistory: ConversationMessage[]
): Promise<GeminiResponse> {
  console.log('🤖 Calling Gemini API...');
  console.log('User message:', userMessage);
  
  try {
    // Step 1: Analyze USER's emotion from their input message
    console.log('Step 1: Analyzing USER emotion from input...');
    const userEmotionAnalysis = await analyzeUserEmotion(userMessage);
    console.log('✅ User emotion detected:', userEmotionAnalysis);
    
    // Step 2: Generate AI response based on user's emotion
    console.log('Step 2: Generating AI response...');
    const aiResponse = await generateResponse(userMessage, conversationHistory);
    console.log('✅ Response generated:', aiResponse.substring(0, 100) + '...');
    
    // Use the user's detected emotion for the AI's response
    // This reflects how the AI should respond to the user's emotional state
    return {
      content: aiResponse,
      emotion: userEmotionAnalysis.emotion,
      confidence: userEmotionAnalysis.confidence,
      sentiment: userEmotionAnalysis.sentiment,
    };
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // Check if it's a quota error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      console.warn('⚠️ API quota exceeded. Using enhanced fallback system.');
    }
    
    // Provide a fallback response with emotion detection
    const fallbackEmotion = detectEmotionFromMessage(userMessage);
    return {
      content: getFallbackResponse(userMessage),
      emotion: fallbackEmotion.emotion,
      confidence: fallbackEmotion.confidence,
      sentiment: fallbackEmotion.sentiment,
    };
  }
}

// Detect emotion from user message using keywords (fallback when API fails)
function detectEmotionFromMessage(message: string): { emotion: string; confidence: number; sentiment: number } {
  const lowerMessage = message.toLowerCase();
  
  // Joy - happy, excited, positive
  if (lowerMessage.match(/\b(amazing|awesome|great|wonderful|fantastic|excellent|love|happy|excited|thrilled|delighted|joyful)\b/)) {
    return { emotion: 'joy', confidence: 0.85, sentiment: 0.9 };
  }
  
  // Sadness - sad, down, unhappy
  if (lowerMessage.match(/\b(sad|unhappy|depressed|down|miserable|disappointed|heartbroken)\b/)) {
    return { emotion: 'sadness', confidence: 0.85, sentiment: -0.7 };
  }
  
  // Anger - angry, frustrated, annoyed
  if (lowerMessage.match(/\b(angry|mad|furious|frustrated|annoyed|irritated|upset|pissed)\b/)) {
    return { emotion: 'anger', confidence: 0.85, sentiment: -0.8 };
  }
  
  // Confusion - confused, unclear, don't understand
  if (lowerMessage.match(/\b(confused|unclear|don't understand|puzzled|lost|bewildered)\b/)) {
    return { emotion: 'confusion', confidence: 0.85, sentiment: -0.3 };
  }
  
  // Curiosity - questions, wondering
  if (lowerMessage.match(/\b(what|how|why|when|where|who|curious|wonder|interested|tell me)\b/) && lowerMessage.includes('?')) {
    return { emotion: 'curiosity', confidence: 0.8, sentiment: 0.3 };
  }
  
  // Confidence - certain, sure, definitely
  if (lowerMessage.match(/\b(certain|sure|definitely|absolutely|confident|know|understand)\b/) && !lowerMessage.includes('?')) {
    return { emotion: 'confidence', confidence: 0.8, sentiment: 0.5 };
  }
  
  // Surprise - wow, surprising, unexpected
  if (lowerMessage.match(/\b(wow|omg|surprising|unexpected|shocked|amazed|astonished)\b/)) {
    return { emotion: 'surprise', confidence: 0.85, sentiment: 0.4 };
  }
  
  // Default to calm for neutral messages
  return { emotion: 'calm', confidence: 0.6, sentiment: 0 };
}

// Fallback responses when API fails - with emotion detection
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Excited/Happy messages
  if (lowerMessage.includes('amazing') || lowerMessage.includes('awesome') || 
      lowerMessage.includes('great') || lowerMessage.includes('wonderful') ||
      lowerMessage.includes('love') || lowerMessage.includes('excited')) {
    return "That's wonderful! I'm so glad to hear your enthusiasm! What else would you like to explore?";
  }
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm here to help. How can I assist you today?";
  }
  
  // How are you
  if (lowerMessage.includes('how are you')) {
    return "I'm doing well, thank you for asking! How can I help you?";
  }
  
  // Sad/Frustrated
  if (lowerMessage.includes('sad') || lowerMessage.includes('frustrated') || 
      lowerMessage.includes('upset') || lowerMessage.includes('annoying')) {
    return "I understand this can be challenging. I'm here to help make things better. What can I do for you?";
  }
  
  // Confused
  if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand') ||
      lowerMessage.includes('unclear')) {
    return "I can see this might be confusing. Let me try to clarify things for you. What specific part would you like me to explain?";
  }
  
  // Questions
  if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
    return "That's an interesting question! I'd be happy to help you explore that topic. Could you provide more details?";
  }
  
  return "I understand your message. I'm here to help! What would you like to know?";
}

async function generateResponse(
  userMessage: string,
  conversationHistory: ConversationMessage[]
): Promise<string> {
  console.log('📡 Fetching from Gemini API...');
  console.log('API URL:', GEMINI_API_URL);
  console.log('API Key:', GEMINI_API_KEY.substring(0, 20) + '...');
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }]
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
  });

  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini response generation error:');
    console.error('Status:', response.status);
    console.error('Error text:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
      console.error('Parsed error:', errorData);
    } catch {
      console.error('Could not parse error as JSON');
    }
    
    throw new Error(`Gemini API error ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error('Unexpected API response format');
}

// Analyze USER's emotion from their input message
async function analyzeUserEmotion(
  userMessage: string
): Promise<{ emotion: string; confidence: number; sentiment: number }> {
  const emotionPrompt = `You are an emotion detector. Analyze this user's message and determine what PRIMARY emotion they are expressing.

User's message: "${userMessage}"

Choose the ONE emotion that BEST matches the user's emotional state from these 8 options:
- joy: Happy, excited, enthusiastic, delighted, cheerful, positive
- curiosity: Asking questions, exploring, wondering, seeking information
- calm: Neutral, peaceful, composed, understanding, relaxed
- anger: Frustrated, upset, annoyed, irritated, mad
- confusion: Uncertain, puzzled, unclear, lost, bewildered
- confidence: Certain, assured, definite, sure, knowledgeable
- surprise: Amazed, shocked, astonished, unexpected, wow
- sadness: Down, discouraged, melancholic, unhappy, disappointed

IMPORTANT RULES:
- If user says "amazing", "awesome", "great" → joy
- If user asks "how", "what", "why" → curiosity
- If user says "sad", "unhappy", "down" → sadness
- If user says "frustrated", "annoying", "upset" → anger
- If user says "confused", "don't understand" → confusion
- If user says "wow", "omg", "surprising" → surprise
- If user says "sure", "definitely", "I know" → confidence
- If neutral greeting or statement → calm
- Pick the STRONGEST emotion based on the words used

Respond ONLY in this JSON format (no markdown, no code blocks):
{
  "emotion": "<one of the 8 emotions>",
  "confidence": <0.0 to 1.0>,
  "sentiment": <-1.0 to 1.0>,
  "reasoning": "<why you chose this>"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 200,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`User emotion analysis API returned ${response.status}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('No response from user emotion analysis');
  }

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Could not parse user emotion response:', responseText);
    throw new Error('Could not parse user emotion analysis response');
  }

  const analysis = JSON.parse(jsonMatch[0]);
  
  // Validate the emotion
  const validEmotions = ['joy', 'curiosity', 'calm', 'anger', 'confusion', 'confidence', 'surprise', 'sadness'];
  const emotion = validEmotions.includes(analysis.emotion) ? analysis.emotion : 'calm';
  const confidence = Math.max(0, Math.min(1, analysis.confidence || 0.8));
  const sentiment = Math.max(-1, Math.min(1, analysis.sentiment || 0));

  console.log('👤 User emotion analysis:', { 
    emotion, 
    confidence, 
    sentiment, 
    reasoning: analysis.reasoning 
  });

  return { emotion, confidence, sentiment };
}

async function analyzeEmotion(
  aiResponse: string,
  userMessage: string
): Promise<{ emotion: string; confidence: number; sentiment: number }> {
  const emotionPrompt = `You are an emotion detector. Analyze this AI assistant's response and determine its PRIMARY emotional tone.

User asked: "${userMessage}"
AI responded: "${aiResponse}"

Choose the ONE emotion that BEST matches the AI's response from these 8 options:
- joy: Happy, excited, enthusiastic, delighted, cheerful
- curiosity: Asking questions, exploring, wondering, inquisitive
- calm: Neutral, peaceful, composed, understanding, acknowledging
- anger: Frustrated, upset, annoyed, irritated
- confusion: Uncertain, puzzled, unclear, not understanding
- confidence: Certain, assured, definite, sure, knowledgeable
- surprise: Amazed, shocked, astonished, unexpected
- sadness: Down, discouraged, melancholic, sympathetic to sadness

IMPORTANT RULES:
- If the AI is explaining something confidently → confidence
- If the AI is asking questions or exploring → curiosity
- If the AI uses excited/happy language → joy
- If the AI is just acknowledging or being neutral → calm
- If the response shows empathy for user's frustration → calm (not anger)
- If the response is informative and certain → confidence
- Pick the STRONGEST emotion, not the safest one

Respond ONLY in this JSON format (no markdown, no code blocks):
{
  "emotion": "<one of the 8 emotions>",
  "confidence": <0.0 to 1.0>,
  "sentiment": <-1.0 to 1.0>,
  "reasoning": "<why you chose this>"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
        temperature: 0.5,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 200,
      },
    }),
  });

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
    console.error('Could not parse emotion response:', responseText);
    throw new Error('Could not parse emotion analysis response');
  }

  const analysis = JSON.parse(jsonMatch[0]);
  
  // Validate the emotion is one of our supported types
  const validEmotions = ['joy', 'curiosity', 'calm', 'anger', 'confusion', 'confidence', 'surprise', 'sadness'];
  const emotion = validEmotions.includes(analysis.emotion) ? analysis.emotion : 'calm';
  
  // Clamp values to valid ranges
  const confidence = Math.max(0, Math.min(1, analysis.confidence || 0.5));
  const sentiment = Math.max(-1, Math.min(1, analysis.sentiment || 0));

  console.log('✨ Gemini emotion analysis:', { 
    emotion, 
    confidence, 
    sentiment, 
    reasoning: analysis.reasoning 
  });

  return { emotion, confidence, sentiment };
}

// Analyze the emotion of a generated image based on the prompt
export async function analyzeImageEmotion(
  userPrompt: string,
  enhancedPrompt: string
): Promise<{ emotion: string; confidence: number; reasoning: string }> {
  const emotionPrompt = `You are an emotion detector for AI-generated images. Based on the image generation prompt, determine what PRIMARY emotion the resulting image would convey.

User requested: "${userPrompt}"
Enhanced prompt used: "${enhancedPrompt}"

Analyze what emotion this image would express and choose ONE from these 8 options:
- joy: Happy, cheerful, vibrant, uplifting, positive
- curiosity: Intriguing, mysterious, exploratory, thought-provoking
- calm: Peaceful, serene, tranquil, soothing, harmonious
- anger: Intense, dramatic, powerful, bold, aggressive
- confusion: Abstract, surreal, complex, puzzling, unclear
- confidence: Bold, striking, assertive, strong, commanding
- surprise: Unexpected, astonishing, dramatic, shocking
- sadness: Somber, melancholic, muted, reflective, down

IMPORTANT RULES:
- If the user asks for a "sad" image → sadness
- If the user asks for a "happy" or "joyful" image → joy
- If the user asks for a "peaceful" or "calm" image → calm
- If the user asks for a "mysterious" or "intriguing" image → curiosity
- If the user asks for a "powerful" or "bold" image → confidence
- Look at the emotional keywords in BOTH prompts
- Pick the emotion that best matches the intended mood

Respond ONLY in this JSON format (no markdown, no code blocks):
{
  "emotion": "<one of the 8 emotions>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<why this emotion matches the image>"
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.4,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Image emotion analysis API returned ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from image emotion analysis');
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse image emotion response:', responseText);
      throw new Error('Could not parse image emotion analysis response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate the emotion
    const validEmotions = ['joy', 'curiosity', 'calm', 'anger', 'confusion', 'confidence', 'surprise', 'sadness'];
    const emotion = validEmotions.includes(analysis.emotion) ? analysis.emotion : 'calm';
    const confidence = Math.max(0, Math.min(1, analysis.confidence || 0.8));

    console.log('🖼️ Image emotion analysis:', { 
      emotion, 
      confidence, 
      reasoning: analysis.reasoning 
    });

    return { 
      emotion, 
      confidence, 
      reasoning: analysis.reasoning || 'Emotion detected from image prompt'
    };
  } catch (error) {
    console.error('Error analyzing image emotion:', error);
    // Fallback: try to detect emotion from user prompt keywords
    return detectEmotionFromPrompt(userPrompt);
  }
}

// Fallback: Simple keyword-based emotion detection from prompt
function detectEmotionFromPrompt(prompt: string): { emotion: string; confidence: number; reasoning: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('sad') || lowerPrompt.includes('melanchol') || lowerPrompt.includes('sorrow')) {
    return { emotion: 'sadness', confidence: 0.9, reasoning: 'User requested sad imagery' };
  }
  if (lowerPrompt.includes('happy') || lowerPrompt.includes('joy') || lowerPrompt.includes('cheerful')) {
    return { emotion: 'joy', confidence: 0.9, reasoning: 'User requested happy imagery' };
  }
  if (lowerPrompt.includes('calm') || lowerPrompt.includes('peace') || lowerPrompt.includes('serene')) {
    return { emotion: 'calm', confidence: 0.9, reasoning: 'User requested calm imagery' };
  }
  if (lowerPrompt.includes('angry') || lowerPrompt.includes('intense') || lowerPrompt.includes('dramatic')) {
    return { emotion: 'anger', confidence: 0.9, reasoning: 'User requested intense imagery' };
  }
  if (lowerPrompt.includes('mysterious') || lowerPrompt.includes('curious') || lowerPrompt.includes('intriguing')) {
    return { emotion: 'curiosity', confidence: 0.9, reasoning: 'User requested mysterious imagery' };
  }
  if (lowerPrompt.includes('bold') || lowerPrompt.includes('powerful') || lowerPrompt.includes('confident')) {
    return { emotion: 'confidence', confidence: 0.9, reasoning: 'User requested powerful imagery' };
  }
  if (lowerPrompt.includes('surprising') || lowerPrompt.includes('unexpected') || lowerPrompt.includes('shocking')) {
    return { emotion: 'surprise', confidence: 0.9, reasoning: 'User requested surprising imagery' };
  }
  
  return { emotion: 'calm', confidence: 0.5, reasoning: 'Default neutral emotion' };
}
