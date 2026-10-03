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
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  HeartHandshake,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

// ─── Rotating Daily Prompts ───────────────────────────────────────────────────
const DAILY_PROMPTS = [
  ["A classmate who helped you today", "A moment of calm you experienced", "A challenge that taught you resilience"],
  ["Something that made you smile this morning", "A skill you are developing", "Someone who showed you kindness"],
  ["A place that brings you peace", "A lesson learned from a recent difficulty", "Something you are looking forward to"],
  ["A small victory you achieved today", "A friend or family member you appreciate", "One thing your body did well today"],
  ["A song or book that moved you", "A healthy habit you kept up", "Something beautiful you noticed today"],
  ["An opportunity you are grateful for", "A conversation that uplifted you", "An aspect of your personality you value"],
  ["Today's weather or season you appreciate", "A mentor or teacher you are grateful for", "A moment of laughter you experienced"],
];

function getTodayPrompts() {
  const dayIndex = new Date().getDay(); // 0-6
  return DAILY_PROMPTS[dayIndex];
}

// ─── Streak computation (local — recommended default) ─────────────────────────
function computeStreakFromHistory(history) {
  if (!history || history.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  const dayStrings = new Set(
    history.map((h) => {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return d.toDateString();
    })
  );

  while (dayStrings.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Seed history for display
const SEED_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(Date.now() - 86400000 * i).toISOString(),
  completed: true,
}));

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GratitudeModal({ visible, onClose, onSaved }) {
  const todayPrompts = getTodayPrompts();

  const [items, setItems] = useState(["", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState(SEED_HISTORY);
  const [streak, setStreak] = useState(0);

  // Glow animations for each input
  const glows = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStreak(computeStreakFromHistory(history));
  }, [history]);

  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setItems(["", "", ""]);
        setFocusedIndex(null);
        setIsSaved(false);
      }, 350);
    } else {
      fetchHistory();
    }
  }, [visible]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/gratitude/history");
      if (res.data?.data) setHistory(res.data.data);
    } catch (_) {
      // Keep seed history
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
    Animated.timing(glows[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (index) => {
    setFocusedIndex(null);
    Animated.timing(glows[index], {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSave = async () => {
    const filled = items.filter((i) => i.trim().length > 0);
    if (filled.length < 1) {
      Alert.alert("Add something", "Please write at least one thing you are grateful for.");
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/gratitude", { entries: items });
    } catch (_) {
      // Offline — continue silently
    } finally {
      const newEntry = { date: new Date().toISOString(), completed: true };
      setHistory((prev) => [newEntry, ...prev]);
      setIsSaving(false);
      setIsSaved(true);

      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 180,
        friction: 10,
      }).start();

      onSaved && onSaved({ entries: items });
    }
  };

  const handleClose = () => {
    setItems(["", "", ""]);
    setFocusedIndex(null);
    setIsSaved(false);
    checkAnim.setValue(0);
    onClose();
  };

  const last5Days = history.slice(0, 5).reverse();

  const formatShortDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const glowColor = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(99,102,241,0.0)", "rgba(99,102,241,0.5)"],
    });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient
            colors={["#134E4A", "#0F766E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <HeartHandshake size={22} color="#5EEAD4" />
              <View>
                <Text style={styles.headerTitle}>Gratitude Journal</Text>
                <Text style={styles.headerSubtitle}>Daily positive reflection</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Streak Badge */}
            <View style={styles.streakCard}>
              <LinearGradient
                colors={["#78350F", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.streakGradient}
              >
                <Flame size={22} color="#FCD34D" />
                <View>
                  <Text style={styles.streakCount}>{streak}-Day Gratitude Streak</Text>
                  <Text style={styles.streakSub}>Keep the momentum going! 🌟</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Today's Prompt */}
            <View style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Sparkles size={15} color="#818CF8" />
                <Text style={styles.promptTitle}>Today's Reflection Prompts</Text>
              </View>
              {todayPrompts.map((p, i) => (
                <Text key={i} style={styles.promptItem}>
                  {["✦", "✧", "✦"][i]}  {p}
                </Text>
              ))}
            </View>

            {/* Gratitude Inputs */}
            {!isSaved ? (
              <View style={styles.inputsSection}>
                <Text style={styles.inputsSectionLabel}>
                  3 Things I'm Grateful For Today
                </Text>
                {items.map((item, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.inputWrapper,
                      { shadowColor: "#6366F1", shadowOpacity: glowColor(glows[index]), shadowRadius: 12, elevation: 8 },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.inputBorder,
                        {
                          borderColor: glows[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [colors.cardBorder, "#6366F1"],
                          }),
                        },
                      ]}
                    >
                      <View style={styles.inputNumberBadge}>
                        <Text style={styles.inputNumber}>{index + 1}</Text>
                      </View>
                      <TextInput
                        style={styles.gratitudeInput}
                        placeholder={todayPrompts[index]}
                        placeholderTextColor={colors.textMuted}
                        value={item}
                        onChangeText={(text) => {
                          const updated = [...items];
                          updated[index] = text;
                          setItems(updated);
                        }}
                        onFocus={() => handleFocus(index)}
                        onBlur={() => handleBlur(index)}
                        multiline
                        maxLength={200}
                      />
                    </Animated.View>
                  </Animated.View>
                ))}

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.85}
                  disabled={isSaving}
                >
                  <LinearGradient
                    colors={["#0F766E", "#14B8A6"]}
                    style={styles.saveBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <HeartHandshake size={17} color="#FFF" />
                        <Text style={styles.saveBtnText}>Save Today's Gratitude</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              /* Success State */
              <Animated.View
                style={[styles.successCard, { transform: [{ scale: checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }], opacity: checkAnim }]}
              >
                <LinearGradient colors={["#064E3B", "#059669"]} style={styles.successGradient}>
                  <CheckCircle2 size={40} color="#34D399" />
                  <Text style={styles.successTitle}>Gratitude Logged! 🎉</Text>
                  <Text style={styles.successSub}>
                    You've completed your gratitude practice for today. Come back tomorrow to keep your streak alive!
                  </Text>
                  <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.85}>
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Last 5 Days Timeline */}
            <View style={styles.timelineCard}>
              <Text style={styles.timelineTitle}>Recent Check-ins</Text>
              <View style={styles.timelineRow}>
                {last5Days.map((entry, i) => (
                  <View key={i} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, entry.completed && styles.timelineDotFilled]}>
                      {entry.completed && <CheckCircle2 size={14} color="#34D399" />}
                    </View>
                    <Text style={styles.timelineDateText}>{formatShortDate(entry.date)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    maxHeight: "93%",
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
  headerSubtitle: { color: "#99F6E4", fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  scrollContent: { padding: 18, paddingBottom: 36, gap: 14 },

  // Streak
  streakCard: { borderRadius: 18, overflow: "hidden" },
  streakGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  streakCount: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  streakSub: { color: "#FDE68A", fontSize: 12, marginTop: 2 },

  // Prompt
  promptCard: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    gap: 8,
  },
  promptHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 2 },
  promptTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  promptItem: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  // Inputs
  inputsSection: { gap: 12 },
  inputsSectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  inputWrapper: { borderRadius: 16 },
  inputBorder: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
  },
  inputNumberBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(99,102,241,0.2)",
    alignItems: "center", justifyContent: "center",
    marginTop: 2, flexShrink: 0,
  },
  inputNumber: { color: "#818CF8", fontSize: 13, fontWeight: "800" },
  gratitudeInput: {
    flex: 1, color: "#FFFFFF", fontSize: 14, lineHeight: 22, minHeight: 48,
  },

  // Save
  saveBtn: { borderRadius: 16, overflow: "hidden", marginTop: 4 },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  // Success
  successCard: { borderRadius: 24, overflow: "hidden" },
  successGradient: { alignItems: "center", padding: 28, gap: 12 },
  successTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  successSub: { color: "#A7F3D0", fontSize: 13, textAlign: "center", lineHeight: 20 },
  doneBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 6,
  },
  doneBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  // Timeline
  timelineCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  timelineTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  timelineRow: { flexDirection: "row", justifyContent: "space-between" },
  timelineItem: { alignItems: "center", gap: 6 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  timelineDotFilled: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    borderColor: "rgba(52, 211, 153, 0.4)",
  },
  timelineDateText: { color: colors.textMuted, fontSize: 10 },
});
