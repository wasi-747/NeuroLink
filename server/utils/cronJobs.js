import cron from "node-cron";
import mongoose from "mongoose";
import User from "../models/User.js";
import MoodEntry from "../models/MoodEntry.js";
import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";
import JournalEntry from "../models/JournalEntry.js";
import GratitudeEntry from "../models/GratitudeEntry.js";
import StressQuizResult from "../models/StressQuizResult.js";
import WellnessReport from "../models/WellnessReport.js";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export const getWeeklyStats = async (userId, endDate) => {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  // Mood
  const moodEntries = await MoodEntry.find({
    user: userId,
    timestamp: { $gte: startDate, $lte: endDate },
  }).sort("timestamp");
  const avgMood =
    moodEntries.length > 0
      ? moodEntries.reduce((acc, entry) => acc + entry.rating, 0) /
        moodEntries.length
      : null;
  let moodTrend = "stable";
  if (moodEntries.length > 1) {
    const firstHalfAvg =
      moodEntries
        .slice(0, Math.floor(moodEntries.length / 2))
        .reduce((acc, entry) => acc + entry.rating, 0) /
      Math.floor(moodEntries.length / 2);
    const secondHalfAvg =
      moodEntries
        .slice(Math.floor(moodEntries.length / 2))
        .reduce((acc, entry) => acc + entry.rating, 0) /
      Math.ceil(moodEntries.length / 2);
    if (secondHalfAvg > firstHalfAvg) moodTrend = "improving";
    if (secondHalfAvg < firstHalfAvg) moodTrend = "declining";
  }

  // Habits
  const userHabits = await Habit.find({ user: userId });
  const habitLogs = await HabitLog.find({
    habit: { $in: userHabits.map((h) => h._id) },
    date: { $gte: startDate, $lte: endDate },
  });
  const totalPossibleLogs = userHabits.length * 7;
  const habitCompletion =
    totalPossibleLogs > 0
      ? (habitLogs.filter((log) => log.completed).length / totalPossibleLogs) *
        100
      : 0;

  // Journal
  const journalEntries = await JournalEntry.find({
    user: userId,
    createdAt: { $gte: startDate, $lte: endDate },
  });
  const journalCount = journalEntries.length;
  const avgSentiment =
    journalCount > 0
      ? journalEntries.reduce(
          (acc, entry) => acc + (entry.sentimentScore || 0),
          0,
        ) / journalCount
      : null;

  // Stress
  const stressResult = await StressQuizResult.findOne({
    user: userId,
    completedAt: { $gte: startDate, $lte: endDate },
  }).sort("-completedAt");

  // Gratitude
  const gratitudeEntries = await GratitudeEntry.find({ user: userId }).sort(
    "-date",
  );
  let gratitudeStreak = 0;
  if (gratitudeEntries.length > 0) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let streak = 0;
    const entryDates = new Set(
      gratitudeEntries.map((e) => new Date(e.date).setHours(0, 0, 0, 0)),
    );

    if (entryDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (entryDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    gratitudeStreak = streak;
  }

  return {
    avgMood: avgMood ? parseFloat(avgMood.toFixed(1)) : null,
    moodTrend,
    habitCompletion: parseFloat(habitCompletion.toFixed(1)),
    journalCount,
    avgSentiment: avgSentiment ? parseFloat(avgSentiment.toFixed(2)) : null,
    stressScore: stressResult ? stressResult.score : null,
    gratitudeStreak,
  };
};

export const generateWeeklyReports = async () => {
  console.log("Running weekly wellness report generation job...");
  const users = await User.find({ role: "user" }); // Assuming you only want reports for 'user' role
  const today = new Date();

  for (const user of users) {
    try {
      const stats = await getWeeklyStats(user._id, today);

      // Don't generate a report if there's no activity
      if (
        stats.avgMood === null &&
        stats.journalCount === 0 &&
        stats.habitCompletion === 0
      ) {
        console.log(`Skipping report for user ${user._id} due to no activity.`);
        continue;
      }

      const response = await axios.post(
        `${ML_SERVICE_URL}/api/ml/analyze/weekly-report`,
        {
          user_stats: stats,
        },
      );

      const reportContent = response.data.report;

      const weekStartDate = new Date(today);
      weekStartDate.setDate(weekStartDate.getDate() - 7);

      // Use updateOne with upsert to avoid duplicates
      await WellnessReport.updateOne(
        { user: user._id, weekStartDate: weekStartDate.setHours(0, 0, 0, 0) },
        {
          $set: {
            reportContent,
            stats,
            user: user._id,
            weekStartDate: weekStartDate.setHours(0, 0, 0, 0),
            weekEndDate: today,
            generatedAt: new Date(),
          },
        },
        { upsert: true },
      );

      console.log(
        `Successfully generated and saved report for user ${user._id}`,
      );
    } catch (error) {
      console.error(
        `Failed to generate report for user ${user._id}:`,
        error.response ? error.response.data : error.message,
      );
    }
  }
  console.log("Weekly wellness report generation job finished.");
};

export const initCronJobs = () => {
  // Schedule to run every Sunday at 2 AM
  cron.schedule("0 2 * * 0", generateWeeklyReports, {
    scheduled: true,
    timezone: "America/New_York",
  });

  console.log("Weekly report cron job initialized.");
};
