import mongoose from 'mongoose';

const StressQuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('StressQuizResult', StressQuizResultSchema);
