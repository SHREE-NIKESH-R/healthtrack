import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { insightsApi } from '../services';

const TREND_LABEL = { up: '↑ Improving', down: '↓ Declining', stable: '→ Stable' };
const TREND_COLOR = { up: 'text-activity', down: 'text-heart', stable: 'text-ink-400' };

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const r = await insightsApi.get();
      setInsights(r.data.insights || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="px-6 py-6 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Insights</h1>
          <p className="text-sm text-ink-400 mt-0.5">Auto-generated from your last 7 days of data</p>
        </div>
        <button onClick={() => load(true)} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 shimmer rounded-card" />)}
        </div>
      ) : insights.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-display font-semibold text-ink-700 dark:text-ink-300 mb-1">Not enough data yet</h3>
          <p className="text-ink-400 text-sm">Log at least 3 days of health data to see insights.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-6 hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="text-3xl mb-3">{ins.emoji}</div>
              <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100 mb-1.5">{ins.title}</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed mb-4">{ins.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-border dark:border-dark-border">
                {ins.value !== null && ins.value !== undefined ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-ink-400">7-day avg:</span>
                    <span className="font-mono text-sm font-semibold text-ink-700 dark:text-ink-300">
                      {typeof ins.value === 'number' ? ins.value.toFixed(1) : ins.value}
                    </span>
                  </div>
                ) : <span />}

                {ins.trend !== null && ins.trend !== undefined ? (
                  <span className={`text-xs font-medium ${ins.trend > 0 ? TREND_COLOR.up : ins.trend < 0 ? TREND_COLOR.down : TREND_COLOR.stable}`}>
                    {ins.trend > 0 ? '↑' : ins.trend < 0 ? '↓' : '→'} {Math.abs(ins.trend)}% vs last week
                  </span>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
