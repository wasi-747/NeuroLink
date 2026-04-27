import mongoose from 'mongoose';

const MoodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a mood level from 1 to 5'],
  },
  note: {
    type: String,
    maxlength: [300, 'Note cannot be more than 300 characters'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('MoodEntry', MoodEntrySchema);
