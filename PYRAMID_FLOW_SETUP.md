# Pyramid Flow Video Generation Setup

This project now supports **Pyramid Flow** for high-quality 5-second video generation!

## 🎬 What is Pyramid Flow?

Pyramid Flow is a state-of-the-art AI video generation model that creates smooth, high-quality videos from text prompts. It generates 5-second videos at 24fps with 1280x768 resolution.

## 🚀 Setup Instructions

### Option 1: Hugging Face (Recommended - FREE)

1. **Create a Hugging Face Account**
   - Go to https://huggingface.co/join
   - Sign up for a free account

2. **Get Your API Token**
   - Visit https://huggingface.co/settings/tokens
   - Click "New token"
   - Give it a name (e.g., "Pyramid Flow")
   - Select "Read" access
   - Copy the token (starts with `hf_...`)

3. **Add Token to Your Project**
   - Create a `.env` file in the project root (if it doesn't exist)
   - Add this line:
     ```
     VITE_HUGGINGFACE_TOKEN=hf_your_token_here
     ```
   - Replace `hf_your_token_here` with your actual token

4. **Restart the Dev Server**
   ```bash
   npm run dev
   ```

### Option 2: Replicate (Alternative)

1. **Create a Replicate Account**
   - Go to https://replicate.com/signin
   - Sign up for an account

2. **Get Your API Token**
   - Visit https://replicate.com/account/api-tokens
   - Copy your API token

3. **Add Token to `.env`**
   ```
   VITE_REPLICATE_TOKEN=r8_your_token_here
   ```

## 📝 Configuration

Edit `src/config/videoConfig.ts` to customize:

```typescript
export const VIDEO_CONFIG = {
  // Enable/disable Pyramid Flow
  USE_PYRAMID_FLOW: true, // Set to false to use fallback
  
  // Video settings
  VIDEO_SETTINGS: {
    duration: 5,        // seconds
    fps: 24,            // frames per second
    width: 1280,        // pixels
    height: 768,        // pixels
    guidance_scale: 7.5,
    num_inference_steps: 50,
  },
};
```

## 🎯 How It Works

1. **User requests video** → Click 🎬 Video button
2. **Try Pyramid Flow first** → Attempts to generate with AI
3. **Fallback if needed** → Uses frame-based animation if API unavailable
4. **Display result** → Shows 5-second video in chat

## 📊 Video Specifications

- **Duration**: 5 seconds
- **Resolution**: 1280x768 (HD)
- **Frame Rate**: 24 fps (120 total frames)
- **Format**: MP4 video
- **Quality**: High-quality AI-generated

## ⚡ Features

✅ **Automatic fallback** - Works even without API token
✅ **Emotion-aware** - Videos match AI's emotional state
✅ **Style options** - Realistic, Anime, or Cinematic
✅ **Free tier available** - Hugging Face offers free API access
✅ **High quality** - 1280x768 HD resolution

## 🔧 Troubleshooting

### Video not generating?
- Check if your API token is correct
- Verify token has "Read" permissions
- Check browser console for errors
- Try disabling Pyramid Flow in config (uses fallback)

### API rate limits?
- Hugging Face free tier has rate limits
- Consider upgrading to Pro for more requests
- Fallback animation will work without limits

### Token not working?
- Make sure token starts with `hf_`
- Restart dev server after adding token
- Check `.env` file is in project root
- Token should not have quotes around it

## 💡 Tips

- **First generation may be slow** - Model needs to load
- **Subsequent generations are faster** - Model stays warm
- **Fallback is instant** - Always works as backup
- **Check console logs** - See which method is being used

## 📚 Resources

- [Pyramid Flow Model](https://huggingface.co/rain1011/pyramid-flow-sd3)
- [Hugging Face Docs](https://huggingface.co/docs/api-inference/index)
- [Replicate Docs](https://replicate.com/docs)

## 🎉 Enjoy!

Your AI companion can now generate amazing 5-second videos with Pyramid Flow! 🚀
