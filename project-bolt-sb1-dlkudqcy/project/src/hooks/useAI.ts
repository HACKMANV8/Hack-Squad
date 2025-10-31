import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage } from '../lib/supabase';
import { EmotionType, EMOTION_COLORS } from '../utils/emotions';
import { analyzeEmotionAdvanced } from '../utils/advancedEmotions';
import { speak } from '../utils/speech';
import { generateImageWithPollinations } from '../utils/pollinationsAI';
import { generateVideoWithVidu } from '../utils/viduAI';
import { callGeminiWithEmotionAnalysis, analyzeImageEmotion } from '../utils/geminiAPI';

interface AIState {
  emotion: EmotionType;
  confidence: number;
  sentiment: number;
  intensity: number;
  responseTime: number;
  accuracy: number;
}

interface PersonalityState {
  curiosity: number;
  confidence: number;
  friendliness: number;
}

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiState, setAIState] = useState<AIState>({
    emotion: 'calm',
    confidence: 0.5,
    sentiment: 0,
    intensity: 0.5,
    responseTime: 0,
    accuracy: 0.8,
  });
  const [personality, setPersonality] = useState<PersonalityState>({
    curiosity: 0.5,
    confidence: 0.5,
    friendliness: 0.5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [emotionHistory, setEmotionHistory] = useState<Array<{
    emotion: EmotionType;
    timestamp: Date;
    intensity: number;
  }>>([]);

  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  const updatePersonality = useCallback((newEmotion: EmotionType, confidence: number) => {
    setPersonality(prev => {
      const delta = 0.05;

      const updates: Partial<PersonalityState> = {};

      if (newEmotion === 'curiosity') {
        updates.curiosity = Math.min(1, prev.curiosity + delta);
      }

      if (confidence > 0.7) {
        updates.confidence = Math.min(1, prev.confidence + delta);
      } else if (confidence < 0.4) {
        updates.confidence = Math.max(0, prev.confidence - delta);
      }

      if (newEmotion === 'joy') {
        updates.friendliness = Math.min(1, prev.friendliness + delta);
      }

      return { ...prev, ...updates };
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'user',
      content,
      emotion: 'calm',
      confidence: 1,
      sentiment_score: 0,
      response_time_ms: 0,
      color_code: '#3B82F6',
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push({ role: 'user', content });

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Call Gemini directly for response generation and emotion analysis
      const geminiResult = await callGeminiWithEmotionAnalysis(
        content,
        conversationHistoryRef.current.slice(-10)
      );

      const responseTime = Date.now() - startTime;
      const emotion = geminiResult.emotion as EmotionType;
      const colorCode = EMOTION_COLORS[emotion];

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: geminiResult.content,
        emotion: emotion,
        confidence: geminiResult.confidence,
        sentiment_score: geminiResult.sentiment,
        response_time_ms: responseTime,
        color_code: colorCode,
        metadata: {},
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      conversationHistoryRef.current.push({ role: 'assistant', content: geminiResult.content });

      // Calculate intensity for visualization
      const emotionData = analyzeEmotionAdvanced(
        geminiResult.content, 
        geminiResult.confidence, 
        geminiResult.sentiment
      );

      setAIState({
        emotion: emotion,
        confidence: geminiResult.confidence,
        sentiment: geminiResult.sentiment,
        intensity: emotionData.intensity,
        responseTime: responseTime,
        accuracy: geminiResult.confidence,
      });

      setEmotionHistory(prev => [
        ...prev,
        {
          emotion: emotion,
          timestamp: new Date(),
          intensity: emotionData.intensity,
        },
      ]);

      updatePersonality(emotion, geminiResult.confidence);

      speak(geminiResult.content, { emotion: emotion }).catch(err => {
        console.error('Speech error:', err);
      });

    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));

      // The error should not reach here because callGeminiWithEmotionAnalysis has fallback
      // But if it does, provide a helpful message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: "I apologize for the interruption. Let me try to help you anyway. What would you like to know?",
        emotion: 'calm',
        confidence: 0.5,
        sentiment_score: 0,
        response_time_ms: Date.now() - startTime,
        color_code: '#3B82F6',
        metadata: { error: true },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      setAIState(prev => ({
        ...prev,
        emotion: 'calm',
        confidence: 0.5,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, updatePersonality]);

  const generateImage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsGeneratingImage(true);
    const startTime = Date.now();

    // Add user's image request message
    const userImageRequest: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'user',
      content: `🎨 Generate image: ${prompt}`,
      emotion: 'curiosity',
      confidence: 1,
      sentiment_score: 0.5,
      response_time_ms: 0,
      color_code: '#3B82F6',
      metadata: { imagePrompt: prompt },
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userImageRequest]);

    // Set AI state to show excitement about creating
    setAIState(prev => ({
      ...prev,
      emotion: 'curiosity',
      intensity: 0.9,
    }));

    try {
      // Generate image with current emotion context using free Pollinations.AI
      const { imageUrl, enhancedPrompt } = await generateImageWithPollinations({
        prompt,
        emotion: aiState.emotion,
        width: 512,
        height: 512,
      });

      // Analyze the emotion of the generated image using Gemini
      const imageEmotionAnalysis = await analyzeImageEmotion(prompt, enhancedPrompt);
      const detectedEmotion = imageEmotionAnalysis.emotion as EmotionType;
      const emotionColor = EMOTION_COLORS[detectedEmotion];

      const responseTime = Date.now() - startTime;

      // Create message with the generated image and detected emotion
      const imageMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: `I've created this image for you! 🎨

**Image Emotion Analysis:**
- **Detected Emotion**: ${detectedEmotion.toUpperCase()}
- **Confidence**: ${(imageEmotionAnalysis.confidence * 100).toFixed(0)}%
- **Reasoning**: ${imageEmotionAnalysis.reasoning}

The image captures: "${prompt}"

This image expresses a ${detectedEmotion} mood, as requested!`,
        emotion: detectedEmotion,
        confidence: imageEmotionAnalysis.confidence,
        sentiment_score: detectedEmotion === 'joy' ? 0.8 : detectedEmotion === 'sadness' ? -0.6 : 0,
        response_time_ms: responseTime,
        color_code: emotionColor,
        metadata: { 
          imagePrompt: prompt,
          enhancedPrompt,
          imageUrl,
          detectedEmotion,
          emotionConfidence: imageEmotionAnalysis.confidence,
          emotionReasoning: imageEmotionAnalysis.reasoning,
          generatedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, imageMessage]);

      // Update AI state to match the detected image emotion
      setAIState(prev => ({
        ...prev,
        emotion: detectedEmotion,
        intensity: imageEmotionAnalysis.confidence,
        confidence: imageEmotionAnalysis.confidence,
        sentiment: detectedEmotion === 'joy' ? 0.8 : detectedEmotion === 'sadness' ? -0.6 : 0,
        responseTime,
      }));

      setEmotionHistory(prev => [
        ...prev,
        {
          emotion: detectedEmotion,
          timestamp: new Date(),
          intensity: imageEmotionAnalysis.confidence,
        },
      ]);

      speak(imageMessage.content, { emotion: detectedEmotion }).catch(err => {
        console.error('Speech error:', err);
      });

    } catch (error) {
      console.error('Error generating image:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: `I encountered an issue while creating your image. ${error instanceof Error ? error.message : 'Please try again with a different prompt or check your API connection.'}`,
        emotion: 'confusion',
        confidence: 0.3,
        sentiment_score: -0.3,
        response_time_ms: Date.now() - startTime,
        color_code: '#A855F7',
        metadata: { error: true },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);

      setAIState(prev => ({
        ...prev,
        emotion: 'confusion',
        intensity: 0.6,
      }));
    } finally {
      setIsGeneratingImage(false);
    }
  }, [sessionId, aiState.emotion]);

  const generateVideo = useCallback(async (prompt: string, style: 'realistic' | 'anime' | 'cinematic' = 'realistic') => {
    if (!prompt.trim()) return;

    setIsGeneratingVideo(true);
    const startTime = Date.now();

    // Add user's video request message
    const userVideoRequest: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'user',
      content: `🎬 Generate video: ${prompt} (${style} style)`,
      emotion: 'curiosity',
      confidence: 1,
      sentiment_score: 0.5,
      response_time_ms: 0,
      color_code: '#3B82F6',
      metadata: { videoPrompt: prompt, style },
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userVideoRequest]);

    // Set AI state to show excitement about creating
    setAIState(prev => ({
      ...prev,
      emotion: 'curiosity',
      intensity: 0.9,
    }));

    try {
      // Generate video with Gemini 2.0 Flash (FREE!)
      const { videoUrl, enhancedPrompt, taskId } = await generateVideoWithVidu({
        prompt,
        emotion: aiState.emotion,
        duration: 8, // 8 seconds with Gemini
        style,
      });

      const responseTime = Date.now() - startTime;

      // Create message with the generated video
      const videoMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: `I've created this video for you! 🎬

**Video Details:**
- **Style**: ${style}
- **Duration**: Up to 8 seconds
- **Model**: Gemini 2.0 Flash (FREE!)
- **Emotion**: ${aiState.emotion.toUpperCase()}

The video captures: "${prompt}"

This video expresses a ${aiState.emotion} mood with ${style} aesthetics!`,
        emotion: 'joy',
        confidence: 0.9,
        sentiment_score: 0.8,
        response_time_ms: responseTime,
        color_code: '#FBBF24',
        metadata: { 
          videoPrompt: prompt,
          enhancedPrompt,
          videoUrl,
          taskId,
          style,
          duration: 8,
          generatedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, videoMessage]);

      // Update AI state to joyful after successful creation
      setAIState(prev => ({
        ...prev,
        emotion: 'joy',
        intensity: 0.9,
        confidence: 0.9,
        sentiment: 0.8,
        responseTime,
      }));

      setEmotionHistory(prev => [
        ...prev,
        {
          emotion: 'joy',
          timestamp: new Date(),
          intensity: 0.9,
        },
      ]);

      speak(videoMessage.content, { emotion: 'joy' }).catch(err => {
        console.error('Speech error:', err);
      });

    } catch (error) {
      console.error('Error generating video:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: `I encountered an issue while creating your video. ${error instanceof Error ? error.message : 'Please try again with a different prompt or check your Vidu AI API connection and credits.'}`,
        emotion: 'confusion',
        confidence: 0.3,
        sentiment_score: -0.3,
        response_time_ms: Date.now() - startTime,
        color_code: '#A855F7',
        metadata: { error: true },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);

      setAIState(prev => ({
        ...prev,
        emotion: 'confusion',
        intensity: 0.6,
      }));
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [sessionId, aiState.emotion]);

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      role: 'assistant',
      content: "Hello! I'm the Sentient Spectrum - powered by Gemini 2.5 Flash! Watch my colors and emotions shift as we converse. Each response is analyzed by AI to show you my true emotional state. Try different messages and see how I feel!",
      emotion: 'joy',
      confidence: 0.85,
      sentiment_score: 0.8,
      response_time_ms: 0,
      color_code: '#FBBF24',
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages([welcomeMessage]);
    setEmotionHistory([{
      emotion: 'joy',
      timestamp: new Date(),
      intensity: 0.8,
    }]);
  }, [sessionId]);

  return {
    messages,
    aiState,
    personality,
    emotionHistory,
    isLoading,
    isGeneratingImage,
    isGeneratingVideo,
    sendMessage,
    generateImage,
    generateVideo,
  };
}
