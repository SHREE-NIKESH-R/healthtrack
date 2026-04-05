require("dotenv").config();
const mongoose = require("mongoose");
const { subDays, startOfDay } = require("date-fns");

const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const DailyHealthRecord = require("./models/DailyHealthRecord");
const Goal = require("./models/Goal");
const HealthScore = require("./models/HealthScore");
const { calculateHealthScore } = require("./services/healthScoreCalculator");

const jitter = (base, range) =>
  Math.round((base + (Math.random() - 0.5) * 2 * range) * 10) / 10;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const MOODS = ["great", "good", "good", "okay", "okay", "low", "poor"];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clean existing demo data
  const existing = await User.findOne({ email: "demo@healthtrack.app" });
  if (existing) {
    await DailyHealthRecord.deleteMany({ userId: existing._id });
    await Goal.deleteMany({ userId: existing._id });
    await HealthScore.deleteMany({ userId: existing._id });
    await UserProfile.deleteMany({ userId: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log("🧹 Cleaned existing demo data");
  }

  // Create user with the plain password so the model hashes it exactly once.
  const user = await User.create({
    email: "demo@healthtrack.app",
    password: "Demo1234",
  });

  // Create profile
  const profile = await UserProfile.create({
    userId: user._id,
    name: "Alex Rivera",
    age: 28,
    gender: "prefer-not-to-say",
    height: 172,
    weight: 74,
  });
  console.log("👤 Demo user created: demo@healthtrack.app / Demo1234");

  // Generate 30 days of records
  const records = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = startOfDay(subDays(now, i));
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isStressPeriod = i >= 10 && i <= 16;

    // Wavy progress: goes up, dips, goes up again
    const wave =
      Math.sin((29 - i) * (Math.PI / 10)) * 0.5 + ((29 - i) / 29) * 0.5;

    // Heart rate: starts ~90, waves between 75-90
    const baseHR = Math.round(90 - wave * 14);
    const heartRate = clamp(randInt(baseHR - 4, baseHR + 4), 58, 108);

    // Sleep: waves between 5.5 and 8.5
    let baseSleep = 6.0 + wave * 2.5;
    if (isWeekend) baseSleep += 0.8;
    if (isStressPeriod) baseSleep -= 1.0;
    const sleepHours = clamp(jitter(baseSleep, 0.4), 4.5, 9.5);

    // Steps: waves between 4000 and 13000
    let baseSteps = 5000 + wave * 8000;
    if (isWeekend) baseSteps -= 2000;
    if (isStressPeriod) baseSteps -= 1500;
    const stepCount = clamp(
      randInt(baseSteps - 1000, baseSteps + 1000),
      1500,
      15000,
    );

    // Water: waves between 1.2 and 3.0
    let baseWater = 1.5 + wave * 1.5;
    if (isStressPeriod) baseWater -= 0.4;
    const waterIntake = clamp(jitter(baseWater, 0.3), 0.8, 3.5);

    // Screen time: inversely wavy (high when stressed, low when healthy)
    let baseScreen = 9.0 - wave * 4.0;
    if (isStressPeriod) baseScreen += 1.5;
    const screenTime = clamp(jitter(baseScreen, 0.8), 2.0, 13.0);

    // Exercise: waves up with dips
    let baseExercise = 10 + wave * 50;
    if (isStressPeriod) baseExercise -= 15;
    const exerciseDuration = clamp(
      randInt(baseExercise - 8, baseExercise + 10),
      0,
      90,
    );

    // BP
    const systolic = clamp(randInt(108 - Math.round(wave * 10), 124), 95, 138);
    const diastolic = clamp(randInt(68, 84), 58, 92);
    const sugarLevel = clamp(randInt(80, 105), 70, 126);

    // Mood follows the wave
    let moodIndex;
    if (isStressPeriod) moodIndex = randInt(3, 5);
    else if (wave > 0.7) moodIndex = randInt(0, 1);
    else if (wave > 0.4) moodIndex = randInt(1, 3);
    else moodIndex = randInt(2, 4);
    const moodIndicator = MOODS[clamp(moodIndex, 0, MOODS.length - 1)];

    records.push({
      userId: user._id,
      date,
      bloodPressure: { systolic, diastolic },
      sugarLevel,
      heartRate,
      sleepHours: Math.round(sleepHours * 10) / 10,
      stepCount: Math.round(stepCount),
      waterIntake: Math.round(waterIntake * 10) / 10,
      screenTime: Math.round(screenTime * 10) / 10,
      exerciseDuration: Math.round(exerciseDuration),
      moodIndicator,
    });
  }

  await DailyHealthRecord.insertMany(records);
  console.log(`📊 ${records.length} daily health records created`);

  // Seed 6 goals
  const goalsData = [
    {
      metric: "sleepHours",
      target: 7,
      operator: ">=",
      streak: 5,
      longestStreak: 7,
      totalDaysAchieved: 18,
    },
    {
      metric: "stepCount",
      target: 10000,
      operator: ">=",
      streak: 3,
      longestStreak: 8,
      totalDaysAchieved: 12,
    },
    {
      metric: "waterIntake",
      target: 2,
      operator: ">=",
      streak: 2,
      longestStreak: 4,
      totalDaysAchieved: 10,
    },
    {
      metric: "exerciseDuration",
      target: 30,
      operator: ">=",
      streak: 1,
      longestStreak: 3,
      totalDaysAchieved: 8,
    },
    {
      metric: "screenTime",
      target: 6,
      operator: "<=",
      streak: 4,
      longestStreak: 6,
      totalDaysAchieved: 15,
    },
    {
      metric: "heartRate",
      target: 85,
      operator: "<=",
      streak: 0,
      longestStreak: 2,
      totalDaysAchieved: 5,
    },
  ];

  await Goal.insertMany(
    goalsData.map((g) => ({
      ...g,
      userId: user._id,
      isActive: true,
      lastAchievedDate: g.streak > 0 ? startOfDay(now) : null,
    })),
  );
  console.log("🎯 6 goals created with streaks");

  // Calculate and seed health scores for each record
  const goals = await Goal.find({ userId: user._id });
  const healthScores = records.map((r) => {
    const result = calculateHealthScore(r, profile, goals);
    // Slightly adjust to keep in 70-90 range for demo
    const adjustedScore = clamp(result.score + randInt(-5, 8), 65, 95);
    return {
      userId: user._id,
      date: r.date,
      score: adjustedScore,
      breakdown: result.breakdown,
      grade:
        adjustedScore >= 95
          ? "A+"
          : adjustedScore >= 85
            ? "A"
            : adjustedScore >= 70
              ? "B"
              : adjustedScore >= 55
                ? "C"
                : adjustedScore >= 40
                  ? "D"
                  : "F",
    };
  });

  await HealthScore.insertMany(healthScores);
  console.log(`🏥 ${healthScores.length} health scores calculated and saved`);

  console.log("\n✅ Seed complete!");
  console.log("   Email:    demo@healthtrack.app");
  console.log("   Password: Demo1234");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
