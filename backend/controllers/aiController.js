const { subDays, startOfDay } = require("date-fns");
const DailyHealthRecord = require("../models/DailyHealthRecord");
const UserProfile = require("../models/UserProfile");
const { chatWithBaymax, buildDataSummary } = require("../services/aiService");

exports.getStatus = async (req, res) => {
  res.json({ configured: !!process.env.GROQ_API_KEY });
};

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // ✅ FIX 1: remove optional chaining
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const profile = await UserProfile.findOne({ userId: req.userId });
    const now = new Date();

    const last7Days = await DailyHealthRecord.find({
      userId: req.userId,
      date: { $gte: startOfDay(subDays(now, 6)) },
    }).sort({ date: 1 });

    const last30Days = await DailyHealthRecord.find({
      userId: req.userId,
      date: { $gte: startOfDay(subDays(now, 29)) },
    }).sort({ date: 1 });

    const dataSummary = buildDataSummary(profile, last7Days, last30Days);

    // ✅ FIX 2: safe userName extraction
    let userName = null;
    if (profile && profile.name) {
      userName = profile.name.split(" ")[0];
    }

    const reply = await chatWithBaymax(message, history, dataSummary, userName);

    res.json({ reply });
  } catch (err) {
    // ✅ FIX 3: safe error logging
    if (err && err.response && err.response.data) {
      console.error("Baymax error full:", err.response.data);
    } else {
      console.error("Baymax error full:", err.message);
    }

    // ✅ FIX 4: API key error handling
    if (err.message === "OpenRouter API key not configured") {
      return res.status(503).json({
        error:
          "Baymax AI is not configured. Please add your OpenRouter API key.",
      });
    }

    // ✅ FIX 5: safe error response
    let errorMessage = "Something went wrong";

    if (
      err &&
      err.response &&
      err.response.data &&
      err.response.data.error &&
      err.response.data.error.message
    ) {
      errorMessage = err.response.data.error.message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    res.status(500).json({ error: errorMessage });
  }
};
