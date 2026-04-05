const { startOfDay, endOfDay, subDays, differenceInCalendarDays } = require('date-fns');
const Goal = require('../models/Goal');
const DailyHealthRecord = require('../models/DailyHealthRecord');

const METRIC_OPERATORS = {
  sleepHours: '>=',
  stepCount: '>=',
  waterIntake: '>=',
  exerciseDuration: '>=',
  screenTime: '<=',
  heartRate: '<='
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { metric, target } = req.body;
    if (!metric || target === undefined) return res.status(400).json({ error: 'metric and target are required' });

    const operator = METRIC_OPERATORS[metric] || '>=';
    const goal = await Goal.findOneAndUpdate(
      { userId: req.userId, metric },
      { userId: req.userId, metric, target, operator, isActive: true },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkToday = async (req, res) => {
  try {
    const today = new Date();
    const todayRecord = await DailyHealthRecord.findOne({
      userId: req.userId,
      date: { $gte: startOfDay(today), $lte: endOfDay(today) }
    });

    const goals = await Goal.find({ userId: req.userId, isActive: true });
    const results = [];

    for (const goal of goals) {
      let achieved = false;
      if (todayRecord) {
        const value = todayRecord[goal.metric];
        if (value !== undefined && value !== null) {
          if (goal.operator === '>=' && value >= goal.target) achieved = true;
          if (goal.operator === '<=' && value <= goal.target) achieved = true;
        }
      }

      if (achieved) {
        const lastDate = goal.lastAchievedDate;
        const daysSinceLast = lastDate ? differenceInCalendarDays(today, lastDate) : null;
        let newStreak = goal.streak;

        if (daysSinceLast === 1) {
          newStreak = goal.streak + 1;
        } else if (daysSinceLast === 0) {
          newStreak = goal.streak; // already counted today
        } else {
          newStreak = 1; // streak broken
        }

        await Goal.findByIdAndUpdate(goal._id, {
          streak: newStreak,
          longestStreak: Math.max(newStreak, goal.longestStreak),
          totalDaysAchieved: daysSinceLast === 0 ? goal.totalDaysAchieved : goal.totalDaysAchieved + 1,
          lastAchievedDate: daysSinceLast === 0 ? lastDate : today
        });
        results.push({ goalId: goal._id, metric: goal.metric, achieved: true, streak: newStreak });
      } else {
        results.push({ goalId: goal._id, metric: goal.metric, achieved: false, streak: goal.streak });
      }
    }

    res.json({ results, checkedAt: new Date() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
