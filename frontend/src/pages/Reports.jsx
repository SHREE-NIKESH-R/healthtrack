import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Printer, Download } from 'lucide-react';
import { recordsApi, wellnessApi } from '../services';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { profile } = useAuth();
  const [summary, setSummary]   = useState([]);
  const [scores, setScores]     = useState([]);
  const [period, setPeriod]     = useState(30);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      recordsApi.summary(period),
      wellnessApi.scores(period)
    ]).then(([rS, rSc]) => {
      if (rS.status === 'fulfilled')  setSummary(rS.value.data.records || []);
      if (rSc.status === 'fulfilled') setScores(rSc.value.data);
    }).finally(() => setLoading(false));
  }, [period]);

  const avg = (key) => {
    const vals = summary.filter(r => r[key] != null);
    if (!vals.length) return null;
    return (vals.reduce((s, r) => s + r[key], 0) / vals.length);
  };

  const stats = [
    { label: 'Avg Heart Rate', value: avg('heartRate'),        unit: 'bpm',  fmt: v => Math.round(v) },
    { label: 'Avg Sleep',      value: avg('sleepHours'),       unit: 'hrs',  fmt: v => v.toFixed(1)   },
    { label: 'Avg Steps',      value: avg('stepCount'),        unit: 'steps',fmt: v => Math.round(v).toLocaleString() },
    { label: 'Avg Water',      value: avg('waterIntake'),      unit: 'L',    fmt: v => v.toFixed(1)   },
    { label: 'Avg Exercise',   value: avg('exerciseDuration'), unit: 'min',  fmt: v => Math.round(v)  },
    { label: 'Avg Screen',     value: avg('screenTime'),       unit: 'hrs',  fmt: v => v.toFixed(1)   }
  ];

  const scoreAvg = scores.length ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length) : null;

  const chartData = summary.slice(-14).map(r => ({
    date: format(new Date(r.date), 'MMM d'),
    steps: r.stepCount,
    sleep: r.sleepHours,
    hr:    r.heartRate
  }));

  return (
    <div className="px-6 py-6 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Reports</h1>
          <p className="text-sm text-ink-400 mt-0.5">Monthly summary & data export</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex gap-1 bg-ink-100 dark:bg-dark-card rounded-xl p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${period === d ? 'bg-surface dark:bg-dark-surface text-ink-900 dark:text-ink-100 shadow-card' : 'text-ink-400'}`}>
                {d}d
              </button>
            ))}
          </div>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 shimmer rounded-card" />)}</div>
      ) : (
        <div className="space-y-5 print:space-y-6">
          {/* Report header (print only styling) */}
          <div className="print:block">
            <p className="text-xs text-ink-400 print:text-ink-500">
              Report for: <strong>{profile?.name}</strong> · Period: Last {period} days ·
              Generated: {format(new Date(), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Summary Stats */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">Summary Statistics</h2>
              {scoreAvg && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-400">Avg health score:</span>
                  <span className="font-mono font-bold text-primary text-lg">{scoreAvg}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ label, value, unit, fmt }) => (
                <div key={label} className="p-3 rounded-xl bg-ink-50 dark:bg-dark-card">
                  <p className="text-xs text-ink-400 mb-1">{label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-ink-800 dark:text-ink-200">
                      {value != null ? fmt(value) : '—'}
                    </span>
                    <span className="text-xs text-ink-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Charts */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
            <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 mb-4">Steps (last 14 days)</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="steps" fill="#3A9B6E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Records count */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
            <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 mb-2">Data Coverage</h2>
            <div className="flex items-center gap-4">
              <div>
                <span className="font-mono text-3xl font-bold text-primary">{summary.length}</span>
                <span className="text-ink-400 text-sm ml-1">/ {period} days logged</span>
              </div>
              <div className="flex-1 h-3 bg-ink-100 dark:bg-dark-card rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.length / period) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-sm font-mono text-ink-500">
                {Math.round((summary.length / period) * 100)}%
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
