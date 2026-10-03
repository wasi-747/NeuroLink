import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  X,
  Heart,
  MessageSquare,
  Send,
  Shield,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import {
  getPostCommentsApi,
  addPostCommentApi,
  reactCommunityPostApi,
} from "../../services/api";

export default function PostDetailModal({ visible, post, onClose, onPostUpdated }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (visible && post) {
      setIsLiked(Boolean(post.isLiked));
      setLikesCount(post.likesCount !== undefined ? post.likesCount : (post.likes || 0));
      loadComments();
    }
  }, [visible, post]);

  const loadComments = async () => {
    if (!post) return;
    const postId = post._id || post.id;
    setLoadingComments(true);
    try {
      const data = await getPostCommentsApi(postId);
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.warn("Failed to load comments:", err.message);
      // Fallback comments
      setComments([
        {
          _id: "c1",
          authorName: "Maya_Care",
          anonymousAlias: "SupportiveSoul",
          content: "Thank you for sharing this. It really resonated with my struggles this week.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: "c2",
          authorName: "Anonymous",
          anonymousAlias: "CalmRiver_42",
          content: "The 4-7-8 method really changes the game when cortisol is peaking. Proud of your progress!",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleLike = async () => {
    if (!post) return;
    const postId = post._id || post.id;
    const nextState = !isLiked;
    setIsLiked(nextState);
    const newCount = nextState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLikesCount(newCount);

    try {
      await reactCommunityPostApi(postId, "like");
      onPostUpdated && onPostUpdated(postId, nextState, newCount);
    } catch (err) {
      console.warn("Like error:", err.message);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !post) return;
    const postId = post._id || post.id;
    setIsSubmitting(true);

    try {
      const res = await addPostCommentApi(postId, commentText.trim(), isAnonymous);
      const newComment = res || {
        _id: Date.now().toString(),
        authorName: isAnonymous ? "Anonymous" : "You",
        anonymousAlias: isAnonymous ? "GentleEcho" : "You",
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      console.warn("Error adding comment:", err.message);
      // Fallback local add
      const fallbackComment = {
        _id: Date.now().toString(),
        authorName: isAnonymous ? "Anonymous" : "You",
        anonymousAlias: isAnonymous ? "GentleEcho" : "You",
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [...prev, fallbackComment]);
      setCommentText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  const authorDisplayName =
    post.authorName || post.author || (post.isAnonymous ? "Anonymous Warrior" : "Community Member");
  const authorInitial = authorDisplayName.charAt(0).toUpperCase();
  const timeDisplay =
    post.createdAt && post.createdAt.includes("T")
      ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : (post.createdAt || "Recent");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onClose} style={styles.navBtn}>
            <ChevronLeft size={22} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Discussion Thread</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Post Card */}
          <View style={styles.postCard}>
            <View style={styles.postTopRow}>
              <View style={styles.authorGroup}>
                <View
                  style={[
                    styles.avatarCircle,
                    post.isAnonymous && styles.anonAvatarCircle,
                  ]}
                >
                  {post.isAnonymous ? (
                    <Shield size={16} color="#5EEAD4" />
                  ) : (
                    <Text style={styles.avatarInitials}>{authorInitial}</Text>
                  )}
                </View>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.authorName}>{authorDisplayName}</Text>
                    {post.isAnonymous && (
                      <View style={styles.anonBadge}>
                        <Text style={styles.anonBadgeText}>Anonymous</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timeText}>{timeDisplay}</Text>
                </View>
              </View>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{post.category || "General"}</Text>
              </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Post Stats & Interactions */}
            <View style={styles.postActionRow}>
              <TouchableOpacity
                style={[styles.likeBtn, isLiked && styles.likeBtnActive]}
                onPress={handleToggleLike}
                activeOpacity={0.8}
              >
                <Heart
                  size={18}
                  color={isLiked ? "#F43F5E" : "#94A3B8"}
                  fill={isLiked ? "#F43F5E" : "transparent"}
                />
                <Text style={[styles.likeBtnText, isLiked && { color: "#F43F5E" }]}>
                  {likesCount} {likesCount === 1 ? "Like" : "Likes"}
                </Text>
              </TouchableOpacity>

              <View style={styles.commentCountBadge}>
                <MessageSquare size={16} color="#5EEAD4" />
                <Text style={styles.commentCountText}>
                  {comments.length} Comments
                </Text>
              </View>
            </View>
          </View>

          {/* Comments Section Title */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments & Replies</Text>
          </View>

          {/* Comments List */}
          {loadingComments ? (
            <ActivityIndicator color="#14B8A6" style={{ marginVertical: 20 }} />
          ) : comments.length === 0 ? (
            <View style={styles.noCommentsBox}>
              <MessageSquare size={28} color="#64748B" />
              <Text style={styles.noCommentsText}>No responses yet</Text>
              <Text style={styles.noCommentsSub}>
                Be the first to share words of comfort or insight.
              </Text>
            </View>
          ) : (
            comments.map((comment, index) => {
              const cName = comment.anonymousAlias || comment.authorName || "Peer";
              const cInitial = cName.charAt(0).toUpperCase();
              const cTime = comment.createdAt
                ? new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now";

              return (
                <View key={comment._id || index} style={styles.commentCard}>
                  <View style={styles.commentTop}>
                    <View style={styles.commentAuthorRow}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>{cInitial}</Text>
                      </View>
                      <Text style={styles.commentAuthorName}>{cName}</Text>
                    </View>
                    <Text style={styles.commentTime}>{cTime}</Text>
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Bottom Comment Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.anonToggle, isAnonymous && styles.anonToggleActive]}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.7}
          >
            <Shield size={14} color={isAnonymous ? "#5EEAD4" : "#94A3B8"} />
            <Text style={[styles.anonToggleText, isAnonymous && { color: "#5EEAD4" }]}>
              {isAnonymous ? "Anon On" : "Post as You"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Leave an encouraging reply..."
              placeholderTextColor="#64748B"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !commentText.trim() && { opacity: 0.4 },
              ]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.2)",
    marginBottom: 20,
  },
  postTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  authorGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  anonAvatarCircle: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.4)",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  anonBadge: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  anonBadgeText: {
    color: "#5EEAD4",
    fontSize: 10,
    fontWeight: "700",
  },
  timeText: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#5EEAD4",
    fontSize: 12,
    fontWeight: "700",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    color: "#CBD5E1",
    lineHeight: 22,
    marginBottom: 16,
  },
  postActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  likeBtnActive: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
  },
  likeBtnText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  commentCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentCountText: {
    color: "#5EEAD4",
    fontSize: 13,
    fontWeight: "600",
  },
  commentsHeader: {
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noCommentsBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  noCommentsText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textLight,
    marginTop: 8,
  },
  noCommentsSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  commentCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(20, 184, 166, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#5EEAD4",
    fontSize: 11,
    fontWeight: "800",
  },
  commentAuthorName: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "700",
  },
  commentTime: {
    color: "#64748B",
    fontSize: 11,
  },
  commentBody: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 19,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  anonToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 8,
  },
  anonToggleActive: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
  },
  anonToggleText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2234",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  commentInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
