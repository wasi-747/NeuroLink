import mongoose from 'mongoose';

const GratitudeEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [String],
    validate: [v => v.length === 3, 'Must provide exactly 3 gratitude items'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

// Ensure a user can only have one gratitude entry per day
GratitudeEntrySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('GratitudeEntry', GratitudeEntrySchema);
