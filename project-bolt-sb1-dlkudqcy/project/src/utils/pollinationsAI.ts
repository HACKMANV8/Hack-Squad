// Free image generation using Pollinations.AI
// No API key required, completely free!

import { EmotionType } from './emotions';

const emotionEnhancers: Record<EmotionType, string> = {
  joy: 'vibrant, cheerful, bright colors, uplifting atmosphere, joyful mood, happy energy',
  curiosity: 'intriguing, mysterious, thought-provoking, exploratory, fascinating details, wonder',
  calm: 'peaceful, serene, tranquil, soothing colors, gentle atmosphere, harmonious',
  anger: 'intense, dramatic, bold colors, powerful energy, dynamic composition, strong emotions',
  confusion: 'abstract, surreal, dreamlike, enigmatic, complex patterns, puzzling elements',
  confidence: 'bold, striking, powerful, assertive, strong composition, commanding presence',
  surprise: 'unexpected, astonishing, striking contrasts, dynamic highlights, sudden reveal',
  sadness: 'muted tones, somber, reflective, soft lighting, melancholic atmosphere',
};

interface GenerateImageOptions {
  prompt: string;
  emotion: EmotionType;
  width?: number;
  height?: number;
}

export async function generateImageWithPollinations(
  options: GenerateImageOptions
): Promise<{ imageUrl: string; enhancedPrompt: string }> {
  const { prompt, emotion, width = 512, height = 512 } = options;

  // Enhance the prompt with emotion-specific descriptors
  const emotionContext = emotionEnhancers[emotion];
  const enhancedPrompt = `${prompt}, ${emotionContext}, high quality, detailed, professional, artistic`;

  console.log('🎨 Generating image with Pollinations.AI (Free)...');
  console.log('Prompt:', enhancedPrompt);

  try {
    // Pollinations.AI uses a simple URL-based API
    // The image is generated on-the-fly when the URL is accessed
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true`;

    // Test if the image loads by fetching it
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Image generated successfully!');
    
    return { imageUrl, enhancedPrompt };
  } catch (error) {
    console.error('❌ Error generating image with Pollinations.AI:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate image with Pollinations.AI'
    );
  }
}

export function getEmotionStylePrompt(emotion: EmotionType): string {
  return emotionEnhancers[emotion];
}
