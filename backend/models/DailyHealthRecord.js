const mongoose = require('mongoose');

const dailyHealthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  bloodPressure: {
    systolic: { type: Number, min: 60, max: 250 },
    diastolic: { type: Number, min: 40, max: 150 }
  },
  sugarLevel: { type: Number, min: 40, max: 600 },   // mg/dL
  heartRate: { type: Number, min: 30, max: 220 },     // bpm
  sleepHours: { type: Number, min: 0, max: 24 },      // decimal
  stepCount: { type: Number, min: 0, max: 100000 },   // integer
  waterIntake: { type: Number, min: 0, max: 20 },     // liters
  screenTime: { type: Number, min: 0, max: 24 },      // hours
  exerciseDuration: { type: Number, min: 0, max: 720 }, // minutes
  moodIndicator: {
    type: String,
    enum: ['great', 'good', 'okay', 'low', 'poor']
  },
  notes: { type: String, maxlength: 1000 }
}, { timestamps: true });

dailyHealthRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyHealthRecord', dailyHealthRecordSchema);
