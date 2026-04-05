const mongoose = require("mongoose");

const healthScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    score: { type: Number, min: 0, max: 100 },
    breakdown: {
      sleep: { type: Number, min: 0, max: 100 },
      activity: { type: Number, min: 0, max: 100 },
      hydration: { type: Number, min: 0, max: 100 },
      vitals: { type: Number, min: 0, max: 100 },
      mood: { type: Number, min: 0, max: 100 },
      consistency: { type: Number, min: 0, max: 100 },
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B", "C", "D", "F"],
    },
  },
  { timestamps: true },
);

healthScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HealthScore", healthScoreSchema);
