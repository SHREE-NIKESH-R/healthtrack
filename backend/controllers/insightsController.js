const { subDays, startOfDay } = require("date-fns");
const DailyHealthRecord = require("../models/DailyHealthRecord");

const avg = (arr, key) => {
  const vals = arr.filter((r) => r[key] !== null && r[key] !== undefined);
  if (!vals.length) return null;
  return (
    Math.round((vals.reduce((s, r) => s + r[key], 0) / vals.length) * 10) / 10
  );
};

const trendPercent = (recent, older) => {
  if (!older || older === 0) return null;
  return Math.round(((recent - older) / older) * 100);
};

exports.getInsights = async (req, res) => {
  try {
    const now = new Date();
    const last7 = await DailyHealthRecord.find({
      userId: req.userId,
      date: { $gte: startOfDay(subDays(now, 6)) },
    }).sort({ date: 1 });

    const prev7 = await DailyHealthRecord.find({
      userId: req.userId,
      date: {
        $gte: startOfDay(subDays(now, 13)),
        $lt: startOfDay(subDays(now, 6)),
      },
    }).sort({ date: 1 });

    const insights = [];

    // Sleep insight
    const avgSleep = avg(last7, "sleepHours");
    const prevSleep = avg(prev7, "sleepHours");
    if (avgSleep !== null) {
      const change = prevSleep ? trendPercent(avgSleep, prevSleep) : null;
      let emoji = "💤",
        title,
        description;
      if (avgSleep >= 7) {
        title = "Sleep is on track";
        description = `You're averaging ${avgSleep} hrs/night this week — keep it up!`;
        emoji = "💤";
      } else {
        title = "Sleep needs attention";
        description = `Averaging only ${avgSleep} hrs/night. Aim for 7-9 hours for optimal health.`;
        emoji = "😴";
      }
      if (change !== null) {
        description += ` ${Math.abs(change)}% ${change >= 0 ? "better" : "worse"} than last week.`;
      }
      insights.push({
        emoji,
        title,
        description,
        metric: "sleep",
        value: avgSleep,
        trend: change,
      });
    }

    // Steps insight
    const avgSteps = avg(last7, "stepCount");
    const prevSteps = avg(prev7, "stepCount");
    if (avgSteps !== null) {
      const change = prevSteps ? trendPercent(avgSteps, prevSteps) : null;
      const emoji = avgSteps >= 8000 ? "🚶" : "👣";
      const title =
        avgSteps >= 10000
          ? "Great activity level!"
          : avgSteps >= 7000
            ? "Steps trending well"
            : "Steps need a boost";
      const description = `Averaging ${Math.round(avgSteps).toLocaleString()} steps/day.${avgSteps < 10000 ? " Try to hit 10,000 daily." : " Excellent work!"}${change !== null ? ` ${Math.abs(change)}% ${change >= 0 ? "up" : "down"} vs last week.` : ""}`;
      insights.push({
        emoji,
        title,
        description,
        metric: "steps",
        value: avgSteps,
        trend: change,
      });
    }

    // Hydration insight
    const avgWater = avg(last7, "waterIntake");
    if (avgWater !== null) {
      const emoji = avgWater >= 2 ? "💧" : "🥤";
      const title =
        avgWater >= 2.5
          ? "Great hydration!"
          : avgWater >= 2
            ? "Hydration looks good"
            : "Hydration needs attention";
      const description = `Drinking ${avgWater}L/day on average.${avgWater < 2 ? " Try to reach at least 2L daily." : ""}`;
      insights.push({
        emoji,
        title,
        description,
        metric: "water",
        value: avgWater,
        trend: null,
      });
    }

    // Heart rate insight
    const avgHR = avg(last7, "heartRate");
    const prevHR = avg(prev7, "heartRate");
    if (avgHR !== null) {
      const change = prevHR ? trendPercent(avgHR, prevHR) : null;
      const emoji = avgHR >= 60 && avgHR <= 80 ? "❤️" : "💓";
      const title =
        avgHR >= 60 && avgHR <= 100
          ? "Heart rate is healthy"
          : "Heart rate out of range";
      const description = `Average resting HR: ${avgHR} bpm.${avgHR > 100 ? " High resting HR — consider more cardio." : avgHR < 60 ? " Low HR — could indicate good fitness or needs check." : " Normal range!"}`;
      insights.push({
        emoji,
        title,
        description,
        metric: "heartRate",
        value: avgHR,
        trend: change,
      });
    }

    // Screen time insight
    const avgScreen = avg(last7, "screenTime");
    if (avgScreen !== null) {
      const emoji = avgScreen <= 4 ? "📵" : avgScreen <= 6 ? "📱" : "⚠️";
      const title =
        avgScreen <= 4
          ? "Screen time well-managed"
          : avgScreen <= 6
            ? "Screen time is moderate"
            : "High screen time alert";
      const description = `Averaging ${avgScreen} hrs/day of screen time.${avgScreen > 6 ? " Try to reduce by taking regular breaks." : " Good digital wellness habits!"}`;
      insights.push({
        emoji,
        title,
        description,
        metric: "screenTime",
        value: avgScreen,
        trend: null,
      });
    }

    // Mood insight
    const recentMoods = last7.map((r) => r.moodIndicator).filter(Boolean);
    if (recentMoods.length > 0) {
      const moodScores = { great: 5, good: 4, okay: 3, low: 2, poor: 1 };
      const avgMoodScore =
        recentMoods.reduce((s, m) => s + (moodScores[m] || 3), 0) /
        recentMoods.length;
      const emoji = avgMoodScore >= 4 ? "😄" : avgMoodScore >= 3 ? "😐" : "😟";
      const title =
        avgMoodScore >= 4
          ? "Great mood this week!"
          : avgMoodScore >= 3
            ? "Mood is moderate"
            : "Mood needs attention";
      const description = `Your average mood this week is ${avgMoodScore >= 4 ? "positive" : avgMoodScore >= 3 ? "neutral" : "low"}. ${avgMoodScore < 3 ? "Try getting more sleep and exercise — both are proven mood boosters." : "Keep up whatever you're doing!"}`;
      insights.push({
        emoji,
        title,
        description,
        metric: "mood",
        value: null,
        trend: null,
      });
    }

    res.json({ insights: insights.slice(0, 5), generatedAt: new Date() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
