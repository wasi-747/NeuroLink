import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Ref can be either ForumPost or Comment depending on contentType
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    action: {
      type: String,
      enum: ["none", "removed", "warned"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Report", ReportSchema);
