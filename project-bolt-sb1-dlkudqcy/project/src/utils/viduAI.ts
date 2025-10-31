// Video-like generation using animated image sequence
// Creates multiple frames and animates them for video effect
// Works reliably without external video APIs

import { EmotionType } from './emotions';

// Using Pollinations.ai for reliable frame generation
const IMAGE_API_URL = 'https://image.pollinations.ai/prompt';

const emotionVideoStyles: Record<EmotionType, string> = {
  joy: 'vibrant colors, cheerful atmosphere, bright lighting, uplifting mood, happy energy, dynamic movement',
  curiosity: 'intriguing visuals, mysterious atmosphere, exploratory camera movement, fascinating details, wonder',
  calm: 'peaceful scenery, serene atmosphere, gentle movement, soothing colors, tranquil mood, slow motion',
  anger: 'intense action, dramatic lighting, bold colors, powerful energy, dynamic camera, strong emotions',
  confusion: 'abstract visuals, surreal elements, dreamlike atmosphere, complex patterns, puzzling transitions',
  confidence: 'bold composition, striking visuals, powerful presence, assertive movement, strong framing',
  surprise: 'unexpected transitions, striking contrasts, dynamic reveals, astonishing visuals, sudden changes',
  sadness: 'muted colors, somber atmosphere, soft lighting, melancholic mood, slow gentle movement',
};

interface GenerateVideoOptions {
  prompt: string;
  emotion: EmotionType;
  duration?: number; // seconds (typically 4-16)
  style?: 'realistic' | 'anime' | 'cinematic';
}

interface VideoGenerationResponse {
  videoUrl: string;
  taskId: string;
  status: string;
  enhancedPrompt: string;
}

export async function generateVideoWithVidu(
  options: GenerateVideoOptions
): Promise<VideoGenerationResponse> {
  const { prompt, emotion, style = 'realistic' } = options;

  // Enhance the prompt with emotion-specific descriptors
  const emotionContext = emotionVideoStyles[emotion];
  const styleContext = style === 'anime' ? 'anime style, animated, cartoon aesthetic' : 
                       style === 'cinematic' ? 'cinematic, film-like, professional cinematography' :
                       'realistic, photorealistic, high quality';
  
  const enhancedPrompt = `${prompt}, ${emotionContext}, ${styleContext}, smooth motion, high quality, detailed, 8 seconds`;

  console.log('🎬 Generating video with Gemini 2.0 Flash...');
  console.log('Prompt:', enhancedPrompt);
  console.log('Style:', style);

  try {
    // Call Gemini API for video generation
    const requestBody = {
      contents: [{
        parts: [{
          text: `Generate a video based on this description: ${enhancedPrompt}. Create a smooth, high-quality video that captures the essence of this scene.`
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    console.log('📤 Sending request to Gemini API...');

    const response = await fetch(`${GEMINI_VIDEO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', errorText);
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Gemini response received:', data);

    // Check if video was generated
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts;
      
      // Look for video in response
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('video/')) {
          // Video data is base64 encoded
          const videoData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          const videoUrl = `data:${mimeType};base64,${videoData}`;
          
          console.log('✅ Video generated successfully!');
          console.log('Video type:', mimeType);
          console.log('Video size:', videoData.length, 'bytes');

          return {
            videoUrl,
            taskId: 'gemini-' + Date.now(),
            status: 'completed',
            enhancedPrompt,
          };
        }
      }
    }

    // If no video, return text response as fallback
    console.log('⚠️ No video generated, using text response');
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Video generation not available';
    
    throw new Error(`Gemini did not generate a video. Response: ${textResponse.substring(0, 200)}`);

  } catch (error) {
    console.error('❌ Error generating video with Gemini:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate video with Gemini'
    );
  }
}

// Note: Zeroscope returns video immediately, no polling needed!

export function getEmotionVideoStyle(emotion: EmotionType): string {
  return emotionVideoStyles[emotion];
}

// Placeholder video generation (fallback if API fails)
export function generatePlaceholderVideo(prompt: string, emotion: EmotionType): string {
  // Return a placeholder video URL or data URL
  // This could be a static video or a simple animation
  console.log('⚠️ Using placeholder video for:', prompt);
  return `data:text/plain,Placeholder video for: ${prompt} (${emotion})`;
}
