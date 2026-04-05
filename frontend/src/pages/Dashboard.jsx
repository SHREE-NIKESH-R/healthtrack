import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Footprints,
  Droplets,
  Dumbbell,
  Heart,
  Monitor,
  Activity,
  Flame,
  CalendarCheck,
  Target,
} from "lucide-react";
import { recordsApi, wellnessApi, insightsApi, goalsApi } from "../services";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MetricCard from "../components/dashboard/MetricCard";
import TrendChart from "../components/dashboard/TrendChart";
import InsightCard from "../components/dashboard/InsightCard";
import AddRecordModal from "../components/modals/AddRecordModal";

const METRIC_ICONS = {
  sleepHours: Moon,
  stepCount: Footprints,
  waterIntake: Droplets,
  exerciseDuration: Dumbbell,
  heartRate: Heart,
  screenTime: Monitor,
};

const GRADE_BG = {
  "A+": "bg-activity/10 text-activity border-activity/20",
  A: "bg-hydration/10 text-hydration border-hydration/20",
  B: "bg-primary/10 text-primary border-primary/20",
  C: "bg-screen/10 text-screen border-screen/20",
  D: "bg-heart/10 text-heart border-heart/20",
  F: "bg-ink-100 text-ink-400 border-border",
};

export default function Dashboard() {
  const [todayRecord, setTodayRecord] = useState(null);
  const [summary, setSummary] = useState([]);
  const [wellness, setWellness] = useState(null);
  const [insights, setInsights] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rToday, rSummary, rWellness, rInsights, rGoals] =
        await Promise.allSettled([
          recordsApi.today(),
          recordsApi.summary(30),
          wellnessApi.dashboard(),
          insightsApi.get(),
          goalsApi.getAll(),
        ]);
      if (rToday.status === "fulfilled") setTodayRecord(rToday.value.data);
      if (rSummary.status === "fulfilled")
        setSummary(rSummary.value.data.records || []);
      if (rWellness.status === "fulfilled") setWellness(rWellness.value.data);
      if (rInsights.status === "fulfilled")
        setInsights(rInsights.value.data.insights || []);
      if (rGoals.status === "fulfilled") setGoals(rGoals.value.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleModalClose = (saved) => {
    setModalOpen(false);
    if (saved) load();
  };

  const todayScore = wellness?.todayScore;
  const goalMap = {};
  goals.forEach((g) => {
    goalMap[g.metric] = g;
  });

  const metrics = [
    "sleepHours",
    "stepCount",
    "waterIntake",
    "exerciseDuration",
    "heartRate",
    "screenTime",
  ];

  if (loading)
    return (
      <div className="p-6 space-y-6">
        <div className="h-16 shimmer rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-card" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 shimmer rounded-card" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <DashboardHeader
        onRefresh={load}
        onLogToday={() => setModalOpen(true)}
        todayLogged={!!todayRecord}
      />

      <div className="px-6 pb-8 space-y-6">
        {/* Row 1 — Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          {/* Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="card p-5 col-span-1 flex flex-col justify-between"
          >
            <p className="label">Today's Score</p>
            <div className="flex items-end gap-2">
              <span className="font-mono text-4xl font-bold text-gradient">
                {todayScore?.score ?? "—"}
              </span>
              {todayScore?.grade && (
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold border mb-1 ${GRADE_BG[todayScore.grade] || GRADE_BG["F"]}`}
                >
                  {todayScore.grade}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-400 mt-1">
              {todayScore
                ? "Calculated from today's data"
                : "Log today to get your score"}
            </p>
          </motion.div>

          {/* Best Streak */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="card p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-screen" />
              <p className="label mb-0">Active Streak</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-screen">
                {wellness?.bestStreak ?? 0}
              </span>
              <span className="text-sm text-ink-400">days</span>
            </div>
            <p className="text-xs text-ink-400 mt-1">Best current streak</p>
          </motion.div>

          {/* Days Logged */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="card p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck size={16} className="text-hydration" />
              <p className="label mb-0">Days Logged</p>
            </div>
            <span className="font-mono text-4xl font-bold text-hydration">
              {wellness?.totalDaysLogged ?? 0}
            </span>
            <p className="text-xs text-ink-400 mt-1">Lifetime entries</p>
          </motion.div>

          {/* Goals Active */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="card p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-activity" />
              <p className="label mb-0">Active Goals</p>
            </div>
            <span className="font-mono text-4xl font-bold text-activity">
              {wellness?.goalsCount ?? 0}
            </span>
            <p className="text-xs text-ink-400 mt-1">
              {todayRecord ? "Keep going!" : "Log today to check goals"}
            </p>
          </motion.div>
        </div>

        {/* Row 2 — Today's Metrics */}
        <div>
          <h2 className="font-display font-semibold text-ink-800 dark:text-ink-200 text-sm mb-3">
            Today's Metrics
          </h2>
          <div className="grid grid-cols-6 gap-3">
            {metrics.map((metric, i) => (
              <MetricCard
                key={metric}
                metric={metric}
                value={todayRecord?.[metric] ?? null}
                icon={METRIC_ICONS[metric]}
                goal={goalMap[metric]}
                delay={i * 0.05}
              />
            ))}
          </div>
        </div>

        {/* Row 3 — Trend Chart */}
        <TrendChart records={summary} />

        {/* Row 4 — AI Insights */}
        {insights.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-ink-800 dark:text-ink-200 text-sm mb-3">
              AI Insights
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {insights.slice(0, 3).map((ins, i) => (
                <InsightCard key={i} {...ins} delay={i * 0.07} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddRecordModal
        open={modalOpen}
        onClose={handleModalClose}
        existing={todayRecord}
      />
    </div>
  );
}
