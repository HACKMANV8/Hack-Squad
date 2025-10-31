# Setting Up Gemini API for Emotion Analysis

## Overview
This project now uses **Gemini 2.5 Flash** to analyze emotions in AI responses, providing much more accurate and context-aware emotion detection compared to simple keyword matching.

## Your Gemini API Key
```
AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho
```

## Setup Instructions

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Set the Gemini API key as a secret**:
   ```bash
   supabase secrets set GEMINI_API_KEY=AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho
   ```

5. **Deploy the updated function**:
   ```bash
   supabase functions deploy gemini-chat
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Manage secrets**
3. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho`
4. Click **Save**
5. Redeploy your `gemini-chat` function

## How It Works

The updated system now:

1. **Sends user message** to Gemini 2.5 Flash for response generation
2. **Analyzes the AI response** using a second Gemini call that:
   - Considers the conversation context
   - Analyzes tone, word choice, and emotional undertones
   - Provides accurate emotion classification (joy, curiosity, calm, anger, confusion, confidence, surprise, sadness)
   - Returns confidence and sentiment scores
3. **Displays the emotion** with appropriate colors and animations

## Benefits

✅ **Context-aware**: Understands the conversation flow, not just keywords  
✅ **Accurate**: Uses AI to detect subtle emotional nuances  
✅ **Diverse emotions**: No more repetitive "curiosity" - each response gets properly analyzed  
✅ **Fallback support**: If Gemini API fails, falls back to keyword-based analysis  

## Testing

After setup, try different types of messages:
- Ask happy questions → Should show **joy**
- Ask for help → Should show **curiosity** or **confidence**
- Make statements → Should show **calm**
- Express frustration → Should show **anger** or **sadness**
- Ask confusing questions → Should show **confusion**

## Troubleshooting

**Still showing same emotion?**
- Check that the Gemini API key is set in Supabase secrets
- Verify the edge function is deployed
- Check browser console for API errors
- Ensure you're using the correct Supabase URL in your `.env` file

**API errors?**
- Verify the API key is valid
- Check Gemini API quota/billing
- Review Supabase function logs
