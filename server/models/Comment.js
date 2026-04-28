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

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    anonymousAlias: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Please add a comment"],
      maxlength: 500,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // If null, it's a top-level comment on the post
    },
    reactions: [ReactionSchema],
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", CommentSchema);
