import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPost, reactToPost, reportPost, getComments, addComment, reactToComment } from "../../api/forum";
import PostCard from "../../components/forum/PostCard";
import CommentList from "../../components/forum/CommentList";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft, Send } from "lucide-react";

const ForumPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        getPost(id),
        getComments(id)
      ]);
      setPost(postRes.data.data);
      setComments(commentsRes.data.data);
    } catch (err) {
      toast.error("Failed to load post. It may have been removed.");
      navigate("/community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePostReact = async (postId, type) => {
    try {
      const res = await reactToPost(postId, type);
      setPost(res.data.data);
    } catch (err) {
      toast.error("Failed to add reaction");
    }
  };

  const handlePostReport = async (postId) => {
    if (!window.confirm("Are you sure you want to report this post?")) return;
    try {
      await reportPost(postId, "Inappropriate Content");
      toast.success("Post reported to moderators.");
      navigate("/community");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to report post");
    }
  };

  const handleCommentReact = async (commentId, type) => {
    try {
      const res = await reactToComment(commentId, type);
      setComments(prev => prev.map(c => c._id === commentId ? res.data.data : c));
    } catch (err) {
      toast.error("Failed to add reaction to comment");
    }
  };

  const handleAddComment = async (e, parentId = null, content = newComment) => {
    if (e) e.preventDefault();
    if (!content.trim()) return false;
    
    setIsSubmitting(true);
    try {
      const res = await addComment(id, { content, parentId });
      toast.success("Comment posted!");
      setComments([...comments, res.data.data]);
      if (!parentId) setNewComment("");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to post comment");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <Link to="/community" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 font-semibold mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Community
      </Link>

      {/* Main Post */}
      <div className="mb-10">
        <PostCard 
          post={post} 
          onReact={handlePostReact} 
          onReport={handlePostReport} 
          isDetailView={true} 
        />
      </div>

      <hr className="border-slate-200 mb-10" />

      {/* Comments Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          Discussion <span className="text-brand-500 bg-brand-50 px-3 py-1 rounded-full text-base">{comments.length}</span>
        </h3>

        {/* Top-Level Comment Input */}
        <form onSubmit={(e) => handleAddComment(e)} className="mb-10 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <span className="text-slate-400 font-bold">You</span>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the conversation..."
              rows={3}
              maxLength={500}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-3">
              <span className={`text-xs font-semibold ${newComment.length > 450 ? "text-red-500" : "text-slate-400"}`}>
                {newComment.length} / 500
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Reply
              </button>
            </div>
          </div>
        </form>

        <CommentList 
          comments={comments} 
          onReact={handleCommentReact} 
          onReply={(parentId, content) => handleAddComment(null, parentId, content)} 
        />
      </div>

    </div>
  );
};

export default ForumPostDetail;
