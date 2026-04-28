import React from "react";
import { useAuth } from "../../context/AuthContext";

const REACTIONS = [
  { emoji: "💙", label: "I understand" },
  { emoji: "🤗", label: "You're not alone" },
  { emoji: "💪", label: "Stay strong" },
  { emoji: "🌟", label: "You've got this" },
  { emoji: "🕊️", label: "Sending peace" },
];

const ReactionBar = ({ reactions = [], onReact, disabled = false }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  // Compute reaction counts
  const reactionCounts = REACTIONS.reduce((acc, curr) => {
    acc[curr.emoji] = 0;
    return acc;
  }, {});

  let userReaction = null;

  reactions.forEach((r) => {
    if (reactionCounts[r.type] !== undefined) {
      reactionCounts[r.type]++;
    }
    if (r.userId === currentUserId || r.userId?._id === currentUserId) {
      userReaction = r.type;
    }
  });

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {REACTIONS.map(({ emoji, label }) => {
        const count = reactionCounts[emoji];
        const hasReacted = userReaction === emoji;
        // Don't show zero-count reactions unless it's hovered or we just want them always visible
        // Usually, modern forums show a subset. We'll show all but fade them if 0.
        
        return (
          <button
            key={emoji}
            onClick={(e) => {
              e.preventDefault();
              onReact(emoji);
            }}
            disabled={disabled}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              hasReacted
                ? "bg-brand-100 text-brand-800 ring-1 ring-brand-300"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-100"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
