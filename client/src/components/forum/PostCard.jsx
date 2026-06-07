import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import ReactionBar from "./ReactionBar";
import { MessageCircle, Flag, ShieldAlert } from "lucide-react";

const getCategoryColor = (category) => {
  const colors = {
    "Academic Pressure": "bg-sky/10 text-sky-600 border-sky/20",
    "Exam Stress": "bg-coral/10 text-coral border-coral/20",
    Anxiety: "bg-brand-light text-brand border-brand/20",
    Depression: "bg-purple-50 text-purple-600 border-purple-100",
    "Relationship Stress": "bg-pink/10 text-pink border-pink/20",
    "Family Issues": "bg-golden/10 text-golden border-golden/20",
    Loneliness: "bg-sky/10 text-sky-600 border-sky/20",
    "Sleep Problems": "bg-brand-light text-brand border-brand/20",
    "Self-Esteem": "bg-mint/10 text-emerald-600 border-mint/20",
    "General Support": "bg-mint/10 text-emerald-600 border-mint/20",
  };
  return colors[category] || "bg-cream-dark text-ink border-cream-dark/50";
};

const PostCard = ({ post, onReact, onReport, isDetailView = false }) => {
  const handleReact = (type) => {
    if (onReact) onReact(post._id, type);
  };

  const handleReport = (e) => {
    e.preventDefault();
    if (onReport) onReport(post._id);
  };

  const CardWrapper = isDetailView ? "div" : Link;

  return (
    <CardWrapper
      to={isDetailView ? undefined : `/community/post/${post._id}`}
      className={`block card-lift overflow-hidden ${
        isDetailView ? "" : "group"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 rounded-2xl text-xs font-bold uppercase tracking-wider border-2 ${getCategoryColor(post.category)}`}
            >
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted font-medium">
              <span className="text-ink font-semibold">
                🐇 {post.anonymousAlias}
              </span>
              <span>•</span>
              <span>{formatDistanceToNow(parseISO(post.createdAt))} ago</span>
            </div>
          </div>
          <button
            onClick={handleReport}
            title="Report Post"
            className="text-coral/40 hover:text-coral p-1.5 rounded-lg hover:bg-coral/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            style={{ opacity: isDetailView ? 1 : undefined }}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h2
          className={`font-extrabold text-ink mb-3 ${isDetailView ? "text-2xl" : "text-xl group-hover:text-brand transition-colors"}`}
        >
          {post.title}
        </h2>
        <p
          className={`text-muted leading-relaxed ${isDetailView ? "text-base whitespace-pre-wrap" : "text-sm line-clamp-3"}`}
        >
          {post.content}
        </p>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-cream-dark pt-4">
          <ReactionBar reactions={post.reactions} onReact={handleReact} />

          <div className="flex items-center gap-2 text-muted font-medium text-sm bg-cream-dark/30 px-3 py-1.5 rounded-full">
            <MessageCircle className="w-4 h-4" />
            <span>
              {post.commentCount}{" "}
              {post.commentCount === 1 ? "Reply" : "Replies"}
            </span>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default PostCard;
