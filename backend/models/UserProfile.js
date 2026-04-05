const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { type: String, required: true, trim: true },
  age: { type: Number, min: 1, max: 120 },
  gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
  height: { type: Number, min: 50, max: 300 }, // cm
  weight: { type: Number, min: 10, max: 500 }  // kg
}, { timestamps: true });

userProfileSchema.virtual('bmi').get(function() {
  if (!this.height || !this.weight) return null;
  const heightM = this.height / 100;
  return Math.round((this.weight / (heightM * heightM)) * 10) / 10;
});

userProfileSchema.virtual('bmiCategory').get(function() {
  const bmi = this.bmi;
  if (!bmi) return null;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
});

userProfileSchema.virtual('recommendedWaterIntake').get(function() {
  if (!this.weight) return 2.0;
  return Math.round(this.weight * 0.033 * 10) / 10;
});

userProfileSchema.set('toJSON', { virtuals: true });
userProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
