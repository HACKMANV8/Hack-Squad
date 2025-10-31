# Deploy Gemini Chat Function to Supabase
# This script helps deploy the updated emotion analysis function

Write-Host "🚀 Deploying Gemini Chat Function with Enhanced Emotion Analysis" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it using one of these methods:" -ForegroundColor Yellow
    Write-Host "  1. Using npm: npm install -g supabase" -ForegroundColor White
    Write-Host "  2. Using scoop: scoop install supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "Or deploy manually via Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Go to your Supabase project dashboard" -ForegroundColor White
    Write-Host "  2. Navigate to Edge Functions" -ForegroundColor White
    Write-Host "  3. Create/update 'gemini-chat' function" -ForegroundColor White
    Write-Host "  4. Copy code from: supabase/functions/gemini-chat/index.ts" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Set the Gemini API key
Write-Host "📝 Setting Gemini API Key..." -ForegroundColor Cyan
supabase secrets set GEMINI_API_KEY=AIzaSyALKf9SnATD_4OEh_Atx7AFXDSj6hhpfho

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ API Key set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set API key" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Deploy the function
Write-Host "🚀 Deploying gemini-chat function..." -ForegroundColor Cyan
supabase functions deploy gemini-chat

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your emotion analysis is now powered by Gemini 2.5 Flash!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test it by chatting with different emotions:" -ForegroundColor Yellow
    Write-Host "  - Happy messages → joy" -ForegroundColor White
    Write-Host "  - Questions → curiosity" -ForegroundColor White
    Write-Host "  - Calm statements → calm" -ForegroundColor White
    Write-Host "  - Frustrations → anger/sadness" -ForegroundColor White
    Write-Host "  - Uncertain messages → confusion" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
