import asyncHandler from "../middleware/async.js";
import WellnessReport from "../models/WellnessReport.js";
import ErrorResponse from "../utils/errorResponse.js";
import { generateWeeklyReports, getWeeklyStats } from "../utils/cronJobs.js";
import axios from "axios";

// @desc    Get all wellness reports for the logged-in user
// @route   GET /api/v1/wellness-reports
// @access  Private
export const getWellnessReports = asyncHandler(async (req, res, next) => {
  const reports = await WellnessReport.find({ user: req.user.id }).sort({
    weekStartDate: -1,
  });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// @desc    Get a single wellness report
// @route   GET /api/v1/wellness-reports/:id
// @access  Private
export const getWellnessReport = asyncHandler(async (req, res, next) => {
  const report = await WellnessReport.findById(req.params.id);

  if (!report) {
    return next(
      new ErrorResponse(`Report not found with id of ${req.params.id}`, 404),
    );
  }

  // Make sure user is the owner of the report
  if (report.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this report`, 401));
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});

// @desc    Manually generate a wellness report for the logged-in user
// @route   POST /api/v1/wellness-reports/generate
// @access  Private
// Note: This is a simplified version for manual generation.
// The cron job is the primary method.
export const generateManualReport = asyncHandler(async (req, res, next) => {
  // This is a placeholder for a more complex manual generation logic
  // For now, we can just re-run the logic for the specific user.
  // This is computationally expensive and should be used sparingly.

  // A simplified version of the cron job's logic for a single user
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

  const today = new Date();
  const user = req.user;

  try {
    const stats = await getWeeklyStats(user._id, today);

    if (
      stats.avgMood === null &&
      stats.journalCount === 0 &&
      stats.habitCompletion === 0
    ) {
      return next(
        new ErrorResponse(
          "Not enough activity in the last 7 days to generate a report.",
          400,
        ),
      );
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
    const startOfDay = new Date(weekStartDate.setHours(0, 0, 0, 0));

    const newReport = await WellnessReport.findOneAndUpdate(
      { user: user._id, weekStartDate: startOfDay },
      {
        reportContent,
        stats,
        user: user._id,
        weekStartDate: startOfDay,
        weekEndDate: today,
        generatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(201).json({
      success: true,
      data: newReport,
    });
  } catch (error) {
    console.error(
      `Manual report generation failed for user ${user._id}:`,
      error,
    );
    return next(
      new ErrorResponse("Failed to generate the wellness report.", 500),
    );
  }
});
