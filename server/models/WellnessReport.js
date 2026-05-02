import mongoose from "mongoose";

const WellnessReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  reportContent: {
    type: String,
    required: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  weekEndDate: {
    type: Date,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  stats: {
    avgMood: Number,
    moodTrend: String,
    habitCompletion: Number,
    journalCount: Number,
    avgSentiment: Number,
    stressScore: Number,
    gratitudeStreak: Number,
  },
});

// Ensure a user only has one report per week start date
WellnessReportSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

export default mongoose.model("WellnessReport", WellnessReportSchema);
