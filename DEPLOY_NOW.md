# 🚀 Deploy Gemini Emotion Analysis - Step by Step

## ✅ Good News!
Your Gemini API key is **working perfectly**! The test showed it can detect:
- **joy** - for happy/excited responses
- **curiosity** - for questions and exploration
- **calm** - for empathetic/neutral responses
- And more emotions based on context!

## 🎯 What You Need to Do

You have **2 options** to deploy. Choose the one that's easiest for you:

---

## Option A: Supabase Dashboard (Recommended - No CLI needed)

### Step 1: Set the API Key Secret

1. Go to **https://app.supabase.com**
2. Select your project
3. Click **Project Settings** (gear icon in sidebar)
4. Go to **Edge Functions** section
5. Click **Manage secrets** or **Add secret**
6. Add new secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho`
7. Click **Save** or **Add**

### Step 2: Deploy the Function

1. In Supabase Dashboard, go to **Edge Functions**
2. Look for `gemini-chat` function (or click **Create function**)
3. Click **Edit** or **Create new function**
4. Name it: `gemini-chat`
5. **Copy ALL the code** from this file:
   ```
   supabase/functions/gemini-chat/index.ts
   ```
6. **Paste** into the function editor
7. Click **Deploy** or **Save**

### Step 3: Test It!

1. Refresh your web app (http://localhost:5173)
2. Try these messages:
   - "This is amazing!" → Should show **joy** 🟡
   - "How does this work?" → Should show **curiosity** 🔵
   - "I understand" → Should show **calm** 🔵
   - "This is frustrating" → Should show **anger** 🔴

---

## Option B: Using Supabase CLI

### Step 1: Install Supabase CLI

```powershell
npm install -g supabase
```

### Step 2: Login and Link

```powershell
# Login to Supabase
supabase login

# Link to your project (get project-ref from dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Deploy Using Script

```powershell
# Run the deployment script
.\deploy-function.ps1
```

Or manually:

```powershell
# Set the API key
supabase secrets set GEMINI_API_KEY=AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho

# Deploy the function
supabase functions deploy gemini-chat
```

---

## 🔍 Verify It's Working

After deployment, check:

1. **Browser Console** (F12) - Should see:
   ```
   Gemini emotion analysis: { emotion: 'joy', confidence: 0.9, ... }
   ```

2. **Supabase Function Logs** - Go to Edge Functions → gemini-chat → Logs

3. **Visual Changes** - The AI avatar should change colors based on different emotions

---

## 📊 What Changed

### Before (Keyword-based):
```
"How does this work?" → Always "curiosity" (keyword match)
"This is great!" → Always "curiosity" (default)
"I understand" → Always "curiosity" (default)
```

### After (Gemini-powered):
```
"How does this work?" → "curiosity" (asking question)
"This is great!" → "joy" (positive excitement)
"I understand" → "calm" (acknowledgment)
"I'm confused" → "confusion" (uncertainty)
```

---

## ⚠️ Troubleshooting

### Still showing same emotion?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard reload**: Ctrl+F5
3. **Check Supabase logs**: Look for errors in function logs
4. **Verify API key**: Make sure it's set in Supabase secrets (not local .env)

### API Errors?

1. Check Gemini API quota: https://makersuite.google.com/app/apikey
2. Verify API key is correct in Supabase secrets
3. Check function logs for specific error messages

### Function not deploying?

1. Make sure you copied the ENTIRE file content
2. Check for syntax errors in the editor
3. Try deploying via CLI instead of dashboard

---

## 📝 Files Updated

✅ `supabase/functions/gemini-chat/index.ts` - Added Gemini emotion analysis  
✅ `src/hooks/useAI.ts` - Uses backend emotion instead of local analysis  
✅ Test script confirms API is working  

---

## 🎉 Next Steps

1. Deploy using one of the options above
2. Test with different message types
3. Watch the AI's emotions change dynamically!

**Need help?** Check the Supabase function logs for detailed error messages.
