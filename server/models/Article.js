import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Anxiety",
        "Depression",
        "Sleep",
        "Relationships",
        "Academic Stress",
        "Self-Care",
        "Mindfulness",
      ],
    },
    tags: [String],
    readTime: {
      type: Number,
      required: true,
    },
    thumbnailGradient: {
      type: String,
      default: "from-blue-400 to-indigo-500", // Tailwind gradient classes
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ArticleSchema.index({ category: 1, isPublished: 1 });

export default mongoose.model("Article", ArticleSchema);
