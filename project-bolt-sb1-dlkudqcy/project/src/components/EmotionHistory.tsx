import { EMOTION_COLORS, EmotionType } from '../utils/emotions';

interface EmotionEntry {
  emotion: EmotionType;
  timestamp: Date;
  intensity: number;
}

interface EmotionHistoryProps {
  emotions: EmotionEntry[];
}

export default function EmotionHistory({ emotions }: EmotionHistoryProps) {
  const recentEmotions = emotions.slice(-20);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
        <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
        <span>Emotion Timeline</span>
      </h3>

      <div className="flex items-center space-x-1 h-12 bg-slate-900/50 rounded-lg p-2 overflow-hidden">
        {recentEmotions.map((entry, index) => {
          const color = EMOTION_COLORS[entry.emotion];
          const opacity = 0.3 + entry.intensity * 0.7;

          return (
            <div
              key={index}
              className="flex-1 h-full rounded transition-all duration-300 hover:scale-110 cursor-pointer group relative"
              style={{
                backgroundColor: color,
                opacity,
                minWidth: '4px',
              }}
              title={`${entry.emotion} - ${entry.intensity.toFixed(2)}`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {entry.emotion}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
          <div key={emotion} className="flex items-center space-x-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-400 capitalize">{emotion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
