import mongoose from "mongoose";

const JournalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    content: {
      type: String, // This will be encrypted
      required: [true, "Please add content"],
    },
    sentimentLabel: {
      type: String,
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "CRISIS", "UNKNOWN"],
      default: "UNKNOWN",
    },
    sentimentScore: {
      type: Number,
    },
    emotions: {
      type: Object,
    },
  },
  { timestamps: true },
);

export default mongoose.model("JournalEntry", JournalEntrySchema);
