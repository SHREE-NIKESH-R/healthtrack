import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';

const METRIC_LABELS = {
  sleepHours:       { label: 'Sleep',     unit: 'hrs',  emoji: '💤' },
  stepCount:        { label: 'Steps',     unit: 'steps',emoji: '🚶' },
  waterIntake:      { label: 'Water',     unit: 'L',    emoji: '💧' },
  exerciseDuration: { label: 'Exercise',  unit: 'min',  emoji: '🏃' },
  screenTime:       { label: 'Screen',    unit: 'hrs',  emoji: '📱' },
  heartRate:        { label: 'Heart Rate',unit: 'bpm',  emoji: '❤️' }
};

export default function StreakCard({ metric, streak, longestStreak, target, operator, delay = 0 }) {
  const cfg = METRIC_LABELS[metric] || { label: metric, unit: '', emoji: '🎯' };
  const isActive = streak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`card p-4 hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200
        ${isActive ? 'border-activity/30 bg-activity/5 dark:bg-activity/10' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.emoji}</span>
          <div>
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200">{cfg.label}</p>
            <p className="text-xs text-ink-400">{operator} {target} {cfg.unit}</p>
          </div>
        </div>
        {isActive && <Flame size={16} className="text-screen animate-pulse-slow" />}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono text-2xl font-bold ${isActive ? 'text-activity' : 'text-ink-300 dark:text-ink-600'}`}>
              {streak}
            </span>
            <span className="text-xs text-ink-400">day streak</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-400">
          <Trophy size={12} className="text-ink-300" />
          <span>Best: <span className="font-mono font-medium">{longestStreak}</span></span>
        </div>
      </div>
    </motion.div>
  );
}
