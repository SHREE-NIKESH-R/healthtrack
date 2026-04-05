const calculateSleepScore = (sleepHours) => {
  if (sleepHours === undefined || sleepHours === null) return 0;
  if (sleepHours >= 7 && sleepHours <= 9) return 100;
  if (sleepHours >= 6) return 80;
  if (sleepHours >= 5) return 60;
  return 40;
};

const calculateActivityScore = (stepCount, exerciseDuration) => {
  let stepsScore = 0;

  if (stepCount !== undefined && stepCount !== null) {
    if (stepCount >= 10000) stepsScore = 100;
    else if (stepCount >= 7500) stepsScore = 80;
    else if (stepCount >= 5000) stepsScore = 60;
    else stepsScore = Math.round((stepCount / 5000) * 60);
  }

  let exerciseScore = 0;
  if (exerciseDuration !== undefined && exerciseDuration !== null) {
    if (exerciseDuration >= 30) exerciseScore = 100;
    else if (exerciseDuration >= 20) exerciseScore = 70;
    else if (exerciseDuration >= 10) exerciseScore = 50;
    else exerciseScore = Math.round((exerciseDuration / 10) * 50);
  }

  const count =
    (stepCount !== undefined && stepCount !== null ? 1 : 0) +
    (exerciseDuration !== undefined && exerciseDuration !== null ? 1 : 0);

  if (count === 0) return 0;

  return Math.round((stepsScore + exerciseScore) / count);
};

const calculateHydrationScore = (waterIntake, recommendedIntake = 2.4) => {
  if (waterIntake === undefined || waterIntake === null) return 0;

  const ratio = waterIntake / recommendedIntake;

  if (ratio >= 0.9 && ratio <= 1.2) return 100;
  if (ratio >= 0.7) return 75;
  if (ratio >= 0.5) return 50;
  return 30;
};

const calculateVitalsScore = (heartRate, bloodPressure, sugarLevel) => {
  const scores = [];

  if (heartRate !== undefined && heartRate !== null) {
    if (heartRate >= 60 && heartRate <= 100) scores.push(100);
    else if (heartRate >= 50 && heartRate <= 110) scores.push(70);
    else scores.push(50);
  }

  if (
    bloodPressure &&
    bloodPressure.systolic !== undefined &&
    bloodPressure.diastolic !== undefined
  ) {
    const { systolic, diastolic } = bloodPressure;

    if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80)
      scores.push(100);
    else scores.push(70);
  }

  if (sugarLevel !== undefined && sugarLevel !== null) {
    if (sugarLevel >= 70 && sugarLevel <= 100) scores.push(100);
    else if (sugarLevel >= 60 && sugarLevel <= 126) scores.push(70);
    else scores.push(50);
  }

  if (scores.length === 0) return 0;

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const calculateConsistencyScore = (goalsMetToday, totalActiveGoals) => {
  if (!totalActiveGoals) return 100;
  return Math.round((goalsMetToday / totalActiveGoals) * 100);
};

const calculateMoodScore = (moodIndicator) => {
  const scores = { great: 100, good: 80, okay: 60, low: 40, poor: 20 };
  return scores[moodIndicator] !== undefined ? scores[moodIndicator] : null;
};

const getGrade = (score) => {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
};

const calculateHealthScore = (record, profile, goals = []) => {
  let recommendedWater = 2.4;

  if (profile && profile.weight) {
    recommendedWater = Math.round(profile.weight * 0.033 * 10) / 10;
  }

  const sleepScore = calculateSleepScore(record.sleepHours);
  const activityScore = calculateActivityScore(
    record.stepCount,
    record.exerciseDuration,
  );
  const hydrationScore = calculateHydrationScore(
    record.waterIntake,
    recommendedWater,
  );
  const vitalsScore = calculateVitalsScore(
    record.heartRate,
    record.bloodPressure,
    record.sugarLevel,
  );
  const moodScore = calculateMoodScore(record.moodIndicator);

  let goalsMetToday = 0;
  const activeGoals = goals.filter((g) => g.isActive);

  for (const goal of activeGoals) {
    const value = record[goal.metric];

    if (value !== undefined && value !== null) {
      if (goal.operator === ">=" && value >= goal.target) goalsMetToday++;
      if (goal.operator === "<=" && value <= goal.target) goalsMetToday++;
    }
  }

  const consistencyScore = calculateConsistencyScore(
    goalsMetToday,
    activeGoals.length,
  );

  let weightedScore;

  if (moodScore !== null) {
    weightedScore = Math.round(
      sleepScore * 0.25 +
        activityScore * 0.25 +
        hydrationScore * 0.15 +
        vitalsScore * 0.15 +
        moodScore * 0.1 +
        consistencyScore * 0.1,
    );
  } else {
    weightedScore = Math.round(
      sleepScore * 0.25 +
        activityScore * 0.25 +
        hydrationScore * 0.15 +
        vitalsScore * 0.2 +
        consistencyScore * 0.15,
    );
  }

  return {
    score: weightedScore,
    breakdown: {
      sleep: sleepScore,
      activity: activityScore,
      hydration: hydrationScore,
      vitals: vitalsScore,
      mood: moodScore !== null ? moodScore : 0,
      consistency: consistencyScore,
    },
    grade: getGrade(weightedScore),
  };
};

module.exports = { calculateHealthScore, getGrade };
