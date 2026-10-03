import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Sparkles,
  X,
  Plus,
  Calendar,
  Trash2,
  Heart,
  Brain,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

// ─── Mood Tags ────────────────────────────────────────────────────────────────
const MOOD_TAGS = [
  { id: "grateful", label: "Grateful", emoji: "🙏", color: "#10B981" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "#F59E0B" },
  { id: "hopeful", label: "Hopeful", emoji: "✨", color: "#6366F1" },
  { id: "sad", label: "Sad", emoji: "😔", color: "#60A5FA" },
  { id: "calm", label: "Calm", emoji: "🌊", color: "#14B8A6" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "#F43F5E" },
  { id: "energized", label: "Energized", emoji: "⚡", color: "#FBBF24" },
  { id: "reflective", label: "Reflective", emoji: "🔮", color: "#A78BFA" },
];

// ─── Static emotion simulation (local mock — recommended default) ─────────────
function computeLocalEmotions(text) {
  const lower = text.toLowerCase();
  const joy =
    (lower.match(/\b(happy|great|amazing|love|joy|grateful|excited|wonderful|good)\b/g) || []).length;
  const sadness =
    (lower.match(/\b(sad|lonely|empty|miss|hopeless|cry|depressed|grief)\b/g) || []).length;
  const anger =
    (lower.match(/\b(angry|hate|furious|mad|annoyed|frustrated|irritated)\b/g) || []).length;
  const fear =
    (lower.match(/\b(scared|afraid|anxious|worry|nervous|panic|dread|fear)\b/g) || []).length;

  const total = joy + sadness + anger + fear || 1;
  const raw = { joy: joy / total, sadness: sadness / total, anger: anger / total, fear: fear / total };

  // Normalise so all sum to 1, apply baseline
  const baseline = { joy: 0.4, sadness: 0.2, anger: 0.15, fear: 0.25 };
  const blended = {
    joy: (raw.joy * 0.6 + baseline.joy * 0.4),
    sadness: (raw.sadness * 0.6 + baseline.sadness * 0.4),
    anger: (raw.anger * 0.6 + baseline.anger * 0.4),
    fear: (raw.fear * 0.6 + baseline.fear * 0.4),
  };
  const sum = Object.values(blended).reduce((a, b) => a + b, 0);
  return {
    joy: Math.round((blended.joy / sum) * 100),
    sadness: Math.round((blended.sadness / sum) * 100),
    anger: Math.round((blended.anger / sum) * 100),
    fear: Math.round((blended.fear / sum) * 100),
  };
}

const EMOTION_CONFIG = {
  joy: { label: "Joy", color: "#10B981", icon: "😊" },
  sadness: { label: "Sadness", color: "#60A5FA", icon: "😔" },
  anger: { label: "Anger", color: "#F43F5E", icon: "😤" },
  fear: { label: "Fear", color: "#F59E0B", icon: "😰" },
};

