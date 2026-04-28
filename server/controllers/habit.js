import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all habits for a user
// @route   GET /api/v1/habits
// @access  Private
export const getHabits = asyncHandler(async (req, res, next) => {
  const habits = await Habit.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    count: habits.length,
    data: habits,
  });
});

// @desc    Create a new habit
// @route   POST /api/v1/habits
// @access  Private
export const createHabit = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const habit = await Habit.create(req.body);
  res.status(201).json({
    success: true,
    data: habit,
  });
});

// @desc    Update a habit
// @route   PUT /api/v1/habits/:id
// @access  Private
export const updateHabit = asyncHandler(async (req, res, next) => {
  let habit = await Habit.findById(req.params.id);

  if (!habit) {
    return next(new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404));
  }

  if (habit.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this habit`, 401));
  }

  habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Delete a habit
// @route   DELETE /api/v1/habits/:id
// @access  Private
export const deleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    return next(new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404));
  }

  if (habit.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this habit`, 401));
  }

  await habit.remove();
  // Also remove associated logs
  await HabitLog.deleteMany({ habit: req.params.id });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Log a habit for a specific date
// @route   POST /api/v1/habits/:id/log
// @access  Private
export const logHabit = asyncHandler(async (req, res, next) => {
    const { date } = req.body; // Expecting date in 'YYYY-MM-DD' format
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        return next(new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404));
    }
    if (habit.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`User not authorized to log this habit`, 401));
    }

    const logDate = new Date(date);

    // Check if a log for this habit on this day already exists
    const existingLog = await HabitLog.findOne({ habit: req.params.id, completedAt: logDate });

    if (existingLog) {
        // If it exists, remove it (toggle off)
        await existingLog.remove();
        return res.status(200).json({ success: true, data: { toggled: 'off' } });
    } else {
        // If it doesn't exist, create it (toggle on)
        const newLog = await HabitLog.create({
            habit: req.params.id,
            user: req.user.id,
            completedAt: logDate
        });
        return res.status(201).json({ success: true, data: newLog });
    }
});


// @desc    Get logs for all habits within a date range
// @route   GET /api/v1/habits/logs
// @access  Private
export const getHabitLogs = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query; // Expecting 'YYYY-MM-DD'

    if (!startDate || !endDate) {
        return next(new ErrorResponse('Please provide a start and end date', 400));
    }

    const logs = await HabitLog.find({
        user: req.user.id,
        completedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).populate('habit', 'name');

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
    });
});
