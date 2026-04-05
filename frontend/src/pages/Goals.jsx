import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Flame, Trophy, Target, X, Loader2 } from "lucide-react";
import { goalsApi } from "../services";

const METRIC_OPTIONS = [
  {
    value: "sleepHours",
    label: "Sleep Hours",
    unit: "hrs",
    operator: ">=",
    placeholder: "7",
    emoji: "💤",
  },
  {
    value: "stepCount",
    label: "Step Count",
    unit: "steps",
    operator: ">=",
    placeholder: "10000",
    emoji: "🚶",
  },
  {
    value: "waterIntake",
    label: "Water Intake",
    unit: "L",
    operator: ">=",
    placeholder: "2",
    emoji: "💧",
  },
  {
    value: "exerciseDuration",
    label: "Exercise",
    unit: "min",
    operator: ">=",
    placeholder: "30",
    emoji: "🏃",
  },
  {
    value: "screenTime",
    label: "Screen Time",
    unit: "hrs",
    operator: "<=",
    placeholder: "6",
    emoji: "📱",
  },
];

const metricCfg = (metric) =>
  METRIC_OPTIONS.find((m) => m.value === metric) || {};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ metric: "", target: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await goalsApi.getAll();
      setGoals(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const existingMetrics = goals.map((g) => g.metric);
  const availableMetrics = METRIC_OPTIONS.filter(
    (m) => !existingMetrics.includes(m.value),
  );

  const handleAdd = async () => {
    if (!form.metric || !form.target)
      return setError("Please select a metric and set a target.");
    setSaving(true);
    setError("");
    try {
      await goalsApi.create({
        metric: form.metric,
        target: Number(form.target),
      });
      setShowAdd(false);
      setForm({ metric: "", target: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await goalsApi.delete(id);
      setGoals((g) => g.filter((x) => x._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const selectedMetric = METRIC_OPTIONS.find((m) => m.value === form.metric);

  return (
    <div className="px-6 py-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">
            Goals
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Set targets and build daily streaks
          </p>
        </div>
        {goals.length < 5 && (
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> Add Goal
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 shimmer rounded-card" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <Target size={40} className="text-ink-200 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-ink-700 dark:text-ink-300 mb-1">
            No goals yet
          </h3>
          <p className="text-ink-400 text-sm mb-4">
            Set up to 6 health goals and track your streaks
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary mx-auto flex items-center gap-2"
          >
            <Plus size={15} /> Set Your First Goal
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {goals.map((goal, i) => {
            const cfg = metricCfg(goal.metric);
            const isActive = goal.streak > 0;
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`card p-5 relative group hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200
                  ${isActive ? "border-activity/20 bg-activity/5 dark:bg-activity/5" : ""}`}
              >
                {/* Delete btn */}
                <button
                  onClick={() => handleDelete(goal._id)}
                  disabled={deleting === goal._id}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-heart/10 text-ink-300 hover:text-heart transition-all duration-150"
                >
                  {deleting === goal._id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{cfg.emoji}</span>
                  <div>
                    <p className="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm">
                      {cfg.label}
                    </p>
                    <p className="text-xs text-ink-400">
                      {goal.operator} {goal.target} {cfg.unit}
                    </p>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-end gap-3 mb-3">
                  <div>
                    <p className="text-xs text-ink-400 mb-0.5 flex items-center gap-1">
                      <Flame
                        size={11}
                        className={isActive ? "text-screen" : "text-ink-300"}
                      />
                      Current streak
                    </p>
                    <span
                      className={`font-mono text-3xl font-bold ${isActive ? "text-activity" : "text-ink-300 dark:text-ink-600"}`}
                    >
                      {goal.streak}
                    </span>
                    <span className="text-xs text-ink-400 ml-1">days</span>
                  </div>
                  <div className="mb-1">
                    <p className="text-xs text-ink-400 mb-0.5 flex items-center gap-1">
                      <Trophy size={11} className="text-ink-300" /> Best
                    </p>
                    <span className="font-mono text-sm font-semibold text-ink-500">
                      {goal.longestStreak} days
                    </span>
                  </div>
                </div>

                {/* Progress bar for streak vs longest */}
                <div className="h-1.5 bg-ink-100 dark:bg-dark-card rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        goal.longestStreak > 0
                          ? `${(goal.streak / goal.longestStreak) * 100}%`
                          : "0%",
                    }}
                    transition={{ duration: 0.6, delay: i * 0.06 + 0.2 }}
                    className="h-full rounded-full bg-activity"
                  />
                </div>

                <p className="text-xs text-ink-400 mt-2">
                  {goal.totalDaysAchieved} day
                  {goal.totalDaysAchieved !== 1 ? "s" : ""} achieved total
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm"
              onClick={() => {
                setShowAdd(false);
                setError("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-md rounded-2xl shadow-float border border-border dark:border-dark-border p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">
                  Add Goal
                </h2>
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setError("");
                  }}
                  className="btn-ghost p-1.5"
                >
                  <X size={15} />
                </button>
              </div>

              {error && <p className="text-heart text-sm mb-3">{error}</p>}

              <div className="space-y-3">
                <div>
                  <label className="label">Metric</label>
                  <select
                    className="input-field"
                    value={form.metric}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        metric: e.target.value,
                        target: "",
                      }))
                    }
                  >
                    <option value="">Select a metric...</option>
                    {availableMetrics.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.emoji} {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMetric && (
                  <div>
                    <label className="label">
                      Target ({selectedMetric.operator} {selectedMetric.unit})
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder={selectedMetric.placeholder}
                      value={form.target}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, target: e.target.value }))
                      }
                    />
                    <p className="text-xs text-ink-400 mt-1">
                      Goal will be: {selectedMetric.label}{" "}
                      {selectedMetric.operator} {form.target || "?"}{" "}
                      {selectedMetric.unit}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setError("");
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={saving}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    {saving ? "Saving..." : "Add Goal"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
