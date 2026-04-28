import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["therapist", "course"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Ref can be either Therapist or Course depending on targetType
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      // Nullable for courses, but required for therapists
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating after save/remove
ReviewSchema.statics.getAverageRating = async function (targetId, targetType) {
  const obj = await this.aggregate([
    {
      $match: { targetId, targetType },
    },
    {
      $group: {
        _id: "$targetId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (targetType === "therapist") {
      await this.model("Therapist").findByIdAndUpdate(targetId, {
        rating: obj[0]?.averageRating ? (Math.round(obj[0].averageRating * 10) / 10) : 0,
        reviewCount: obj[0]?.reviewCount || 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.targetId, this.targetType);
});

// Call getAverageRating before remove
ReviewSchema.pre("deleteOne", { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.targetId, this.targetType);
});

export default mongoose.model("Review", ReviewSchema);
