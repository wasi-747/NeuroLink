import mongoose from "mongoose";

const TherapistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    specializations: [
      {
        type: String,
        enum: [
          "Anxiety Therapy", "Depression Support", "Trauma & PTSD",
          "Study-Based Counseling", "Relationship Counseling", "Anger Management",
          "Grief Counseling", "Career Stress", "Sleep Disorders", 
          "Eating Disorders", "Addiction Support"
        ]
      }
    ],
    location: {
      type: String,
      required: true, // e.g. "Dhaka", "Online"
    },
    languages: [String],
    bio: {
      type: String,
      required: true,
    },
    sessionFee: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    sessionTypes: [
      {
        type: String,
        enum: ["Online", "In-person"],
      }
    ],
    services: [
      {
        type: String,
        enum: [
          "Exam Stress Counseling", "Relationship Therapy", "Time Management Coaching",
          "Mindfulness Training", "CBT Sessions", "Group Therapy",
          "Crisis Intervention", "Academic Performance Coaching"
        ]
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    photoUrl: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
TherapistSchema.index({ isVerified: 1 });

export default mongoose.model("Therapist", TherapistSchema);
