# Quick Fix Guide - Emotion Analysis Issue

## Problem
The chatbot is always showing "curiosity" emotion for every response.

## Root Cause
The Gemini API key needs to be configured in Supabase Edge Functions to enable AI-powered emotion analysis.

## ✅ Changes Made

1. **Updated Supabase Function** (`supabase/functions/gemini-chat/index.ts`)
   - Added `analyzeEmotionWithGemini()` function that uses Gemini 2.5 Flash
   - Analyzes emotions based on conversation context, not just keywords
   - Provides accurate emotion classification with confidence scores

2. **Updated Frontend** (`src/hooks/useAI.ts`)
   - Now uses emotion from backend API (Gemini-analyzed)
   - Falls back to local analysis if API fails

## 🚀 Deployment Steps

### Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Set API Key Secret**
   - Go to **Project Settings** → **Edge Functions** → **Manage secrets**
   - Click **New secret**
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho`
   - Click **Add secret**

3. **Deploy Function**
   - Go to **Edge Functions**
   - Find `gemini-chat` function (or create new)
   - Copy the entire content from `supabase/functions/gemini-chat/index.ts`
   - Paste into the function editor
   - Click **Deploy**

### Method 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```powershell
   npm install -g supabase
   ```

2. **Login and Link Project**
   ```powershell
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run Deployment Script**
   ```powershell
   .\deploy-function.ps1
   ```

## 🧪 Testing After Deployment

Try these different message types to see varied emotions:

| Message Type | Expected Emotion |
|-------------|------------------|
| "This is amazing!" | **joy** |
| "How does this work?" | **curiosity** |
| "I understand" | **calm** |
| "This is frustrating" | **anger** |
| "I'm confused" | **confusion** |
| "I'm certain about this" | **confidence** |
| "Wow, that's surprising!" | **surprise** |
| "I'm feeling down" | **sadness** |

## 📊 How It Works Now

```
User Message
    ↓
Gemini 2.5 Flash (generates response)
    ↓
Gemini 2.5 Flash (analyzes emotion in context)
    ↓
Returns: {emotion, confidence, sentiment}
    ↓
Frontend displays with correct color & animation
```

## ⚠️ Important Notes

- The API key is stored in **Supabase secrets** (server-side), not in your `.env` file
- Each message makes 2 Gemini API calls:
  1. Generate response
  2. Analyze emotion
- If Gemini API fails, it falls back to keyword-based analysis
- Check browser console for any API errors

## 🔍 Troubleshooting

**Still showing same emotion?**
1. Clear browser cache and reload
2. Check Supabase function logs for errors
3. Verify API key is set correctly in Supabase secrets
4. Ensure function is deployed with latest code

**API Errors?**
1. Verify Gemini API key is valid
2. Check API quota/billing at https://makersuite.google.com/app/apikey
3. Review Supabase Edge Function logs

**Need Help?**
- Check `SETUP_GEMINI.md` for detailed instructions
- Review Supabase function logs in dashboard
- Test the API key directly at https://aistudio.google.com
