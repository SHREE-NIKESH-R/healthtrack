import { motion } from "framer-motion";
import {
  format,
  subDays,
  startOfDay,
  eachDayOfInterval,
  startOfWeek,
  addDays,
} from "date-fns";
import { useState } from "react";

const scoreColor = (score) => {
  if (score === null || score === undefined)
    return { bg: "bg-ink-100 dark:bg-dark-card", label: "No data" };
  if (score >= 90) return { bg: "bg-activity", label: "Excellent" };
  if (score >= 80) return { bg: "bg-hydration", label: "Good" };
  if (score >= 70) return { bg: "bg-primary", label: "Fair" };
  if (score >= 60) return { bg: "bg-screen", label: "Low" };
  return { bg: "bg-heart", label: "Poor" };
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKS = 26; // 6 months

export default function WeeklyHeatmap({ scores = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const today = startOfDay(new Date());
  // Start from the Sunday ~26 weeks ago
  const startSunday = startOfWeek(subDays(today, WEEKS * 7));

  const scoreMap = {};
  scores.forEach((s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd");
    scoreMap[key] = s;
  });

  // Build columns (each column = 1 week, 7 days)
  const columns = [];
  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(startSunday, w * 7 + d);
      if (day > today) {
        week.push(null);
        continue;
      }
      const key = format(day, "yyyy-MM-dd");
      week.push({ day, key, score: scoreMap[key] });
    }
    columns.push(week);
  }

  // Month labels
  const monthLabels = [];
  columns.forEach((week, wi) => {
    const firstDay = week.find((d) => d);
    if (firstDay && firstDay.day.getDate() <= 7) {
      monthLabels.push({ wi, label: format(firstDay.day, "MMM") });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100 text-sm">
            Activity Heatmap
          </h3>
          <p className="text-xs text-ink-400 mt-0.5">
            Last 6 months · colored by health score
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-400">Low</span>
          {[
            "bg-heart",
            "bg-screen",
            "bg-primary",
            "bg-hydration",
            "bg-activity",
          ].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c} opacity-80`} />
          ))}
          <span className="text-xs text-ink-400">High</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div style={{ minWidth: `${WEEKS * 14}px` }}>
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {columns.map((_, wi) => {
              const label = monthLabels.find((m) => m.wi === wi);
              return (
                <div
                  key={wi}
                  className="flex-1 text-xs text-ink-300"
                  style={{ minWidth: 12 }}
                >
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 shrink-0">
              {DAY_LABELS.map((d, i) => (
                <div key={d} className="h-3 flex items-center">
                  <span className="text-xs text-ink-300 w-7">
                    {i % 2 === 1 ? d : ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid */}
            {columns.map((week, wi) => (
              <div
                key={wi}
                className="flex flex-col gap-0.5 flex-1"
                style={{ minWidth: 12 }}
              >
                {week.map((cell, di) => {
                  if (!cell) return <div key={di} className="h-3 rounded-sm" />;
                  const { bg, label } = scoreColor(cell.score?.score);
                  const isToday = cell.key === format(today, "yyyy-MM-dd");
                  return (
                    <div
                      key={di}
                      onMouseEnter={() => setTooltip({ ...cell, label })}
                      onMouseLeave={() => setTooltip(null)}
                      className={`h-3 rounded-sm ${bg} opacity-75 hover:opacity-100 transition-all duration-150 cursor-pointer
                        ${isToday ? "ring-1 ring-primary ring-offset-1" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-ink-100 dark:bg-dark-card text-xs flex items-center gap-3">
          <span className="text-ink-500">
            {format(tooltip.day, "EEE, MMM d yyyy")}
          </span>
          {tooltip.score ? (
            <>
              <span className="font-mono font-semibold text-ink-800 dark:text-ink-200">
                Score: {tooltip.score.score}
              </span>
              <span className="font-semibold text-primary">
                {tooltip.score.grade}
              </span>
              <span className="text-ink-400">{tooltip.label}</span>
            </>
          ) : (
            <span className="text-ink-400">No data logged</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
