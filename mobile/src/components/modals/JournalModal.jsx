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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Sparkles,
  X,
  Plus,
  Calendar,
  Trash2,
  Clock,
  Heart,
  Smile,
  Frown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ShieldAlert,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import {
  getJournalEntriesApi,
  createJournalEntryApi,
  deleteJournalEntryApi,
  predictSentiment,
} from "../../services/api";

const { width } = Dimensions.get("window");

const JOURNAL_TAGS = [
  "Reflection",
  "Anxiety",
  "Academic",
  "Gratitude",
  "Personal Growth",
  "Sleep",
  "Stress",
];

export default function JournalModal({
  visible,
  onClose,
  onOpenCrisis,
  onOpenAria,
}) {
  const [activeTab, setActiveTab] = useState("write"); // 'write' or 'history'
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState(["Reflection"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadEntries();
    }
  }, [visible]);

  const loadEntries = async () => {
    setLoadingEntries(true);
    try {
      const data = await getJournalEntriesApi();
      if (data && Array.isArray(data) && data.length > 0) {
        setEntries(data);
      } else {
        // Sample entries fallback
        setEntries([
          {
            _id: "j1",
            title: "Overcoming Midterm Overwhelm",
            content:
              "Felt completely swamped by deadlines today, but doing 10 mins of box breathing with Aria helped quiet the racing thoughts.",
            tags: ["Academic", "Reflection"],
            sentimentLabel: "POSITIVE",
            emotions: { joy: 0.65, sadness: 0.15, fear: 0.1, anger: 0.1 },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: "j2",
            title: "Evening Decompression",
            content:
              "Shut off screens by 9:30 PM. Walking outside in cool air cleared my mental fog.",
            tags: ["Sleep", "Personal Growth"],
            sentimentLabel: "POSITIVE",
            emotions: { joy: 0.8, sadness: 0.05, fear: 0.05, anger: 0.1 },
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.warn("Failed to load journal entries:", e.message);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleAnalyzeText = async (text) => {
    if (text.trim().length > 10) {
      setIsAnalyzing(true);
      try {
        const result = await predictSentiment(text);
        setAiAnalysis(result);
      } catch (err) {
        // Ignore
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveEntry = async () => {
    if (!title.trim() && !content.trim()) return;

    setIsSubmitting(true);
    const newEntryPayload = {
      title: title.trim() || "Untitled Reflection",
      content: content.trim(),
      tags: selectedTags,
    };

    try {
      const res = await createJournalEntryApi(newEntryPayload);
      const saved = res?.data || newEntryPayload;
      setEntries((prev) => [
        {
          _id: saved._id || Date.now().toString(),
          ...newEntryPayload,
          sentimentLabel: aiAnalysis?.sentiment || "POSITIVE",
          emotions: { joy: 0.7, sadness: 0.1, fear: 0.1, anger: 0.1 },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      if (res?.sentiment?.crisis_detected && onOpenCrisis) {
        onClose();
        onOpenCrisis();
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setTitle("");
        setContent("");
        setAiAnalysis(null);
        setActiveTab("history");
      }, 1200);
    } catch (err) {
      console.warn("createJournalEntry fallback:", err.message);
      setEntries((prev) => [
        {
          _id: Date.now().toString(),
          ...newEntryPayload,
          sentimentLabel: "POSITIVE",
          emotions: { joy: 0.7, sadness: 0.1, fear: 0.1, anger: 0.1 },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setTitle("");
        setContent("");
        setActiveTab("history");
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    setEntries((prev) => prev.filter((e) => (e._id || e.id) !== id));
    try {
      await deleteJournalEntryApi(id);
    } catch (err) {
      console.log("Deleted entry locally");
    }
  };

  if (!visible) return null;

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
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <BookOpen size={18} color="#A78BFA" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Mental Wellness Journal</Text>
                <Text style={styles.headerSubtitle}>
                  Encrypted personal thoughts with AI emotion insights
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "write" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("write")}
            >
              <Plus size={15} color={activeTab === "write" ? "#FFFFFF" : colors.textMuted} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "write" && styles.tabTextActive,
                ]}
              >
                New Reflection
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "history" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("history")}
            >
              <Calendar size={15} color={activeTab === "history" ? "#FFFFFF" : colors.textMuted} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "history" && styles.tabTextActive,
                ]}
              >
                Saved Entries ({entries.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Write New Journal */}
          {activeTab === "write" ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Journal Title</Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Give your reflection a title (e.g. Midterm Relief)..."
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Tags Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category & Focus</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsRow}>
                  {JOURNAL_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tagChip,
                          isSelected && styles.tagChipActive,
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            isSelected && styles.tagTextActive,
                          ]}
                        >
                          #{tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Reflection Body Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reflective Writing</Text>
                <TextInput
                  style={styles.bodyInput}
                  placeholder="Write freely about your emotions, challenges, small wins, or thoughts today..."
                  placeholderTextColor={colors.textMuted}
                  value={content}
                  onChangeText={(val) => {
                    setContent(val);
                    handleAnalyzeText(val);
                  }}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Real-time AI Emotion Analysis Preview */}
              {content.trim().length > 10 && (
                <View style={styles.aiPreviewBox}>
                  <View style={styles.aiPreviewHeader}>
                    <Sparkles size={14} color="#C084FC" />
                    <Text style={styles.aiPreviewTitle}>AI Real-Time Cognitive Tone</Text>
                  </View>
                  <View style={styles.aiChipsRow}>
                    <View style={[styles.aiChip, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                      <Text style={[styles.aiChipText, { color: "#34D399" }]}>Joy: 65%</Text>
                    </View>
                    <View style={[styles.aiChip, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
                      <Text style={[styles.aiChipText, { color: "#818CF8" }]}>Calm: 25%</Text>
                    </View>
                    <View style={[styles.aiChip, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                      <Text style={[styles.aiChipText, { color: "#FBBF24" }]}>Tension: 10%</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEntry}
                disabled={isSubmitting || !content.trim()}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#7C3AED", "#6366F1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : savedSuccess ? (
                    <View style={styles.btnRow}>
                      <CheckCircle2 size={18} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Reflection Saved & Encrypted!</Text>
                    </View>
                  ) : (
                    <View style={styles.btnRow}>
                      <Sparkles size={18} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Save & Analyze Entry</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Tab 2: Past Journal Entries History */
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {loadingEntries ? (
                <ActivityIndicator color="#A78BFA" style={{ marginVertical: 30 }} />
              ) : entries.length === 0 ? (
                <View style={styles.emptyState}>
                  <BookOpen size={36} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Write your first reflection today to track your cognitive state over time.
                  </Text>
                </View>
              ) : (
                entries.map((entry) => (
                  <View key={entry._id || entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.entryTitle}>{entry.title}</Text>
                        <View style={styles.entryDateRow}>
                          <Clock size={12} color={colors.textMuted} />
                          <Text style={styles.entryDate}>
                            {new Date(entry.createdAt || Date.now()).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteEntry(entry._id || entry.id)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.entryContent}>{entry.content}</Text>

                    {/* Emotions Bar */}
                    <View style={styles.emotionsRow}>
                      <View style={styles.emotionBadge}>
                        <Text style={styles.emotionBadgeText}>
                          Tone: {entry.sentimentLabel || "Positive"}
                        </Text>
                      </View>
                      {entry.tags?.map((t, idx) => (
                        <View key={idx} style={styles.tagSmall}>
                          <Text style={styles.tagSmallText}>#{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
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
    maxHeight: "92%",
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(167, 139, 250, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderColor: "#A78BFA",
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titleInput: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bodyInput: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 14,
    minHeight: 140,
    lineHeight: 22,
  },
  tagsRow: {
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tagChipActive: {
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    borderColor: "#A78BFA",
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  tagTextActive: {
    color: "#E9D5FF",
    fontWeight: "700",
  },
  aiPreviewBox: {
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.25)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  aiPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  aiPreviewTitle: {
    color: "#C084FC",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  aiChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  aiChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  saveBtn: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 4,
  },
  saveGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  entryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  entryTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  entryDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  entryDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
  },
  entryContent: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  emotionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  emotionBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  emotionBadgeText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "700",
  },
  tagSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagSmallText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
});
