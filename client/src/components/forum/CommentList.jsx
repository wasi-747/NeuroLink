import React, { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import ReactionBar from "./ReactionBar";
import { useAuth } from "../../context/AuthContext";
import { CornerDownRight, Reply, Send, Loader2 } from "lucide-react";

const CommentItem = ({ comment, allComments, onReact, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get direct replies to this comment
  const replies = allComments.filter(c => c.parentId === comment._id);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    const success = await onReply(comment._id, replyText);
    setIsSubmitting(false);
    
    if (success) {
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
        <span className="text-slate-800 font-bold">{comment.anonymousAlias}</span>
        <span>•</span>
        <span>{formatDistanceToNow(parseISO(comment.createdAt))} ago</span>
      </div>
      
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

      <div className="mt-4 flex items-center gap-4">
        <ReactionBar reactions={comment.reactions} onReact={(type) => onReact(comment._id, type)} />
        {/* Only allow 1 level of nesting, so don't show reply button if this is already a reply */}
        {!comment.parentId && (
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mt-4"
          >
            <Reply className="w-4 h-4" /> Reply
          </button>
        )}
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-4 flex gap-3 animate-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            maxLength={500}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
          <button
            type="submit"
            disabled={isSubmitting || !replyText.trim()}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-brand-700 transition-colors flex items-center justify-center shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      )}

      {/* Render Replies */}
      {replies.length > 0 && (
        <div className="mt-4 pl-4 md:pl-8 space-y-4 border-l-2 border-slate-100">
          {replies.map(reply => (
            <div key={reply._id} className="relative">
              <CornerDownRight className="absolute -left-6 top-0 w-4 h-4 text-slate-300" />
              <CommentItem 
                comment={reply} 
                allComments={allComments} 
                onReact={onReact} 
                onReply={onReply} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CommentList = ({ comments, onReact, onReply }) => {
  // Only render top-level comments initially, they will recursively render their replies
  const topLevelComments = comments.filter(c => !c.parentId);

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
        <p className="text-slate-500 font-medium">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topLevelComments.map(comment => (
        <CommentItem 
          key={comment._id} 
          comment={comment} 
          allComments={comments} 
          onReact={onReact} 
          onReply={onReply} 
        />
      ))}
    </div>
  );
};

export default CommentList;
