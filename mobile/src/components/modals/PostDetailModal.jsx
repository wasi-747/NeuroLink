import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Shield,
  MessageCircle,
  Heart,
  Send,
  X,
  ChevronLeft,
  Clock,
  Tag,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

// ─── Seed Comments ────────────────────────────────────────────────────────────
const SEED_COMMENTS = [
  {
    _id: "c1",
    content: "Thank you for sharing this. I've been struggling with the same thing and it helps to know I'm not alone.",
    isAnonymous: true,
    alias: "Anonymous Wanderer",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: "c2",
    content: "The 4-7-8 technique genuinely works. I started using it before exams and it reduces my heart rate noticeably.",
    isAnonymous: false,
    alias: "CalmMind_22",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: "c3",
    content: "Have you tried combining this with a short walk? The combination is incredible for stress relief.",
    isAnonymous: false,
    alias: "WellnessSeeker",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function formatRelativeTime(iso) {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getCategoryColor(category) {
  const map = {
    "Academic Pressure": "#6366F1",
    "Exam Stress": "#F59E0B",
    "Anxiety": "#F43F5E",
    "Depression": "#60A5FA",
    "Relationship Stress": "#EC4899",
    "Family Issues": "#A78BFA",
    "Loneliness": "#14B8A6",
    "Sleep Problems": "#8B5CF6",
    "Self-Esteem": "#10B981",
    "General Support": "#64748B",
  };
  return map[category] || "#6366F1";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostDetailModal({ visible, post, onClose }) {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const heartAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible && post) {
      setLikes(post.likes ?? 0);
      setIsLiked(post.isLiked ?? false);
      fetchComments();
    }
  }, [visible, post]);

  useEffect(() => {
    if (!visible) {
      setComments([]);
      setCommentText("");
      setIsAnonymous(true);
    }
  }, [visible]);

  const fetchComments = async () => {
    if (!post?._id && !post?.id) {
      setComments(SEED_COMMENTS);
      return;
    }
    setIsLoadingComments(true);
    const postId = post._id || post.id;
    try {
      const res = await api.get(`/forum/posts/${postId}/comments`);
      setComments(res.data?.data || SEED_COMMENTS);
    } catch (_) {
      setComments(SEED_COMMENTS);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = () => {
    // Optimistic update (recommended default)
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));

    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    // Sync in background
    const postId = post?._id || post?.id;
    if (postId) {
      api.post(`/forum/posts/${postId}/like`).catch(() => {
        // If fails, revert
        setIsLiked(!newLiked);
        setLikes((prev) => (!newLiked ? prev + 1 : prev - 1));
      });
    }
  };

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text) return;

    setIsSendingComment(true);
    const postId = post?._id || post?.id;
    const optimisticComment = {
      _id: Date.now().toString(),
      content: text,
      isAnonymous,
      alias: isAnonymous ? "Anonymous" : "You",
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, optimisticComment]);
    setCommentText("");

    try {
      if (postId) {
        await api.post(`/forum/posts/${postId}/comments`, { content: text, isAnonymous });
      }
    } catch (_) {
      // Keep optimistic comment — offline fallback
    } finally {
      setIsSendingComment(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  if (!post) return null;

  const categoryColor = getCategoryColor(post.category);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <ChevronLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Scrollable content */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Post Content Card */}
            <View style={styles.postCard}>
              {/* Author Row */}
              <View style={styles.authorRow}>
                <LinearGradient
                  colors={post.isAnonymous ? ["#1E293B", "#334155"] : ["#1E1B4B", "#4338CA"]}
                  style={styles.authorAvatar}
                >
                  {post.isAnonymous ? (
                    <Shield size={18} color="#94A3B8" />
                  ) : (
                    <Text style={styles.authorAvatarInitial}>
                      {(post.author || "U")[0].toUpperCase()}
                    </Text>
                  )}
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{post.author || "Community Member"}</Text>
                    {post.isAnonymous && (
                      <View style={styles.anonBadge}>
                        <Shield size={10} color="#94A3B8" />
                        <Text style={styles.anonBadgeText}>Anonymous</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.authorMeta}>
                    <Clock size={11} color={colors.textMuted} />
                    <Text style={styles.authorTime}>
                      {post.createdAt ? formatRelativeTime(post.createdAt) : "recently"}
                    </Text>
                  </View>
                </View>
                {/* Category */}
                <View style={[styles.categoryTag, { backgroundColor: categoryColor + "22", borderColor: categoryColor + "55" }]}>
                  <Tag size={10} color={categoryColor} />
                  <Text style={[styles.categoryText, { color: categoryColor }]}>
                    {post.category}
                  </Text>
                </View>
              </View>

              {/* Post Body */}
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody}>{post.content}</Text>

              {/* Like Row */}
              <View style={styles.likeRow}>
                <TouchableOpacity onPress={handleLike} style={styles.likeBtn} activeOpacity={0.8}>
                  <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                    <Heart
                      size={20}
                      color={isLiked ? "#F43F5E" : colors.textMuted}
                      fill={isLiked ? "#F43F5E" : "transparent"}
                    />
                  </Animated.View>
                  <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                    {likes}
                  </Text>
                </TouchableOpacity>
                <View style={styles.commentCountRow}>
                  <MessageCircle size={16} color={colors.textMuted} />
                  <Text style={styles.commentCountText}>{comments.length} comments</Text>
                </View>
              </View>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsSectionTitle}>Discussion</Text>

              {isLoadingComments ? (
                <ActivityIndicator size="small" color={colors.brand} style={{ marginVertical: 16 }} />
              ) : comments.length === 0 ? (
                <View style={styles.noCommentsState}>
                  <MessageCircle size={28} color={colors.textMuted} />
                  <Text style={styles.noCommentsText}>Be the first to comment and support this person.</Text>
                </View>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment._id} comment={comment} />
                ))
              )}
            </View>
          </ScrollView>

          {/* ── Comment Input Bar ── */}
          <View style={styles.inputBar}>
            <View style={styles.anonToggleRow}>
              <Shield size={13} color={isAnonymous ? "#6366F1" : colors.textMuted} />
              <Text style={[styles.anonToggleLabel, isAnonymous && { color: "#818CF8" }]}>
                Anonymous Comment
              </Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: "#334155", true: "rgba(99,102,241,0.4)" }}
                thumbColor={isAnonymous ? "#6366F1" : "#64748B"}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a supportive comment…"
                placeholderTextColor={colors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, commentText.trim().length > 0 && styles.sendBtnActive]}
                onPress={handleSendComment}
                activeOpacity={0.85}
                disabled={isSendingComment || commentText.trim().length === 0}
              >
                {isSendingComment ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Send size={17} color={commentText.trim().length > 0 ? "#FFFFFF" : colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────
function CommentItem({ comment }) {
  return (
    <View style={styles.commentItem}>
      <LinearGradient
        colors={comment.isAnonymous ? ["#1E293B", "#334155"] : ["#1E1B4B", "#4338CA"]}
        style={styles.commentAvatar}
      >
        {comment.isAnonymous ? (
          <Shield size={13} color="#94A3B8" />
        ) : (
          <Text style={styles.commentAvatarText}>
            {(comment.alias || "U")[0].toUpperCase()}
          </Text>
        )}
      </LinearGradient>
      <View style={styles.commentBody}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.commentAlias}>{comment.alias || "User"}</Text>
          {comment.isAnonymous && (
            <View style={styles.commentAnonTag}>
              <Shield size={9} color="#64748B" />
              <Text style={styles.commentAnonTagText}>Anon</Text>
            </View>
          )}
          <Text style={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0B1320",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "92%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  // Scroll
  scrollContent: { padding: 16, paddingBottom: 20, gap: 16 },

  // Post Card
  postCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },

  // Author
  authorRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  authorAvatar: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  authorAvatarInitial: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  authorNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  authorName: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  anonBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(148,163,184,0.1)",
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  anonBadgeText: { color: "#94A3B8", fontSize: 10, fontWeight: "600" },
  authorMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  authorTime: { color: colors.textMuted, fontSize: 11 },
  categoryTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: "flex-start",
  },
  categoryText: { fontSize: 10, fontWeight: "700" },

  // Post
  postTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", lineHeight: 24 },
  postBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },

  // Like
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeCount: { color: colors.textMuted, fontSize: 14, fontWeight: "700" },
  likeCountActive: { color: "#F43F5E" },
  commentCountRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  commentCountText: { color: colors.textMuted, fontSize: 13 },

  // Comments Section
  commentsSection: { gap: 10 },
  commentsSectionTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  noCommentsState: { alignItems: "center", paddingVertical: 24, gap: 8 },
  noCommentsText: { color: colors.textMuted, fontSize: 13, textAlign: "center" },

  // Comment Item
  commentItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  commentAvatar: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  commentAvatarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  commentBody: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 5,
  },
  commentHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  commentAlias: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  commentAnonTag: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(100,116,139,0.15)",
    borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1,
  },
  commentAnonTagText: { color: "#64748B", fontSize: 9, fontWeight: "600" },
  commentTime: { color: colors.textMuted, fontSize: 10, marginLeft: "auto" },
  commentContent: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  // Input Bar
  inputBar: {
    backgroundColor: "#0F1A2C",
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  anonToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  anonToggleLabel: { flex: 1, color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  commentInput: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  sendBtnActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
});
