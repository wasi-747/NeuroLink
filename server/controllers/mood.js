import MoodEntry from '../models/MoodEntry.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Add a mood entry
// @route   POST /api/v1/mood
// @access  Private
export const addMoodEntry = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const moodEntry = await MoodEntry.create(req.body);
  res.status(201).json({
    success: true,
    data: moodEntry,
  });
});

// @desc    Get mood history
// @route   GET /api/v1/mood?range=30d
// @access  Private
export const getMoodHistory = asyncHandler(async (req, res, next) => {
  const range = req.query.range || '30d';
  const days = parseInt(range.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const moodHistory = await MoodEntry.find({
    user: req.user.id,
    timestamp: { $gte: startDate },
  }).sort('timestamp');

  res.status(200).json({
    success: true,
    count: moodHistory.length,
    data: moodHistory,
  });
});
