import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  content: {
    type: String, // This will be encrypted
    required: [true, 'Please add content'],
  },
}, { timestamps: true });

export default mongoose.model('JournalEntry', JournalEntrySchema);
