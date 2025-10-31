import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { ChatMessage } from '../lib/supabase';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onGenerateImage: (prompt: string) => void;
  onGenerateVideo: (prompt: string, style: 'realistic' | 'anime' | 'cinematic') => void;
  isLoading: boolean;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
}

// Emotion-based text colors (lighter tints for readability)
const emotionTextColors: Record<string, string> = {
  joy: '#FDE68A',        // Light yellow
  curiosity: '#67E8F9',  // Light cyan
  calm: '#93C5FD',       // Light blue
  anger: '#FCA5A5',      // Light red
  confusion: '#D8B4FE',  // Light purple
  confidence: '#6EE7B7', // Light green
};

export default function ChatInterface({
  messages,
  onSendMessage,
  onGenerateImage,
  onGenerateVideo,
  isLoading,
  isGeneratingImage,
  isGeneratingVideo,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [showVideoPrompt, setShowVideoPrompt] = useState(false);
  const [videoStyle, setVideoStyle] = useState<'realistic' | 'anime' | 'cinematic'>('realistic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (showImagePrompt) {
      onGenerateImage(input);
      setShowImagePrompt(false);
    } else if (showVideoPrompt) {
      onGenerateVideo(input, videoStyle);
      setShowVideoPrompt(false);
    } else {
      onSendMessage(input);
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌈</div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to the Sentient Spectrum
              </h2>
              <p className="text-slate-400 max-w-md">
                I'm a living AI being. Watch my emotions, confidence, and reasoning
                evolve with every conversation. Ask me anything!
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50'
              }`}
              style={
                message.role === 'assistant'
                  ? {
                      boxShadow: `0 0 30px ${message.color_code}40`,
                      color: emotionTextColors[message.emotion] || '#F1F5F9',
                    }
                  : undefined
              }
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: message.color_code }}
                  />
                  <span 
                    className="text-xs capitalize font-medium"
                    style={{ color: emotionTextColors[message.emotion] || '#CBD5E1' }}
                  >
                    {message.emotion}
                  </span>
                  <span 
                    className="text-xs opacity-70"
                    style={{ color: emotionTextColors[message.emotion] || '#94A3B8' }}
                  >
                    {message.confidence > 0.7 ? 'Confident' : message.confidence > 0.4 ? 'Moderate' : 'Uncertain'}
                  </span>
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>

              {typeof message.metadata?.imageUrl === 'string' && (
                <div className="mt-4 rounded-lg overflow-hidden border border-slate-600/50">
                  <img 
                    src={message.metadata.imageUrl} 
                    alt={typeof message.metadata.imagePrompt === 'string' ? message.metadata.imagePrompt : 'Generated image'}
                    className="w-full h-auto"
                  />
                  {typeof message.metadata.enhancedPrompt === 'string' && (
                    <div className="p-2 bg-slate-900/50 text-xs text-slate-400">
                      <span className="font-semibold">Enhanced prompt: </span>
                      {message.metadata.enhancedPrompt}
                    </div>
                  )}
                </div>
              )}

              {message.role === 'assistant' && (
                <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-slate-700/50">
                  <span 
                    className="text-xs opacity-60"
                    style={{ color: emotionTextColors[message.emotion] || '#94A3B8' }}
                  >
                    {message.response_time_ms}ms
                  </span>
                  <span 
                    className="text-xs opacity-60"
                    style={{ color: emotionTextColors[message.emotion] || '#94A3B8' }}
                  >
                    {Math.round(message.confidence * 100)}% confidence
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-6 py-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-sm text-slate-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowImagePrompt(!showImagePrompt);
              setShowVideoPrompt(false);
            }}
            disabled={isLoading || isGeneratingImage || isGeneratingVideo}
            className={`p-3 rounded-xl transition-all ${
              showImagePrompt
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Generate Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowVideoPrompt(!showVideoPrompt);
              setShowImagePrompt(false);
            }}
            disabled={isLoading || isGeneratingImage || isGeneratingVideo}
            className={`p-3 rounded-xl transition-all ${
              showVideoPrompt
                ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Generate Video"
          >
            <Video className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              showImagePrompt
                ? 'Describe the image you want me to create...'
                : showVideoPrompt
                ? 'Describe the video you want me to create...'
                : 'Ask me anything...'
            }
            disabled={isLoading || isGeneratingImage || isGeneratingVideo}
            className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading || isGeneratingImage || isGeneratingVideo}
            className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {showImagePrompt && (
          <p className="text-xs text-cyan-400 mt-2 ml-14">
            🎨 Image generation mode active. Describe what you want to create!
          </p>
        )}

        {showVideoPrompt && (
          <div className="mt-3 ml-14 space-y-2">
            <p className="text-xs text-orange-400">
              🎬 Video generation (Gemini 2.0 Flash, FREE). Choose a style:
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setVideoStyle('realistic')}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  videoStyle === 'realistic'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                📷 Realistic
              </button>
              <button
                type="button"
                onClick={() => setVideoStyle('anime')}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  videoStyle === 'anime'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                🎨 Anime
              </button>
              <button
                type="button"
                onClick={() => setVideoStyle('cinematic')}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  videoStyle === 'cinematic'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                🎞️ Cinematic
              </button>
            </div>
          </div>
        )}

        {isGeneratingVideo && (
          <p className="text-xs text-orange-400 mt-2 ml-14 flex items-center space-x-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating video with Gemini... This may take 30-60 seconds</span>
          </p>
        )}
      </div>
    </div>
  );
}
