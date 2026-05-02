import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  type: { type: String, enum: ["video", "article", "quiz"], required: true },
  videoUrl: { type: String }, // For video
  content: { type: String }, // For article
  isPreview: { type: Boolean, default: false },
  order: { type: Number, required: true },
});

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  lessons: [LessonSchema],
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    instructor: {
      name: { type: String, required: true },
      bio: { type: String },
    },
    thumbnailGradient: { type: String, default: "from-brand-500 to-purple-500" },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number },
    duration: { type: Number, required: true }, // total hours
    lessonCount: { type: Number, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    category: { type: String, required: true },
    rating: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    tags: [String],
    whatYouWillLearn: [String],
    modules: [ModuleSchema],
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CourseSchema.index({ category: 1, isPublished: 1 });

export default mongoose.model("Course", CourseSchema);
