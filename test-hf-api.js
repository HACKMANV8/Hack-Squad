// Test Hugging Face API for Pyramid Flow
// Testing multiple model endpoints
const MODELS = [
  'rain1011/pyramid-flow-sd3',
  'stabilityai/stable-video-diffusion-img2vid',
  'damo-vilab/text-to-video-ms-1.7b',
];
const TOKEN = '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';

async function testModel(modelName) {
  const API_URL = `https://api-inference.huggingface.co/models/${modelName}`;
  
  console.log(`\n📡 Testing: ${modelName}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'a beautiful sunset over the ocean',
        parameters: {
          num_frames: 24,
          height: 320,
          width: 576,
        }
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.status === 200) {
      console.log('✅ WORKING! Model is accessible');
      return modelName;
    } else if (response.status === 503) {
      console.log('⚠️ Model loading (will work after warmup)');
      return modelName;
    } else if (response.status === 404) {
      console.log('❌ Model not found');
    } else if (response.status === 401) {
      console.log('❌ Token invalid');
    } else if (response.status === 403) {
      console.log('❌ Insufficient permissions');
    } else {
      const text = await response.text();
      console.log('Response:', text.substring(0, 100));
    }
    return null;

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return null;
  }
}

async function testAll() {
  console.log('🔍 Testing Hugging Face API Token');
  console.log('Token:', TOKEN.substring(0, 15) + '...\n');
  
  for (const model of MODELS) {
    const result = await testModel(model);
    if (result) {
      console.log(`\n🎉 FOUND WORKING MODEL: ${result}`);
      break;
    }
  }
  
  console.log('\n✅ Token validation complete!');
}

testAll();
