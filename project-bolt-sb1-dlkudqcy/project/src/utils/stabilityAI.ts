import { EmotionType } from './emotions';

const STABILITY_API_KEY = 'sk-y67GbYrRwSStsMgYlGe9WWQK8VNubVkuWhK1ZgLtfNpts92S';
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core';

interface GenerateImageOptions {
  prompt: string;
  emotion: EmotionType;
  aspectRatio?: string;
  outputFormat?: string;
}

// interface StabilityResponse {
//   image: string;
//   seed: number;
//   finish_reason: string;
// }

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

export async function generateImageWithStability(
  options: GenerateImageOptions
): Promise<{ imageUrl: string; enhancedPrompt: string }> {
  const { prompt, emotion, aspectRatio = '1:1', outputFormat = 'png' } = options;

  // Enhance the prompt with emotion-specific descriptors
  const emotionContext = emotionEnhancers[emotion];
  const enhancedPrompt = `${prompt}, ${emotionContext}, high quality, detailed, professional photography, 8k resolution`;

  console.log('🎨 Generating image with Stability AI...');
  console.log('Prompt:', enhancedPrompt);
  console.log('Aspect ratio:', aspectRatio);

  const formData = new FormData();
  formData.append('prompt', enhancedPrompt);
  formData.append('aspect_ratio', aspectRatio);
  formData.append('output_format', outputFormat);

  try {
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI API error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      // Check for specific error types
      if (response.status === 401) {
        throw new Error('Invalid Stability AI API key. Please check your API key configuration.');
      } else if (response.status === 402) {
        throw new Error('Insufficient credits in Stability AI account. Please add credits to continue.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Your API key may not have permission to use this endpoint.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      throw new Error(
        `Stability AI API error (${response.status}): ${errorData.message || errorData.name || response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ Image generated successfully!');
    
    // The API returns base64 encoded image
    if (data.image) {
      const imageUrl = `data:image/${outputFormat};base64,${data.image}`;
      return { imageUrl, enhancedPrompt };
    }

    throw new Error('No image data received from Stability AI');
  } catch (error) {
    console.error('❌ Error generating image with Stability AI:', error);
    
    // Provide a fallback placeholder image
    const placeholderImage = generatePlaceholderImage(prompt, emotion);
    
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate image. Please check your API key and credits.'
    );
  }
}

// Generate a placeholder image with text
function generatePlaceholderImage(prompt: string, emotion: EmotionType): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Background color based on emotion
  const emotionColors: Record<EmotionType, string> = {
    joy: '#FBBF24',
    curiosity: '#06B6D4',
    calm: '#3B82F6',
    anger: '#EF4444',
    confusion: '#A855F7',
    confidence: '#10B981',
    surprise: '#8B5CF6',
    sadness: '#6B7280',
  };
  
  ctx.fillStyle = emotionColors[emotion];
  ctx.fillRect(0, 0, 512, 512);
  
  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Image Generation', 256, 230);
  ctx.fillText('Unavailable', 256, 260);
  
  ctx.font = '16px Arial';
  ctx.fillText('Please check API key', 256, 300);
  
  return canvas.toDataURL('image/png');
}

export function getEmotionStylePrompt(emotion: EmotionType): string {
  return emotionEnhancers[emotion];
}
