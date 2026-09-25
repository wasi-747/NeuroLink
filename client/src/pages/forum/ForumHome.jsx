import React, { useState, useEffect, useCallback } from "react";
import { getPosts, createPost, reactToPost, reportPost } from "../../api/forum";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import PostCard from "../../components/forum/PostCard";
import CreatePostForm from "../../components/forum/CreatePostForm";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Plus,
  Users,
  Filter,
  Ghost,
  ShieldCheck,
  Heart,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import CrisisModal from "../../components/common/CrisisModal";

// Aligned with mobile CommunityScreen.jsx
const CATEGORIES = [
  "All",
  "Academic Pressure",
  "Exam Stress",
  "Anxiety",
  "Depression",
  "Relationship Stress",
  "Family Issues",
  "Loneliness",
  "Sleep Problems",
  "Self-Esteem",
  "General Support",
];

const ForumHome = () => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("All");
  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  const fetchPosts = async (reset = false, currentCursor = cursor) => {
    try {
      const res = await getPosts(currentCursor, category);
      const newPosts = res.data.data;

      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));

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

  const [observerRef, isFetchingMore] = useInfiniteScroll(loadMore, {
    threshold: 0.1,
  });

  const handleCreatePost = async (data) => {
    try {
      const res = await createPost(data);
      toast.success("Post shared with community!");
      if (category === "All" || category === data.category) {
        setPosts((prev) => [res.data.data, ...prev]);
      }
      if (res.data.sentiment?.crisis_detected) {
        setIsCrisisModalOpen(true);
      }
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create post");
      return { success: false };
    }
  };

  const handleReact = async (postId, type) => {
    try {
      const res = await reactToPost(postId, type);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.data : p)),
      );
    } catch (err) {
      toast.error("Failed to add reaction");
    }
  };

  const handleReport = async (postId) => {
    if (!window.confirm("Are you sure you want to report this post?")) return;
    try {
      await reportPost(postId, "Inappropriate Content");
      toast.success("Post reported to moderators.");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to report post");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <CrisisModal
        isOpen={isCrisisModalOpen}
        setIsOpen={setIsCrisisModalOpen}
      />

      {/* Hero Banner (Mobile Community Parity) */}
      <div className="card-lift p-6 md:p-10 bg-linear-to-br from-[#0f766e] via-[#134e4a] to-[#042f2e] text-white relative overflow-hidden shadow-lg border-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-teal-400/20 text-teal-300 rounded-full inline-flex items-center gap-1.5 border border-teal-400/30">
                <Users className="w-3.5 h-3.5 text-teal-300" />
                SAFE SPACE & PEER SUPPORT
              </span>
              <span className="text-xs font-bold text-teal-200/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Anonymous
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              NeuroLink Community 🫂
            </h1>
            <p className="text-teal-100/80 font-medium text-sm md:text-base mt-1 leading-relaxed">
              Share student life experiences, vent exam stress, or seek comfort in a judgment-free, moderated peer support network.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-coral text-white font-extrabold text-sm hover:scale-105 active:scale-95 transition-all duration-150 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Share Your Story
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-150 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-sm scale-105"
                  : "bg-white border-2 border-cream-dark text-muted hover:text-ink hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Content Feed & Info Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Feed */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          {isInitialLoading ? (
            <div className="card-lift p-16 flex flex-col items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
              <p className="text-muted font-bold text-sm">
                Loading community voices...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card-lift p-12 text-center bg-white">
              <Ghost className="w-14 h-14 text-muted/60 mx-auto mb-3" />
              <h3 className="text-lg font-black text-ink mb-1">
                It's quiet in "{category}"
              </h3>
              <p className="text-xs text-muted mb-6 max-w-sm mx-auto">
                No one has posted under this topic yet. Be the first brave voice to start the conversation!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary text-xs py-2.5 px-5 cursor-pointer"
              >
                Write First Post
              </button>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <PostCard
                    post={post}
                    onReact={handleReact}
                    onReport={handleReport}
                  />
                </div>
              ))}

              {/* Infinite Scroll trigger */}
              <div
                ref={observerRef}
                className="h-16 flex items-center justify-center pt-6 pb-2"
              >
                {isFetchingMore && (
                  <Loader2 className="w-6 h-6 animate-spin text-brand" />
                )}
                {!hasNextPage && posts.length > 0 && (
                  <span className="text-xs font-bold text-muted bg-cream px-3 py-1 rounded-full">
                    🌱 You've caught up with all posts in this topic
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Community Guidelines & Safety Card */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="card-lift p-6 bg-white border-2 border-cream-dark">
            <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Community Safe Rules
            </h3>
            <ul className="space-y-2.5 text-xs text-muted font-medium">
              <li className="flex items-start gap-2">
                <span className="text-brand font-bold">•</span>
                <span><strong>Always Anonymous:</strong> Your real student identity is completely hidden.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand font-bold">•</span>
                <span><strong>Zero Judgment:</strong> Be kind and supportive to fellow peers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand font-bold">•</span>
                <span><strong>Crisis Protection:</strong> Posts mentioning self-harm are instantly routed to emergency counseling.</span>
              </li>
            </ul>
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

