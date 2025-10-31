import { Volume2, VolumeX } from 'lucide-react';
import AIAvatar from './components/AIAvatar';
import ChatInterface from './components/ChatInterface';
import MetricsDashboard from './components/MetricsDashboard';
import EmotionHistory from './components/EmotionHistory';
import { useAI } from './hooks/useAI';
import { EMOTION_COLORS } from './utils/emotions';
import { useState } from 'react';
import { stopSpeaking } from './utils/speech';

function App() {
  const {
    messages,
    aiState,
    personality,
    emotionHistory,
    isLoading,
    isGeneratingImage,
    isGeneratingVideo,
    sendMessage,
    generateImage,
    generateVideo,
  } = useAI();

  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };

  const backgroundColor = EMOTION_COLORS[aiState.emotion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${backgroundColor}40 0%, transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${backgroundColor}30 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${backgroundColor}20 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor }}
              />
              <h1 className="text-2xl font-bold text-white">
                The Sentient Spectrum
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-400">Personality:</span>
                <span className="text-xs text-cyan-400">
                  C:{Math.round(personality.curiosity * 100)}%
                </span>
                <span className="text-xs text-green-400">
                  Cf:{Math.round(personality.confidence * 100)}%
                </span>
                <span className="text-xs text-yellow-400">
                  F:{Math.round(personality.friendliness * 100)}%
                </span>
              </div>

              <button
                onClick={handleMuteToggle}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 h-[600px]">
              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                onGenerateImage={generateImage}
                onGenerateVideo={generateVideo}
                isLoading={isLoading}
                isGeneratingImage={isGeneratingImage}
                isGeneratingVideo={isGeneratingVideo}
              />
            </div>

            <MetricsDashboard
              confidence={aiState.confidence}
              responseTime={aiState.responseTime}
              sentiment={aiState.sentiment}
              accuracy={aiState.accuracy}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                <span>Living Avatar</span>
              </h3>
              <div className="aspect-square">
                <AIAvatar
                  emotion={aiState.emotion}
                  intensity={aiState.intensity}
                  isThinking={isLoading}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-400 capitalize">
                  Feeling {aiState.emotion}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Intensity: {Math.round(aiState.intensity * 100)}%
                </p>
              </div>
            </div>

            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
              <EmotionHistory emotions={emotionHistory} />
            </div>
          </div>
        </div>

        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-800/50">
          <p>
            Powered by Gemini 2.5 Flash • Made with emotion and empathy
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
