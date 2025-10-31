// Test script to verify Gemini emotion analysis works
// Run with: node test-gemini-emotion.js

const GEMINI_API_KEY = 'AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho';

async function testEmotionAnalysis(aiResponse, userMessage) {
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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
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
            temperature: 0.5,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from emotion analysis');
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('Raw response:', responseText);
      throw new Error('Could not parse emotion analysis response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Test cases
const testCases = [
  {
    user: "This is amazing!",
    ai: "I'm so glad you're excited! This is indeed a wonderful feature that I'm thrilled to share with you!"
  },
  {
    user: "How does this work?",
    ai: "That's a great question! Let me explain how this system operates. I'm curious to know if you have any specific aspects you'd like me to dive deeper into?"
  },
  {
    user: "I understand now",
    ai: "Perfect! I'm happy that makes sense to you. Feel free to ask if you need any clarification."
  },
  {
    user: "This is frustrating",
    ai: "I understand your frustration. This can be challenging, and I apologize for any difficulties you're experiencing."
  },
  {
    user: "Tell me about AI",
    ai: "Artificial Intelligence is a fascinating field that encompasses machine learning, neural networks, and cognitive computing. It's revolutionizing how we interact with technology."
  }
];

async function runTests() {
  console.log('🧪 Testing Gemini Emotion Analysis\n');
  console.log('API Key:', GEMINI_API_KEY.substring(0, 20) + '...\n');

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📝 Test ${i + 1}:`);
    console.log(`User: "${test.user}"`);
    console.log(`AI: "${test.ai}"`);
    console.log('Analyzing...');

    const result = await testEmotionAnalysis(test.ai, test.user);
    
    if (result) {
      console.log(`✅ Emotion: ${result.emotion}`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Sentiment: ${result.sentiment}`);
      console.log(`   Reasoning: ${result.reasoning}`);
    } else {
      console.log('❌ Analysis failed');
    }
    
    console.log('─'.repeat(60));
  }

  console.log('\n✨ Testing complete!\n');
}

runTests().catch(console.error);
