import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Send, Shield, Sparkles, CheckCircle2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { createCommunityPostApi } from "../../services/api";

const CATEGORIES = [
  "General Support",
  "Anxiety",
  "Exam Stress",
  "Depression",
  "Sleep Problems",
  "Relationship Stress",
  "Self-Esteem",
];

export default function CreatePostModal({ visible, onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const postPayload = {
      title: title.trim(),
      content: content.trim(),
      category: category,
      isAnonymous: Boolean(isAnonymous),
      tags: [category.toLowerCase()],
    };

    try {
      const created = await createCommunityPostApi(postPayload);
      setSuccess(true);
      if (onPostCreated) {
        onPostCreated(created || {
          _id: Date.now().toString(),
          authorName: isAnonymous ? "Anonymous Warrior" : "You",
          ...postPayload,
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("createCommunityPostApi fallback:", err.message);
      setSuccess(true);
      if (onPostCreated) {
        onPostCreated({
          _id: Date.now().toString(),
          authorName: isAnonymous ? "Anonymous Warrior" : "You",
          ...postPayload,
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
        });
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setContent("");
        setIsAnonymous(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Share with Community</Text>
              <Text style={styles.modalSubtitle}>
                A supportive, compassionate space for everyone
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Category Select */}
            <Text style={styles.fieldLabel}>Select Topic</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPills}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Post Title */}
            <Text style={styles.fieldLabel}>Title / Subject</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="e.g., What helped me conquer morning panic..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Post Content */}
            <Text style={styles.fieldLabel}>Your Story or Question</Text>
            <TextInput
              style={styles.inputContent}
              placeholder="Share what is on your mind, what techniques worked for you, or ask for peer guidance..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
            />

            {/* Anonymous Toggle */}
            <View style={styles.anonToggleRow}>
              <View style={styles.anonInfo}>
                <View style={styles.anonTitleRow}>
                  <Shield size={16} color="#5EEAD4" />
                  <Text style={styles.anonLabel}>Post Anonymously</Text>
                </View>
                <Text style={styles.anonDesc}>
                  Hide your name and avatar to protect your privacy
                </Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: "#334155", true: "#14B8A6" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting || success || !title.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                success
                  ? ["#059669", "#10B981"]
                  : ["#0D9488", "#14B8A6"]
              }
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : success ? (
                <View style={styles.rowAlign}>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Post Published!</Text>
                </View>
              ) : (
                <View style={styles.rowAlign}>
                  <Send size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Publish to Community</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 6,
  },
  categoryPills: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  categoryChipActive: {
    backgroundColor: "rgba(20, 184, 166, 0.2)",
    borderColor: "#14B8A6",
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#5EEAD4",
    fontWeight: "700",
  },
  inputTitle: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  inputContent: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    textAlignVertical: "top",
    minHeight: 110,
    marginBottom: 16,
  },
  anonToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 10,
  },
  anonInfo: {
    flex: 1,
    paddingRight: 10,
  },
  anonTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  anonLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  anonDesc: {
    color: colors.textMuted,
    fontSize: 11,
  },
  submitBtn: {
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
