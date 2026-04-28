import GratitudeEntry from '../models/GratitudeEntry.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Add a gratitude entry
// @route   POST /api/v1/gratitude
// @access  Private
export const addGratitudeEntry = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length !== 3) {
    return next(new ErrorResponse('Please provide exactly 3 gratitude items', 400));
  }

  // Check if entry for today already exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let existingEntry = await GratitudeEntry.findOne({
    user: req.user.id,
    date: { $gte: today }
  });

  if (existingEntry) {
    return next(new ErrorResponse('You have already logged gratitude for today', 400));
  }

  const gratitudeEntry = await GratitudeEntry.create({
    user: req.user.id,
    items,
    date: new Date()
  });

  res.status(201).json({
    success: true,
    data: gratitudeEntry,
  });
});

// @desc    Get all gratitude entries
// @route   GET /api/v1/gratitude
// @access  Private
export const getGratitudeEntries = asyncHandler(async (req, res, next) => {
  const entries = await GratitudeEntry.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

// @desc    Delete a gratitude entry
// @route   DELETE /api/v1/gratitude/:id
// @access  Private
export const deleteGratitudeEntry = asyncHandler(async (req, res, next) => {
  const entry = await GratitudeEntry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`Gratitude entry not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is owner
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this entry`, 401));
  }

  await entry.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
