const { subDays, startOfDay, endOfDay } = require('date-fns');
const HealthScore = require('../models/HealthScore');
const Goal = require('../models/Goal');
const DailyHealthRecord = require('../models/DailyHealthRecord');
const UserProfile = require('../models/UserProfile');
const { calculateHealthScore } = require('../services/healthScoreCalculator');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const [todayScore, goals, totalDays] = await Promise.all([
      HealthScore.findOne({
        userId: req.userId,
        date: { $gte: startOfDay(today), $lte: endOfDay(today) }
      }),
      Goal.find({ userId: req.userId, isActive: true }),
      DailyHealthRecord.countDocuments({ userId: req.userId })
    ]);

    const activeStreaks = goals.map(g => ({
      metric: g.metric,
      streak: g.streak,
      longestStreak: g.longestStreak,
      target: g.target,
      operator: g.operator
    }));

    const bestStreak = goals.reduce((max, g) => Math.max(max, g.streak), 0);

    res.json({
      todayScore,
      activeStreaks,
      bestStreak,
      totalDaysLogged: totalDays,
      goalsCount: goals.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getScoreHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const scores = await HealthScore.find({
      userId: req.userId,
      date: { $gte: startOfDay(subDays(new Date(), days - 1)) }
    }).sort({ date: 1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.calculateToday = async (req, res) => {
  try {
    const today = new Date();
    const [record, profile, goals] = await Promise.all([
      DailyHealthRecord.findOne({
        userId: req.userId,
        date: { $gte: startOfDay(today), $lte: endOfDay(today) }
      }),
      UserProfile.findOne({ userId: req.userId }),
      Goal.find({ userId: req.userId, isActive: true })
    ]);

    if (!record) return res.status(404).json({ error: 'No health record for today' });

    const result = calculateHealthScore(record, profile, goals);
    const healthScore = await HealthScore.findOneAndUpdate(
      { userId: req.userId, date: startOfDay(today) },
      { userId: req.userId, date: startOfDay(today), ...result },
      { new: true, upsert: true }
    );

    res.json(healthScore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
