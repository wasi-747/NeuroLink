import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening"],
      required: true,
    },
    sessionFormat: {
      type: String,
      enum: ["Online", "In-person"],
      required: true,
    },
    message: {
      type: String,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Declined", "Completed", "Cancelled"],
      default: "Pending",
    },
    therapistNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Booking", BookingSchema);
