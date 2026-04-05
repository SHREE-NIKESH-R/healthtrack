const axios = require("axios");

const estimateComplexity = (message) => {
  const complex = [
    "trend",
    "compare",
    "analysis",
    "why",
    "relationship",
    "pattern",
    "affect",
    "impact",
    "explain",
    "suggest",
  ];
  const simple = ["what is", "how much", "total", "today", "average"];
  const lower = message.toLowerCase();

  if (complex.some((k) => lower.includes(k))) return 800;
  if (simple.some((k) => lower.includes(k))) return 400;
  return 600;
};

const buildSystemPrompt = (dataSummary, userName) => {
  const name = userName || "there";

  return `You are Baymax 🤖, a friendly and caring AI health companion for ${name}. Think of yourself like a knowledgeable best friend who knows a lot about health — warm, encouraging, and easy to talk to.

Here is ${name}'s current health data:
${JSON.stringify(dataSummary, null, 2)}

Your personality & style rules:
- Use emojis naturally and warmly 😊
- Short paragraphs only — never a wall of text
- Use simple "- " bullet points (no nested bullets, no + signs)
- Be conversational and warm like texting a friend
- Celebrate wins enthusiastically! 🎉
- Give specific actionable tips, not vague advice
- ALWAYS use ${name}'s actual numbers from the data
- End with an encouraging line or friendly question
- Simple English only — no medical jargon
- Write complete sentences — never trail off
- Never use nested bullet points or sub-bullets
- Always complete the full list — never cut off mid-list`;
};

const buildDataSummary = (profile, last7Days, last30Days) => {
  const avg = (arr, key) => {
    const vals = arr.filter((r) => r[key] != null);
    if (!vals.length) return null;
    return (
      Math.round((vals.reduce((s, r) => s + r[key], 0) / vals.length) * 10) / 10
    );
  };

  const trend = (arr, key) => {
    const vals = arr.filter((r) => r[key] != null);
    if (vals.length < 5) return "insufficient data";

    const half = Math.floor(vals.length / 2);
    const first = vals.slice(0, half).reduce((s, r) => s + r[key], 0) / half;
    const last =
      vals.slice(half).reduce((s, r) => s + r[key], 0) / (vals.length - half);

    const change = ((last - first) / first) * 100;

    if (change > 5) return "improving";
    if (change < -5) return "declining";
    return "stable";
  };

  return {
    profile: profile
      ? {
          name: profile.name,
          age: profile.age,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
        }
      : null,
    last7DaysAverages: {
      heartRate: avg(last7Days, "heartRate"),
      sleepHours: avg(last7Days, "sleepHours"),
      stepCount: avg(last7Days, "stepCount"),
      waterIntake: avg(last7Days, "waterIntake"),
      screenTime: avg(last7Days, "screenTime"),
      exerciseDuration: avg(last7Days, "exerciseDuration"),
    },
    last30DaysTrends: {
      heartRate: trend(last30Days, "heartRate"),
      sleepHours: trend(last30Days, "sleepHours"),
      stepCount: trend(last30Days, "stepCount"),
    },
    recentMoods: last7Days.map((r) => r.moodIndicator).filter(Boolean),
  };
};

const chatWithBaymax = async (message, history = [], dataSummary, userName) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured"); // ✅ fixed message
  }

  const maxTokens = estimateComplexity(message);
  const systemPrompt = buildSystemPrompt(dataSummary, userName);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        max_tokens: maxTokens,
        temperature: 0.75,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // ✅ SAFE RESPONSE (NO OPTIONAL CHAINING)
    if (
      response &&
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message &&
      response.data.choices[0].message.content
    ) {
      return response.data.choices[0].message.content;
    }

    return "I had trouble generating a response. Please try again.";
  } catch (error) {
    // 🔥 FULL DEBUG
    if (error.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    } else {
      console.error("ERROR:", error.message);
    }

    throw new Error("AI service failed");
  }
};

module.exports = { chatWithBaymax, buildDataSummary };
