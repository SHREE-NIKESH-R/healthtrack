import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { wellnessApi, goalsApi } from '../services';
import HealthScoreGauge from '../components/wellness/HealthScoreGauge';
import StreakCard from '../components/wellness/StreakCard';
import WeeklyHeatmap from '../components/wellness/WeeklyHeatmap';

export default function Wellness() {
  const [dashboard, setDashboard] = useState(null);
  const [scores30, setScores30]   = useState([]);
  const [goals, setGoals]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      wellnessApi.dashboard(),
      wellnessApi.scores(30),
      goalsApi.getAll()
    ]).then(([rD, rS, rG]) => {
      if (rD.status === 'fulfilled') setDashboard(rD.value.data);
      if (rS.status === 'fulfilled') setScores30(rS.value.data);
      if (rG.status === 'fulfilled') setGoals(rG.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = scores30.map(s => ({
    date: format(new Date(s.date), 'MMM d'),
    score: s.score,
    grade: s.grade
  }));

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-40 shimmer rounded-card" />)}
    </div>
  );

  const todayScore = dashboard?.todayScore;

  return (
    <div className="px-6 py-6 space-y-6 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Wellness</h1>
        <p className="text-sm text-ink-400 mt-0.5">Your health score, streaks, and activity overview</p>
      </motion.div>

      {/* Top row: Gauge + Streaks */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">
          <HealthScoreGauge
            score={todayScore?.score ?? 0}
            grade={todayScore?.grade ?? 'F'}
            breakdown={todayScore?.breakdown ?? {}}
          />
        </div>
        <div className="col-span-2">
          <h2 className="font-display font-semibold text-ink-800 dark:text-ink-200 text-sm mb-3">Active Streaks</h2>
          <div className="grid grid-cols-3 gap-3">
            {goals.map((g, i) => (
              <StreakCard
                key={g._id}
                metric={g.metric}
                streak={g.streak}
                longestStreak={g.longestStreak}
                target={g.target}
                operator={g.operator}
                delay={i * 0.06}
              />
            ))}
            {goals.length === 0 && (
              <div className="col-span-3 card p-6 text-center text-ink-400 text-sm">
                No goals set yet. <a href="/goals" className="text-primary underline">Set your first goal →</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <WeeklyHeatmap scores={scores30} />

      {/* 30-day score chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-5"
      >
        <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm mb-4">30-Day Score History</h3>
        {chartData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-ink-300 text-sm">No score data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4A6DB5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4A6DB5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="glass rounded-xl px-3 py-2 shadow-float border border-border dark:border-dark-border text-xs">
                      <p className="text-ink-400">{payload[0]?.payload?.date}</p>
                      <p className="font-mono font-bold text-primary">Score: {payload[0]?.value}</p>
                      <p className="text-ink-500">Grade: {payload[0]?.payload?.grade}</p>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#4A6DB5" strokeWidth={2.5} fill="url(#scoreGrad)"
                dot={{ r: 3, fill: '#4A6DB5', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#4A6DB5', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
