// Test Stability AI API key and endpoint
// Run with: node test-stability-api.js

const STABILITY_API_KEY = 'sk-y67GbYrRwSStsMgYlGe9WWQK8VNubVkuWhK1ZgLtfNpts92S';
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core';

async function testStabilityAPI() {
  console.log('🧪 Testing Stability AI API...\n');
  console.log('API Key:', STABILITY_API_KEY.substring(0, 20) + '...');
  console.log('Endpoint:', STABILITY_API_URL);
  console.log('\n📝 Generating test image...\n');

  const formData = new FormData();
  formData.append('prompt', 'A beautiful sunset over mountains, vibrant colors, peaceful atmosphere');
  formData.append('aspect_ratio', '1:1');
  formData.append('output_format', 'png');

  try {
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ API Error Response:');
      console.error(errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('\nParsed error:', JSON.stringify(errorData, null, 2));
      } catch {
        console.error('\nRaw error text:', errorText);
      }

      // Specific error handling
      if (response.status === 401) {
        console.error('\n🔑 Error: Invalid API key');
        console.error('Solution: Check your Stability AI API key at https://platform.stability.ai/account/keys');
      } else if (response.status === 402) {
        console.error('\n💳 Error: Insufficient credits');
        console.error('Solution: Add credits to your Stability AI account at https://platform.stability.ai/account/credits');
      } else if (response.status === 403) {
        console.error('\n🚫 Error: Access forbidden');
        console.error('Solution: Your API key may not have permission for this endpoint');
      } else if (response.status === 404) {
        console.error('\n🔍 Error: Endpoint not found');
        console.error('Solution: The API endpoint may have changed. Check Stability AI documentation.');
      } else if (response.status === 429) {
        console.error('\n⏱️ Error: Rate limit exceeded');
        console.error('Solution: Wait a moment and try again');
      }

      return;
    }

    const data = await response.json();
    console.log('\n✅ Success! Image generated');
    console.log('Response keys:', Object.keys(data));
    
    if (data.image) {
      console.log('✅ Image data received (base64)');
      console.log('Image size:', data.image.length, 'characters');
      console.log('\n🎉 Stability AI is working correctly!');
    } else {
      console.log('⚠️ No image data in response');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('\n🌐 Network Error');
      console.error('Solution: Check your internet connection');
    }
  }
}

testStabilityAPI().catch(console.error);
