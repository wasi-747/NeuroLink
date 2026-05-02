import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["💙", "🤗", "💪", "🌟", "🕊️"],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const ForumPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    anonymousAlias: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      maxlength: 100,
    },
    content: {
      type: String,
      required: [true, "Please add content"],
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Academic Pressure",
        "Exam Stress",
        "Anxiety",
        "Depression",
        "Relationship Stress",
        "Family Issues",
        "Loneliness",
        "Sleep Problems",
        "Self-Esteem",
        "General Support",
      ],
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
    reactions: [ReactionSchema],
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
ForumPostSchema.index({ category: 1, createdAt: -1 });

// Virtual property to calculate total reaction counts
ForumPostSchema.virtual("reactionCounts").get(function () {
  const counts = { "💙": 0, "🤗": 0, "💪": 0, "🌟": 0, "🕊️": 0 };
  if (this.reactions) {
    this.reactions.forEach((r) => {
      counts[r.type]++;
    });
  }
  return counts;
});

// Ensure virtuals are included when converting document to JSON
ForumPostSchema.set("toJSON", { virtuals: true });
ForumPostSchema.set("toObject", { virtuals: true });

export default mongoose.model("ForumPost", ForumPostSchema);
