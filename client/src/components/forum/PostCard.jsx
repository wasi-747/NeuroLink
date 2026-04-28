import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import ReactionBar from "./ReactionBar";
import { MessageCircle, Flag, ShieldAlert } from "lucide-react";

const getCategoryColor = (category) => {
  const colors = {
    "Academic Pressure": "bg-blue-100 text-blue-800 border-blue-200",
    "Exam Stress": "bg-red-100 text-red-800 border-red-200",
    "Anxiety": "bg-amber-100 text-amber-800 border-amber-200",
    "Depression": "bg-slate-200 text-slate-800 border-slate-300",
    "Relationship Stress": "bg-pink-100 text-pink-800 border-pink-200",
    "Family Issues": "bg-orange-100 text-orange-800 border-orange-200",
    "Loneliness": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Sleep Problems": "bg-purple-100 text-purple-800 border-purple-200",
    "Self-Esteem": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "General Support": "bg-teal-100 text-teal-800 border-teal-200",
  };
  return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
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
      className={`block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${
        isDetailView ? "" : "hover:border-brand-200 hover:shadow-md transition-all group"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="text-slate-800 font-semibold">{post.anonymousAlias}</span>
              <span>•</span>
              <span>{formatDistanceToNow(parseISO(post.createdAt))} ago</span>
            </div>
          </div>
          <button 
            onClick={handleReport}
            title="Report Post"
            className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            style={{ opacity: isDetailView ? 1 : undefined }}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h2 className={`font-extrabold text-slate-900 mb-3 ${isDetailView ? "text-2xl" : "text-xl group-hover:text-brand-600 transition-colors"}`}>
          {post.title}
        </h2>
        <p className={`text-slate-600 leading-relaxed ${isDetailView ? "text-base whitespace-pre-wrap" : "text-sm line-clamp-3"}`}>
          {post.content}
        </p>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
          <ReactionBar reactions={post.reactions} onReact={handleReact} />
          
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm bg-slate-50 px-3 py-1.5 rounded-full">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount} {post.commentCount === 1 ? 'Reply' : 'Replies'}</span>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default PostCard;
