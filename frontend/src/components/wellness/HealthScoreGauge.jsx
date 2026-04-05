import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { motion } from "framer-motion";

const GRADE_COLORS = {
  "A+": "#3A9B6E",
  A: "#4A9BD5",
  B: "#4A6DB5",
  C: "#C0622A",
  D: "#E74C3C",
  F: "#94A3B8",
};

export default function HealthScoreGauge({
  score = 0,
  grade = "F",
  breakdown = {},
}) {
  const color = GRADE_COLORS[grade] || "#4A6DB5";
  const data = [{ value: score, fill: color }];

  const breakdownItems = [
    { label: "Sleep", value: breakdown.sleep ?? 0, color: "#7B68EE" },
    { label: "Activity", value: breakdown.activity ?? 0, color: "#3A9B6E" },
    { label: "Hydration", value: breakdown.hydration ?? 0, color: "#4A9BD5" },
    { label: "Vitals", value: breakdown.vitals ?? 0, color: "#E74C3C" },
    { label: "Mood", value: breakdown.mood ?? 0, color: "#C0622A" },
    {
      label: "Consistency",
      value: breakdown.consistency ?? 0,
      color: "#4A6DB5",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card p-5"
    >
      <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm mb-2">
        Today's Health Score
      </h3>

      <div className="relative" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="75%"
            innerRadius="90%"
            outerRadius="120%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: "#e2e8f0" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Score number — positioned ABOVE the arc center */}
        <div
          className="absolute inset-0 flex flex-col items-center pointer-events-none"
          style={{ justifyContent: "flex-end", paddingBottom: "28px" }}
        >
          <span
            className="font-mono text-5xl font-bold leading-none"
            style={{ color }}
          >
            {score}
          </span>
          <span
            className="px-3 py-0.5 rounded-full text-sm font-display font-bold text-white mt-2"
            style={{ backgroundColor: color }}
          >
            {grade}
          </span>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2 mt-1">
        {breakdownItems.map(({ label, value, color: c }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-ink-400 w-20 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-ink-100 dark:bg-dark-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-full rounded-full"
                style={{ backgroundColor: c }}
              />
            </div>
            <span className="text-xs font-mono text-ink-500 w-8 text-right">
              {value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
