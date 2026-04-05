import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const METRIC_CONFIG = {
  sleepHours:       { label: 'Sleep',     unit: 'hrs',  color: 'sleep',     gradient: 'gradient-sleep'     },
  stepCount:        { label: 'Steps',     unit: 'steps',color: 'activity',  gradient: 'gradient-activity'  },
  waterIntake:      { label: 'Water',     unit: 'L',    color: 'hydration', gradient: 'gradient-hydration' },
  exerciseDuration: { label: 'Exercise',  unit: 'min',  color: 'activity',  gradient: 'gradient-activity'  },
  heartRate:        { label: 'Heart Rate',unit: 'bpm',  color: 'heart',     gradient: 'gradient-heart'     },
  screenTime:       { label: 'Screen',    unit: 'hrs',  color: 'screen',    gradient: 'gradient-screen'    },
  bloodPressure:    { label: 'BP',        unit: 'mmHg', color: 'primary',   gradient: 'gradient-primary'   },
  sugarLevel:       { label: 'Sugar',     unit: 'mg/dL',color: 'screen',    gradient: 'gradient-screen'    }
};

export default function MetricCard({ metric, value, icon: Icon, goal, delay = 0 }) {
  const cfg = METRIC_CONFIG[metric] || { label: metric, unit: '', color: 'primary', gradient: 'gradient-primary' };

  let goalMet = null;
  if (goal && value !== null && value !== undefined) {
    goalMet = goal.operator === '>=' ? value >= goal.target : value <= goal.target;
  }

  const displayValue = () => {
    if (value === null || value === undefined) return '—';
    if (metric === 'stepCount') return value.toLocaleString();
    if (metric === 'bloodPressure') return `${value.systolic}/${value.diastolic}`;
    if (typeof value === 'number') return value % 1 === 0 ? value : value.toFixed(1);
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card-3d p-4 cursor-default"
    >
      <div className={`${cfg.gradient} rounded-xl p-3 mb-3 inline-flex`}>
        {Icon && <Icon size={18} className={`text-${cfg.color}`} />}
      </div>

      <div className="flex items-end justify-between mb-1">
        <div>
          <p className="text-xs text-ink-400 font-medium mb-1">{cfg.label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono text-xl font-semibold text-${cfg.color} dark:text-${cfg.color}`}>
              {displayValue()}
            </span>
            <span className="text-xs text-ink-400">{cfg.unit}</span>
          </div>
        </div>
        {goalMet !== null && (
          <div className={`${goalMet ? 'text-activity' : 'text-ink-300 dark:text-ink-600'}`}>
            {goalMet
              ? <CheckCircle2 size={18} className="text-activity" />
              : <XCircle size={18} />
            }
          </div>
        )}
      </div>

      {goal && (
        <p className="text-xs text-ink-400 mt-1">
          Target: {goal.operator} {metric === 'stepCount' ? goal.target.toLocaleString() : goal.target} {cfg.unit}
        </p>
      )}
      {value === null || value === undefined ? (
        <p className="text-xs text-ink-300 dark:text-ink-600 mt-1">Not logged today</p>
      ) : null}
    </motion.div>
  );
}
