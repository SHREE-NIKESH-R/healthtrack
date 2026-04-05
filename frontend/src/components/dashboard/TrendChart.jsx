import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TABS = [
  {
    key: "sleepHours",
    label: "Sleep",
    unit: "hrs",
    color: "#7B68EE",
    fill: "#7B68EE",
  },
  {
    key: "stepCount",
    label: "Steps",
    unit: "k",
    color: "#3A9B6E",
    fill: "#3A9B6E",
  },
  {
    key: "screenTime",
    label: "Screen Time",
    unit: "hrs",
    color: "#ce7d32",
    fill: "#ce7d32",
  },
  {
    key: "waterIntake",
    label: "Water",
    unit: "L",
    color: "#4A9BD5",
    fill: "#4A9BD5",
  },
  { key: "mood", label: "Mood", unit: "", color: "#ce7d32", fill: "#ce7d32" },
];

const MOOD_SCORE = { great: 5, good: 4, okay: 3, low: 2, poor: 1 };
const MOOD_LABEL = {
  5: "Great 😄",
  4: "Good 🙂",
  3: "Okay 😐",
  2: "Low 😕",
  1: "Poor 😞",
};

const CustomTooltip = ({ active, payload, label, unit, tab }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  let display;
  if (tab === "mood") {
    display = MOOD_LABEL[val] || val;
  } else if (tab === "stepCount") {
    display = `${(val / 1000).toFixed(1)}k`;
  } else {
    display = val?.toFixed ? val.toFixed(1) : val;
  }
  return (
    <div className="glass rounded-xl px-3 py-2 shadow-float border border-border dark:border-dark-border text-sm">
      <p className="text-ink-400 text-xs mb-0.5">{label}</p>
      <p className="font-mono font-semibold text-ink-900 dark:text-ink-100">
        {display} {tab !== "mood" ? unit : ""}
      </p>
    </div>
  );
};

export default function TrendChart({ records = [] }) {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];

  const data = records
    .map((r) => {
      let value;
      if (tab.key === "mood") {
        value = r.moodIndicator ? MOOD_SCORE[r.moodIndicator] : null;
      } else {
        value = r[tab.key] ?? null;
      }
      return {
        date: format(new Date(r.date), "MMM d"),
        shortDate: format(new Date(r.date), "EEE"),
        value,
      };
    })
    .filter((d) => d.value !== null);

  // Trend calc
  const getTrend = () => {
    if (data.length < 3) return "stable";
    const half = Math.floor(data.length / 2);
    const first = data.slice(0, half).reduce((s, d) => s + d.value, 0) / half;
    const last =
      data.slice(half).reduce((s, d) => s + d.value, 0) / (data.length - half);
    const pct = ((last - first) / first) * 100;
    if (pct > 4) return "up";
    if (pct < -4) return "down";
    return "stable";
  };

  const trend = getTrend();
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? tab.key === "heartRate" || tab.key === "screenTime"
        ? "text-heart"
        : "text-activity"
      : trend === "down"
        ? tab.key === "heartRate" || tab.key === "screenTime"
          ? "text-activity"
          : "text-heart"
        : "text-ink-400";

  const gradId = `grad-${tab.key}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm">
            Weekly Trends
          </h3>
          <div className={`flex items-center gap-1 mt-0.5 ${trendColor}`}>
            <TrendIcon size={13} />
            <span className="text-xs font-medium capitalize">
              {trend === "up"
                ? "Improving"
                : trend === "down"
                  ? "Declining"
                  : "Stable"}{" "}
              this week
            </span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-ink-100 dark:bg-dark-card rounded-xl p-1">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${
                  i === activeTab
                    ? "bg-surface dark:bg-dark-surface text-ink-900 dark:text-ink-100 shadow-card"
                    : "text-ink-400 hover:text-ink-600 dark:hover:text-ink-300"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-ink-300 text-sm">
          No data for this week
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tab.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={tab.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--tw-border-opacity, #E2E8F0)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              domain={tab.key === "mood" ? [1, 5] : ["auto", "auto"]}
              tickFormatter={
                tab.key === "mood"
                  ? (v) => ["", "😞", "😕", "😐", "🙂", "😄"][v] || ""
                  : undefined
              }
            />
            <Tooltip
              content={<CustomTooltip unit={tab.unit} tab={tab.key} />}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={tab.color}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              dot={{ r: 3.5, fill: tab.color, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{
                r: 5,
                fill: tab.color,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