// Dummy stored entries (offline fallback seed)
const SEED_ENTRIES = [
  {
    id: "e1",
    title: "A calm Saturday morning",
    content: "Woke up early, made coffee and watched the sunrise. Feeling grateful for these small moments.",
    tags: ["grateful", "calm"],
    emotions: { joy: 55, sadness: 10, anger: 5, fear: 30 },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "e2",
    title: "Exam preparation stress",
    content: "The final exam is in 3 days. I feel anxious but I've prepared well. Trying to stay positive.",
    tags: ["anxious", "reflective"],
    emotions: { joy: 20, sadness: 15, anger: 10, fear: 55 },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JournalModal({ visible, onClose, onEntrySaved }) {
  const [activeTab, setActiveTab] = useState("write"); // 'write' | 'entries'
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [emotions, setEmotions] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const emotionDebounce = useRef(null);
  const barAnims = useRef({
    joy: new Animated.Value(0),
    sadness: new Animated.Value(0),
    anger: new Animated.Value(0),
    fear: new Animated.Value(0),
  }).current;

  // Compute emotions locally when content changes
  useEffect(() => {
    if (emotionDebounce.current) clearTimeout(emotionDebounce.current);
    if (content.trim().length < 10) {
      setEmotions(null);
      return;
    }
    emotionDebounce.current = setTimeout(() => {
      const result = computeLocalEmotions(content);
      setEmotions(result);
      animateBars(result);
    }, 600);
    return () => clearTimeout(emotionDebounce.current);
  }, [content]);

  const animateBars = (result) => {
    const animations = Object.keys(result).map((key) =>
      Animated.timing(barAnims[key], {
        toValue: result[key],
        duration: 700,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  };

  // Fetch entries when switching to entries tab
  useEffect(() => {
    if (activeTab === "entries" && visible) fetchEntries();
  }, [activeTab, visible]);

  const fetchEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const res = await api.get("/journal");
      setEntries(res.data?.data || SEED_ENTRIES);
    } catch (_) {
      setEntries(SEED_ENTRIES);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert("Title required", "Please add a title for your entry."); return; }
    if (!content.trim()) { Alert.alert("Content required", "Please write something before saving."); return; }

    setIsSaving(true);
    const payload = { title: title.trim(), content: content.trim(), tags: selectedTags };
    try {
      await api.post("/journal", payload);
    } catch (_) {
      // Offline — entry saved locally only
    } finally {
      const newEntry = {
        id: Date.now().toString(),
        ...payload,
        emotions: emotions || { joy: 40, sadness: 20, anger: 15, fear: 25 },
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [newEntry, ...prev]);
      setIsSaving(false);
      onEntrySaved && onEntrySaved(newEntry);
      resetForm();
      Alert.alert("Saved", "Your journal entry has been saved.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setEntries((prev) => prev.filter((e) => e.id !== id)) },
    ]);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setEmotions(null);
    Object.values(barAnims).forEach((a) => a.setValue(0));
  };

  const handleClose = () => { resetForm(); setActiveTab("write"); onClose(); };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Sheet */}
        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient
            colors={["#1E1B4B", "#312E81"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <BookOpen size={20} color="#A5B4FC" />
              <View>
                <Text style={styles.headerTitle}>Wellness Journal</Text>
                <Text style={styles.headerSubtitle}>Reflect · Heal · Grow</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {["write", "entries"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === "write" ? "✍️  Write" : "📚  Past Entries"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Write Tab ── */}
          {activeTab === "write" && (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Entry Title</Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="What's on your mind today?"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={80}
                />
              </View>

              {/* Mood Tags */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mood Tags</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                  <View style={styles.tagsRow}>
                    {MOOD_TAGS.map((tag) => {
                      const selected = selectedTags.includes(tag.id);
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          style={[
                            styles.tagChip,
                            selected && { backgroundColor: tag.color + "30", borderColor: tag.color },
                          ]}
                          onPress={() => toggleTag(tag.id)}
                          activeOpacity={0.75}
                        >
                          <Text>{tag.emoji}</Text>
                          <Text style={[styles.tagLabel, selected && { color: tag.color }]}>
                            {tag.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Content */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reflection</Text>
                <TextInput
                  style={styles.contentInput}
                  placeholder="Write freely — this is your private space. Describe what happened, how you feel, what you're grateful for, or what's weighing on you..."
                  placeholderTextColor={colors.textMuted}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{content.length} characters</Text>
              </View>

              {/* AI Emotion Breakdown */}
              {emotions && (
                <View style={styles.emotionCard}>
                  <View style={styles.emotionHeader}>
                    <Sparkles size={15} color="#818CF8" />
                    <Text style={styles.emotionTitle}>AI Emotion Breakdown</Text>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>Live</Text>
                    </View>
                  </View>
                  {Object.entries(EMOTION_CONFIG).map(([key, cfg]) => (
                    <View key={key} style={styles.emotionRow}>
                      <Text style={styles.emotionEmoji}>{cfg.icon}</Text>
                      <Text style={styles.emotionLabel}>{cfg.label}</Text>
                      <View style={styles.emotionBarTrack}>
                        <Animated.View
                          style={[
                            styles.emotionBarFill,
                            {
                              backgroundColor: cfg.color,
                              width: barAnims[key].interpolate({
                                inputRange: [0, 100],
                                outputRange: ["0%", "100%"],
                              }),
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.emotionPct, { color: cfg.color }]}>
                        {emotions[key]}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Prompt when no content yet */}
              {!emotions && content.length < 10 && (
                <View style={styles.promptCard}>
                  <Brain size={18} color="#818CF8" />
                  <Text style={styles.promptText}>
                    Start writing — your AI emotion analysis will appear as you type.
                  </Text>
                </View>
              )}

              {/* Save */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={isSaving}>
                <LinearGradient
                  colors={["#6366F1", "#818CF8"]}
                  style={styles.saveBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Heart size={17} color="#FFF" />
                      <Text style={styles.saveBtnText}>Save Journal Entry</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── Entries Tab ── */}
          {activeTab === "entries" && (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {isLoadingEntries ? (
                <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
              ) : entries.length === 0 ? (
                <View style={styles.emptyState}>
                  <BookOpen size={40} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No entries yet</Text>
                  <Text style={styles.emptySubtitle}>Your saved reflections will appear here.</Text>
                </View>
              ) : (
                entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} formatDate={formatDate} />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Entry Card ───────────────────────────────────────────────────────────────
function EntryCard({ entry, onDelete, formatDate }) {
  const [expanded, setExpanded] = useState(false);
  const tags = (entry.tags || [])
    .map((id) => MOOD_TAGS.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryHeaderLeft}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <View style={styles.entryMeta}>
            <Calendar size={11} color={colors.textMuted} />
            <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.entryActions}>
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.entryActionBtn} activeOpacity={0.7}>
            <ChevronRight
              size={16}
              color={colors.textMuted}
              style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(entry.id)} style={styles.entryActionBtn} activeOpacity={0.7}>
            <Trash2 size={14} color="#F43F5E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Emotion Pills */}
      {entry.emotions && (
        <View style={styles.entryEmotionRow}>
          {Object.entries(EMOTION_CONFIG).map(([key, cfg]) => (
            <View key={key} style={[styles.entryEmotionPill, { backgroundColor: cfg.color + "20" }]}>
              <Text style={styles.entryEmotionPillIcon}>{cfg.icon}</Text>
              <Text style={[styles.entryEmotionPillText, { color: cfg.color }]}>
                {entry.emotions[key]}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.entryTagsRow}>
          {tags.map((tag) => (
            <View key={tag.id} style={[styles.entryTagPill, { borderColor: tag.color + "60" }]}>
              <Text style={{ fontSize: 11 }}>{tag.emoji}</Text>
              <Text style={[styles.entryTagText, { color: tag.color }]}>{tag.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Expanded content */}
      {expanded && (
        <Text style={styles.entryContent}>{entry.content}</Text>
      )}
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
    maxHeight: "95%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  headerSubtitle: { color: "#A5B4FC", fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.brand },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FFFFFF" },

  // Scroll
  scrollContent: { padding: 16, paddingBottom: 36, gap: 16 },

  // Input
  inputGroup: { gap: 8 },
  inputLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  titleInput: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  contentInput: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
    minHeight: 130,
  },
  charCount: { color: colors.textMuted, fontSize: 11, textAlign: "right" },

  // Tags
  tagsScroll: { marginBottom: 2 },
  tagsRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },

  // Emotion
  emotionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderHighlight,
    gap: 10,
  },
  emotionHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 2 },
  emotionTitle: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981" },
  liveText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  emotionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  emotionEmoji: { fontSize: 15, width: 20 },
  emotionLabel: { color: colors.textSecondary, fontSize: 12, width: 60 },
  emotionBarTrack: {
    flex: 1, height: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  emotionBarFill: { height: "100%", borderRadius: 4 },
  emotionPct: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },

  // Prompt
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  promptText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },

  // Save
  saveBtn: { borderRadius: 16, overflow: "hidden" },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  emptySubtitle: { color: colors.textMuted, fontSize: 13 },

  // Entry Card
  entryCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10,
  },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryHeaderLeft: { flex: 1, gap: 4 },
  entryTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  entryMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  entryDate: { color: colors.textMuted, fontSize: 11 },
  entryActions: { flexDirection: "row", gap: 4, marginLeft: 10 },
  entryActionBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  entryEmotionRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  entryEmotionPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  entryEmotionPillIcon: { fontSize: 11 },
  entryEmotionPillText: { fontSize: 11, fontWeight: "700" },
  entryTagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  entryTagPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  entryTagText: { fontSize: 11, fontWeight: "600" },
  entryContent: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});
