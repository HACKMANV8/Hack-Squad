// Test JSON2Video API
const API_KEY = 'fSgWBhTaR2l8EAYpMnA2DhfdQoF6BH1RlZVqVd02';
const API_URL = 'https://api.json2video.com/v2/movies';

async function testJSON2Video() {
  console.log('🔍 Testing JSON2Video API...');
  console.log('API Key:', API_KEY.substring(0, 15) + '...');
  console.log('API URL:', API_URL);
  console.log('');

  // Simple test video script
  const videoScript = {
    resolution: 'hd',
    quality: 'high',
    fps: 30,
    draft: false,
    scenes: [
      {
        duration: 5,
        background: {
          type: 'color',
          color: '#4169E1',
        },
        elements: [
          {
            type: 'text',
            text: 'Test Video',
            style: {
              'font-family': 'Arial',
              'font-size': '60px',
              color: '#FFFFFF',
              'text-align': 'center',
            },
            position: {
              x: '50%',
              y: '50%',
            },
          },
        ],
      },
    ],
  };

  try {
    console.log('📡 Sending request to JSON2Video...');
    console.log('Video script:', JSON.stringify(videoScript, null, 2));
    console.log('');

    // Try different authentication methods
    console.log('Trying method 1: X-API-Key header...');
    let response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        project: videoScript,
      }),
    });

    if (response.status === 401) {
      console.log('Method 1 failed, trying method 2: x-api-key header...');
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          project: videoScript,
        }),
      });
    }

    if (response.status === 401) {
      console.log('Method 2 failed, trying method 3: Authorization Bearer...');
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          project: videoScript,
        }),
      });
    }

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('');

    if (response.status === 200 || response.status === 201) {
      const data = await response.json();
      console.log('✅ SUCCESS! API is working!');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('');

      const movieId = data.project || data.id;
      if (movieId) {
        console.log('🎬 Movie ID:', movieId);
        console.log('');
        console.log('⏳ Polling for video completion...');
        await pollForVideo(movieId);
      } else {
        console.log('⚠️ No movie ID in response');
      }
    } else if (response.status === 401) {
      console.log('❌ AUTHENTICATION FAILED (401)');
      console.log('Your API key is invalid or expired');
      const text = await response.text();
      console.log('Error:', text);
    } else if (response.status === 403) {
      console.log('❌ ACCESS FORBIDDEN (403)');
      console.log('Your API key does not have permission');
      const text = await response.text();
      console.log('Error:', text);
    } else if (response.status === 400) {
      console.log('❌ BAD REQUEST (400)');
      console.log('The video script format is incorrect');
      const text = await response.text();
      console.log('Error:', text);
    } else {
      const text = await response.text();
      console.log('❌ Unexpected response:', response.status);
      console.log('Response:', text);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('');
    console.log('Possible issues:');
    console.log('- Network connection problem');
    console.log('- Firewall blocking request');
    console.log('- Invalid API endpoint');
  }
}

async function pollForVideo(movieId) {
  const maxAttempts = 20;
  const pollInterval = 3000;
  const pollUrl = `https://api.json2video.com/v2/movies/${movieId}`;

  console.log('Polling at:', pollUrl);
  console.log('');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(pollUrl, {
        headers: {
          'x-api-key': API_KEY, // lowercase!
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Poll ${i + 1}/${maxAttempts}:`, data.status || 'unknown');

        if (data.status === 'done' && data.url) {
          console.log('');
          console.log('🎉 VIDEO READY!');
          console.log('Video URL:', data.url);
          console.log('');
          console.log('✅ JSON2Video API is fully functional!');
          return;
        } else if (data.status === 'error') {
          console.log('');
          console.log('❌ Video generation failed');
          console.log('Error:', data.error);
          return;
        }
      } else {
        console.log(`Poll ${i + 1}/${maxAttempts}: Error ${response.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.log(`Poll ${i + 1}/${maxAttempts}: Error -`, error.message);
    }
  }

  console.log('');
  console.log('⏱️ Timeout - Video is still processing');
  console.log('Check your JSON2Video dashboard for the video');
}

testJSON2Video();
