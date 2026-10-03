import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Smile,
  Frown,
  Meh,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Brain,
  Zap,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { getMoodsApi, createMoodApi, predictSentiment } from "../services/api";
import { getLocalMoods, saveLocalMood, enqueueOfflineAction } from "../services/storageService";

const { width } = Dimensions.get("window");

const MOOD_OPTIONS = [
  { label: "Ecstatic", emoji: "🤩", score: 5, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
  { label: "Happy", emoji: "😊", score: 4, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
  { label: "Calm", emoji: "😌", score: 4, color: "#6366F1", bg: "rgba(99, 102, 241, 0.15)" },
  { label: "Neutral", emoji: "😐", score: 3, color: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)" },
  { label: "Anxious", emoji: "😰", score: 2, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
  { label: "Sad", emoji: "😢", score: 2, color: "#EC4899", bg: "rgba(236, 72, 153, 0.15)" },
  { label: "Overwhelmed", emoji: "🤯", score: 1, color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)" },
];

const FEELING_TAGS = [
  "Grateful",
  "Productive",
  "Tired",
  "Inspired",
  "Stressed",
  "Relaxed",
  "Focused",
  "Lonely",
  "Motivated",
  "Loved",
];

export default function MoodTrackerScreen({ onOpenAria }) {
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[1]);
  const [selectedTags, setSelectedTags] = useState(["Grateful"]);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [note, setNote] = useState("");
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSentiment, setAiSentiment] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    setLoading(true);
    // Instant local cache load
    const localData = await getLocalMoods();
    if (localData && localData.length > 0) {
      setMoodLogs(localData);
      setLoading(false);
    }
    // Background sync with API
    try {
      const data = await getMoodsApi();
      if (data && data.length > 0) {
        setMoodLogs(data);
      }
    } catch (e) {
      console.log("Offline mode: loaded local mood cache.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleLogMood = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Predict sentiment
    let sentimentResult = { sentiment: "Positive", confidence: 0.85 };
    if (note.trim().length > 3) {
      sentimentResult = await predictSentiment(note);
      setAiSentiment(sentimentResult);
    }

    const newLog = {
      mood: selectedMood.label,
      score: selectedMood.score,
      energyLevel,
      tags: selectedTags,
      note,
      timestamp: new Date().toISOString(),
    };

    // 1. Instant local persistence
    await saveLocalMood(newLog);
    await enqueueOfflineAction("CREATE_MOOD", newLog);

    // 2. Optimistic UI update
    setMoodLogs((prev) => [newLog, ...prev]);

    // 3. Background API sync
    createMoodApi(newLog).catch((err) =>
      console.log("Saved offline, will sync when online.")
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    setNote("");
    setIsSubmitting(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <LinearGradient
        colors={["#1e1b4b", "#312e81", "#1e1b4b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <View style={styles.badge}>
              <Sparkles size={12} color="#A5B4FC" />
              <Text style={styles.badgeText}>NEURO-MOOD AI</Text>
            </View>
            <Text style={styles.headerTitle}>How are you feeling?</Text>
            <Text style={styles.headerSubtitle}>
              Check in with yourself to unlock neural insights & tailored self-care.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ariaCompanionBtn}
            onPress={onOpenAria}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#7C3AED", "#6366F1"]}
              style={styles.ariaBtnGradient}
            >
              <Brain size={18} color="#FFFFFF" />
              <Text style={styles.ariaBtnText}>Aria</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Mood Selector Grid */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Today's Core Mood</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodSelectorRow}
        >
          {MOOD_OPTIONS.map((m) => {
            const isSelected = selectedMood.label === m.label;
            return (
              <TouchableOpacity
                key={m.label}
                style={[
                  styles.moodChip,
                  isSelected && {
                    borderColor: m.color,
                    backgroundColor: m.bg,
                    transform: [{ scale: 1.05 }],
                  },
                ]}
                onPress={() => setSelectedMood(m)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && { color: m.color, fontWeight: "700" },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Energy Level Selector */}
        <View style={styles.divider} />
        <View style={styles.energyHeader}>
          <View style={styles.rowAlign}>
            <Zap size={16} color="#F59E0B" />
            <Text style={styles.inputSubtitle}>Energy Level</Text>
          </View>
          <Text style={styles.energyValueText}>{energyLevel} / 5</Text>
        </View>
        <View style={styles.energyRow}>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.energyButton,
                energyLevel === lvl && styles.energyButtonActive,
              ]}
              onPress={() => setEnergyLevel(lvl)}
            >
              <Text
                style={[
                  styles.energyBtnText,
                  energyLevel === lvl && styles.energyBtnTextActive,
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emotion & Context Tags */}
        <View style={styles.divider} />
        <Text style={styles.inputSubtitle}>What describes your state?</Text>
        <View style={styles.tagsWrapper}>
          {FEELING_TAGS.map((tag) => {
            const isTagActive = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  isTagActive && styles.tagChipActive,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    isTagActive && styles.tagTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reflection Note */}
        <View style={styles.divider} />
        <Text style={styles.inputSubtitle}>Add a mindful reflection (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What contributed to how you feel today? Note your triggers, thoughts, or wins..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleLogMood}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : savedSuccess ? (
              <View style={styles.rowAlign}>
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Mood Logged & Synced!</Text>
              </View>
            ) : (
              <View style={styles.rowAlign}>
                <Sparkles size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Save Today's Check-In</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Mood History Timeline */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.rowAlign}>
          <TrendingUp size={18} color="#818CF8" />
          <Text style={styles.sectionHeaderTitle}>Recent Mood Journey</Text>
        </View>
        <Text style={styles.historySubBadge}>Past 7 Days</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.historyList}>
          {moodLogs.map((log, idx) => {
            const moodScore = typeof log.mood === "number" ? log.mood : (log.score || log.rating || 4);
            const moodMeta =
              (typeof log.mood === "string" && MOOD_OPTIONS.find((m) => m.label.toLowerCase() === log.mood.toLowerCase())) ||
              MOOD_OPTIONS.find((m) => m.score === Math.round(moodScore)) ||
              MOOD_OPTIONS[1];
            const moodDisplayLabel = typeof log.mood === "string" ? log.mood : moodMeta.label;

            return (
              <View key={log._id || log.id || idx} style={styles.historyCard}>
                <View style={styles.historyCardHeader}>
                  <View style={styles.rowAlign}>
                    <View
                      style={[
                        styles.historyEmojiBox,
                        { backgroundColor: moodMeta.bg },
                      ]}
                    >
                      <Text style={styles.historyEmoji}>{moodMeta.emoji}</Text>
                    </View>
                    <View style={styles.historyMetaGroup}>
                      <Text style={styles.historyMoodLabel}>{moodDisplayLabel}</Text>
                      <View style={styles.historyTimeRow}>
                        <Clock size={12} color={colors.textMuted} />
                        <Text style={styles.historyTimeText}>
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.scoreBadge,
                      { borderColor: moodMeta.color },
                    ]}
                  >
                    <Text style={[styles.scoreBadgeText, { color: moodMeta.color }]}>
                      Score {log.score || moodMeta.score}/5
                    </Text>
                  </View>
                </View>

                {log.note ? (
                  <Text style={styles.historyNoteText}>"{log.note}"</Text>
                ) : null}

                {log.tags && log.tags.length > 0 && (
                  <View style={styles.historyTagsRow}>
                    {log.tags.map((tg, i) => (
                      <View key={i} style={styles.historyTagChip}>
                        <Text style={styles.historyTagText}>#{tg}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 6,
  },
  badgeText: {
    color: "#C7D2FE",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
  },
  ariaCompanionBtn: {
    borderRadius: 18,
    overflow: "hidden",
  },
  ariaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
  },
  ariaBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 14,
  },
  moodSelectorRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
  },
  moodChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    minWidth: 78,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 16,
  },
  inputSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 10,
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  energyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  energyValueText: {
    color: "#F59E0B",
    fontWeight: "700",
    fontSize: 14,
  },
  energyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  energyButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  energyButtonActive: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  energyBtnText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
  energyBtnTextActive: {
    color: "#0F172A",
  },
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tagChipActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: "#818CF8",
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  tagTextActive: {
    color: "#C7D2FE",
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 16,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    textAlignVertical: "top",
    minHeight: 70,
    marginBottom: 16,
  },
  submitButton: {
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  historySubBadge: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyEmojiBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  historyEmoji: {
    fontSize: 22,
  },
  historyMetaGroup: {
    marginLeft: 10,
  },
  historyMoodLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  historyTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  historyTimeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  historyNoteText: {
    fontSize: 13,
    color: "#CBD5E1",
    fontStyle: "italic",
    lineHeight: 18,
    marginVertical: 6,
  },
  historyTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  historyTagChip: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyTagText: {
    fontSize: 11,
    color: "#94A3B8",
  },
});
