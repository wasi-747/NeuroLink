import JournalEntry from '../models/JournalEntry.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Create a journal entry
// @route   POST /api/v1/journal
// @access  Private
export const addJournalEntry = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const { title, content, category } = req.body;

  if (!title || !content) {
    return next(new ErrorResponse('Please provide a title and content', 400));
  }

  const journalEntry = await JournalEntry.create({
    user: req.user.id,
    title,
    content,
    category,
  });

  res.status(201).json({
    success: true,
    data: journalEntry,
  });
});

// @desc    Get all journal entries
// @route   GET /api/v1/journal
// @access  Private
export const getJournalEntries = asyncHandler(async (req, res, next) => {
  const entries = await JournalEntry.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

// @desc    Get a single journal entry
// @route   GET /api/v1/journal/:id
// @access  Private
export const getJournalEntry = asyncHandler(async (req, res, next) => {
  const entry = await JournalEntry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`Journal entry not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is owner
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this entry`, 401));
  }

  res.status(200).json({
    success: true,
    data: entry,
  });
});

// @desc    Update a journal entry
// @route   PUT /api/v1/journal/:id
// @access  Private
export const updateJournalEntry = asyncHandler(async (req, res, next) => {
  let entry = await JournalEntry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`Journal entry not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is owner
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this entry`, 401));
  }

  entry = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: entry,
  });
});

// @desc    Delete a journal entry
// @route   DELETE /api/v1/journal/:id
// @access  Private
export const deleteJournalEntry = asyncHandler(async (req, res, next) => {
  const entry = await JournalEntry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`Journal entry not found with id of ${req.params.id}`, 404));
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
