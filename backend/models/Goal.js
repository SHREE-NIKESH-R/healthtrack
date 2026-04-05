const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  metric: {
    type: String,
    enum: ['sleepHours', 'stepCount', 'waterIntake', 'exerciseDuration', 'screenTime', 'heartRate'],
    required: true
  },
  target: { type: Number, required: true },
  operator: { type: String, enum: ['>=', '<='], required: true },
  isActive: { type: Boolean, default: true },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalDaysAchieved: { type: Number, default: 0 },
  lastAchievedDate: { type: Date, default: null }
}, { timestamps: true });

goalSchema.index({ userId: 1, metric: 1 }, { unique: true });

module.exports = mongoose.model('Goal', goalSchema);
