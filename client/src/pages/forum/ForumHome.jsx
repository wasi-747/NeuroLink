import React, { useState, useEffect, useCallback } from "react";
import { getPosts, createPost, reactToPost, reportPost } from "../../api/forum";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PostCard from "../../components/forum/PostCard";
import CreatePostForm from "../../components/forum/CreatePostForm";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Users, Filter, Ghost } from "lucide-react";

const CATEGORIES = [
  "All", "Academic Pressure", "Exam Stress", "Anxiety", "Depression",
  "Relationship Stress", "Family Issues", "Loneliness", "Sleep Problems",
  "Self-Esteem", "General Support"
];

const ForumHome = () => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("All");
  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPosts = async (reset = false, currentCursor = cursor) => {
    try {
      const res = await getPosts(currentCursor, category);
      const newPosts = res.data.data;
      
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      
      if (res.data.pagination.nextCursor) {
        setCursor(res.data.pagination.nextCursor);
        setHasNextPage(true);
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      toast.error("Failed to load forum posts.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    setIsInitialLoading(true);
    setCursor("");
    setHasNextPage(true);
    fetchPosts(true, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isInitialLoading) {
      await fetchPosts(false);
    }
  }, [hasNextPage, isInitialLoading, cursor, category]);

  const [observerRef, isFetchingMore] = useInfiniteScroll(loadMore, { threshold: 0.1 });

  const handleCreatePost = async (data) => {
    try {
      const res = await createPost(data);
      toast.success("Post created successfully!");
      // Prepend to top if category matches or is All
      if (category === "All" || category === data.category) {
        setPosts(prev => [res.data.data, ...prev]);
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create post");
      return false;
    }
  };

  const handleReact = async (postId, type) => {
    try {
      // Optimistic update omitted for simplicity, but we replace the post in state
      const res = await reactToPost(postId, type);
      setPosts(prev => prev.map(p => p._id === postId ? res.data.data : p));
    } catch (err) {
      toast.error("Failed to add reaction");
    }
  };

  const handleReport = async (postId) => {
    if (!window.confirm("Are you sure you want to report this post?")) return;
    try {
      await reportPost(postId, "Inappropriate Content");
      toast.success("Post reported to moderators.");
      // If the post hit the threshold, backend sets isHidden=true, so we can just remove it from UI
      setPosts(prev => prev.filter(p => p._id !== postId)); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to report post");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-8 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-64 h-64" />
        </div>
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Anonymous Community
          </h1>
          <p className="text-brand-100 text-lg md:text-xl font-medium leading-relaxed mb-8">
            A safe, judgment-free space to share your experiences, ask for advice, and support fellow students. Your real identity is never revealed.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-6 h-6" /> Start a Conversation
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed */}
        <div className="flex-1 order-2 lg:order-1 min-w-0">
          {/* Mobile Filter Toggle (Optional/Future Enhancement) */}
          <div className="lg:hidden flex items-center gap-2 mb-4 p-4 bg-white rounded-2xl border border-slate-100 font-bold text-slate-700">
            <Filter className="w-5 h-5 text-brand-500" /> Current Topic: {category}
          </div>

          <div className="space-y-4">
            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
                <p className="text-slate-500 font-medium">Loading community voices...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <Ghost className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">It's quiet in here</h3>
                <p className="text-slate-500 mb-6">There are no posts in this category yet. Be the first to start the discussion!</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-brand-100 text-brand-700 hover:bg-brand-200 font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Write a Post
                </button>
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <div key={post._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PostCard post={post} onReact={handleReact} onReport={handleReport} />
                  </div>
                ))}
                
                {/* Infinite Scroll trigger area */}
                <div ref={observerRef} className="h-20 flex items-center justify-center pt-8 pb-4">
                  {isFetchingMore && <Loader2 className="w-6 h-6 animate-spin text-slate-400" />}
                  {!hasNextPage && posts.length > 0 && (
                    <span className="text-sm font-semibold text-slate-400">You've reached the end of the line.</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-500" /> Topics
            </h3>
            <div className="flex flex-row lg:flex-col flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left px-4 py-2.5 rounded-xl font-semibold transition-all text-sm md:text-base ${
                    category === cat
                      ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                      : "bg-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <CreatePostForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreatePost} 
      />
    </div>
  );
};

export default ForumHome;
