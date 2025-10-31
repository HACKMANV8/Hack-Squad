import { Activity, Zap, Target, TrendingUp } from 'lucide-react';

interface MetricsDashboardProps {
  confidence: number;
  responseTime: number;
  sentiment: number;
  accuracy: number;
}

export default function MetricsDashboard({
  confidence,
  responseTime,
  sentiment,
  accuracy,
}: MetricsDashboardProps) {
  const metrics = [
    {
      label: 'Confidence',
      value: confidence,
      color: 'from-green-500 to-emerald-600',
      icon: Target,
      format: (v: number) => `${Math.round(v * 100)}%`,
    },
    {
      label: 'Response Time',
      value: Math.min(responseTime / 3000, 1),
      color: 'from-cyan-500 to-blue-600',
      icon: Zap,
      format: (v: number) => `${Math.round(v * 3000)}ms`,
      invert: true,
    },
    {
      label: 'Sentiment',
      value: (sentiment + 1) / 2,
      color: 'from-yellow-500 to-orange-600',
      icon: TrendingUp,
      format: (v: number) => {
        const score = v * 2 - 1;
        if (score > 0.3) return 'Positive';
        if (score < -0.3) return 'Negative';
        return 'Neutral';
      },
    },
    {
      label: 'Accuracy',
      value: accuracy,
      color: 'from-purple-500 to-pink-600',
      icon: Activity,
      format: (v: number) => `${Math.round(v * 100)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const displayValue = metric.invert ? 1 - metric.value : metric.value;
        const percentage = displayValue * 100;

        return (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-400">
                  {metric.label}
                </span>
              </div>
              <span className="text-sm font-bold text-white">
                {metric.format(metric.value)}
              </span>
            </div>

            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`absolute h-full bg-gradient-to-r ${metric.color} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
