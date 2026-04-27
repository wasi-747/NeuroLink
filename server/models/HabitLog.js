import mongoose from 'mongoose';

const HabitLogSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.ObjectId,
    ref: 'Habit',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
});

// Ensure a user can only log a habit once per day
HabitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export default mongoose.model('HabitLog', HabitLogSchema);
