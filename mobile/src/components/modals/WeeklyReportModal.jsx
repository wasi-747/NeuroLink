import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Clipboard,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Award,
  TrendingUp,
  Sparkles,
  Brain,
  Calendar,
  CheckCircle2,
  X,
  Share2,
  ChevronRight,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

// ─── Seed / Fallback Data ─────────────────────────────────────────────────────
const FALLBACK_REPORT = {
  weekLabel: "Oct 1 – Oct 7, 2026",
  mindBalanceScore: 74,
  moodDistribution: [
    { label: "Calm", percentage: 38, color: "#14B8A6", emoji: "🌊" },
    { label: "Happy", percentage: 30, color: "#10B981", emoji: "😊" },
    { label: "Anxious", percentage: 20, color: "#F59E0B", emoji: "😰" },
    { label: "Stressed", percentage: 12, color: "#F43F5E", emoji: "😤" },
  ],
  habitConsistency: 82,
  sleepMoodNote: "Your mood was 40% higher on days when you slept 7+ hours.",
  ariaInsight:
    "This week you showed real resilience — juggling academic pressures while consistently checking in. Your habit consistency is strong at 82%. For next week, consider adding one 5-minute mindfulness break between study sessions. You're doing the hard work, and it's paying off. 🌟",
};

// ─── Circular Score Arc ───────────────────────────────────────────────────────
function ScoreArc({ score, size = 120 }) {
  const arcAnim = useRef(new Animated.Value(0)).current;
  const r = size / 2 - 10;
  const circum = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(arcAnim, {
      toValue: score / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDash = arcAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circum * 0.75],
  });

  const scoreColor = score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : "#F43F5E";

  return (
    <View style={[styles.arcContainer, { width: size, height: size }]}>
      {/* Background ring */}
      <View
        style={[
          styles.arcRing,
          { width: size, height: size, borderRadius: size / 2, borderColor: "rgba(255,255,255,0.08)" },
        ]}
      />
      {/* Score text */}
      <View style={styles.arcContent}>
        <Text style={[styles.arcScore, { color: scoreColor }]}>{score}</Text>
        <Text style={styles.arcMax}>/ 100</Text>
      </View>
    </View>
  );
}

// ─── Mood Bar ─────────────────────────────────────────────────────────────────
function MoodBar({ mood, delay = 0 }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(widthAnim, {
        toValue: mood.percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [mood.percentage]);

  return (
    <View style={styles.moodBarRow}>
      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
      <Text style={styles.moodLabel}>{mood.label}</Text>
      <View style={styles.moodBarTrack}>
        <Animated.View
          style={[
            styles.moodBarFill,
            {
              backgroundColor: mood.color,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      <Text style={[styles.moodPct, { color: mood.color }]}>{mood.percentage}%</Text>
    </View>
  );
}

// ─── Habit Ring ───────────────────────────────────────────────────────────────
function HabitRing({ percentage }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, { toValue: percentage, duration: 1000, useNativeDriver: false }).start();
  }, [percentage]);

  const ringColor = percentage >= 75 ? "#10B981" : percentage >= 50 ? "#F59E0B" : "#F43F5E";

  return (
    <View style={styles.habitRingContainer}>
      <View style={[styles.habitRingBg, { borderColor: "rgba(255,255,255,0.08)" }]} />
      <View style={styles.habitRingContent}>
        <Text style={[styles.habitRingScore, { color: ringColor }]}>{percentage}%</Text>
        <Text style={styles.habitRingLabel}>Habit Rate</Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeeklyReportModal({ visible, onClose, onOpenAria }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) fetchReport();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setReport(null);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/wellness-reports");
      setReport(res.data?.data || FALLBACK_REPORT);
    } catch (_) {
      setReport(FALLBACK_REPORT);
    } finally {
      setIsLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  const handleShareReport = () => {
    // Recommended default: copy to clipboard
    if (!report) return;
    const reportText = [
      `📊 NeuroLink Weekly Wellness Report`,
      `Week: ${report.weekLabel}`,
      ``,
      `🧠 Mind Balance Score: ${report.mindBalanceScore}/100`,
      `✅ Habit Consistency: ${report.habitConsistency}%`,
      `💤 Sleep Insight: ${report.sleepMoodNote}`,
      ``,
      `Aria's Insight:`,
      report.ariaInsight,
    ].join("\n");

    Clipboard.setString(reportText);
    Alert.alert("Copied!", "Your weekly report has been copied to the clipboard.");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient
            colors={["#1E1B4B", "#312E81", "#4338CA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <Award size={22} color="#C7D2FE" />
              <View>
                <Text style={styles.headerTitle}>Weekly Wellness Report</Text>
                <Text style={styles.headerSubtitle}>
                  {report?.weekLabel ?? "Your personal analytics"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={styles.loadingText}>Generating your report…</Text>
            </View>
          )}

          {/* Content */}
          {!isLoading && report && (
            <Animated.ScrollView
              style={{ opacity: fadeAnim }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ── Metric 1: Mind Balance Score ── */}
              <LinearGradient
                colors={["#1E1B4B", "#312E81"]}
                style={styles.scoreCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.scoreCardHeader}>
                  <Brain size={16} color="#C7D2FE" />
                  <Text style={styles.scoreCardLabel}>WEEKLY MIND BALANCE SCORE</Text>
                </View>
                <View style={styles.scoreCardBody}>
                  <ScoreArc score={report.mindBalanceScore} size={130} />
                  <View style={styles.scoreCardRight}>
                    <Text style={styles.scoreCardDesc}>
                      Based on your mood logs, habit completions, journal entries, and stress assessments this week.
                    </Text>
                    <View style={styles.trendRow}>
                      <TrendingUp size={14} color="#10B981" />
                      <Text style={styles.trendText}>+6 pts from last week</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* ── Metric 2: Mood Distribution ── */}
              <View style={styles.metricsCard}>
                <View style={styles.metricHeader}>
                  <Sparkles size={15} color="#818CF8" />
                  <Text style={styles.metricTitle}>Dominant Mood Distribution</Text>
                </View>
                {report.moodDistribution.map((mood, i) => (
                  <MoodBar key={mood.label} mood={mood} delay={i * 120} />
                ))}
              </View>

              {/* ── Metric 3 & 4: Habit + Sleep ── */}
              <View style={styles.twoColRow}>
                {/* Habit Consistency */}
                <View style={[styles.metricsCard, { flex: 1 }]}>
                  <View style={styles.metricHeader}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <Text style={styles.metricTitle}>Habits</Text>
                  </View>
                  <HabitRing percentage={report.habitConsistency} />
                </View>

                {/* Sleep vs Mood */}
                <View style={[styles.metricsCard, { flex: 1 }]}>
                  <View style={styles.metricHeader}>
                    <Calendar size={14} color="#818CF8" />
                    <Text style={styles.metricTitle}>Sleep Insight</Text>
                  </View>
                  <Text style={styles.sleepNote}>{report.sleepMoodNote}</Text>
                </View>
              </View>

              {/* ── Aria's Weekly Clinical Insight ── */}
              <LinearGradient
                colors={["#4C1D95", "#5B21B6", "#6D28D9"]}
                style={styles.ariaInsightCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Glow orb */}
                <View style={styles.ariaGlowOrb} />
                <View style={styles.ariaInsightHeader}>
                  <View style={styles.ariaIconBg}>
                    <Brain size={18} color="#E9D5FF" />
                  </View>
                  <View>
                    <Text style={styles.ariaInsightLabel}>ARIA'S WEEKLY CLINICAL INSIGHT</Text>
                    <Text style={styles.ariaInsightSub}>Personalized · Private · Compassionate</Text>
                  </View>
                </View>
                <Text style={styles.ariaInsightText}>{report.ariaInsight}</Text>
                <TouchableOpacity
                  style={styles.ariaChatBtn}
                  onPress={() => { onClose(); onOpenAria && onOpenAria(); }}
                  activeOpacity={0.85}
                >
                  <Sparkles size={14} color="#E9D5FF" />
                  <Text style={styles.ariaChatBtnText}>Continue with Aria AI</Text>
                  <ChevronRight size={14} color="#E9D5FF" />
                </TouchableOpacity>
              </LinearGradient>

              {/* ── Action Buttons ── */}
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareReport} activeOpacity={0.85}>
                <LinearGradient
                  colors={["#0F766E", "#14B8A6"]}
                  style={styles.shareBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Share2 size={17} color="#FFF" />
                  <Text style={styles.shareBtnText}>Copy Report to Clipboard</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeOutlineBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeOutlineBtnText}>Close Report</Text>
              </TouchableOpacity>
            </Animated.ScrollView>
          )}
        </View>
      </View>
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
    maxHeight: "94%",
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  headerSubtitle: { color: "#A5B4FC", fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  // Loading
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 14 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },

  // Scroll
  scrollContent: { padding: 16, paddingBottom: 36, gap: 14 },

  // Score Card
  scoreCard: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  scoreCardHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  scoreCardLabel: { color: "rgba(199,210,254,0.7)", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  scoreCardBody: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreCardRight: { flex: 1, gap: 8 },
  scoreCardDesc: { color: "rgba(199,210,254,0.8)", fontSize: 12, lineHeight: 18 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  trendText: { color: "#10B981", fontSize: 12, fontWeight: "700" },

  // Arc
  arcContainer: { alignItems: "center", justifyContent: "center", position: "relative" },
  arcRing: {
    position: "absolute",
    borderWidth: 8,
  },
  arcContent: { alignItems: "center" },
  arcScore: { fontSize: 36, fontWeight: "900" },
  arcMax: { color: "rgba(255,255,255,0.5)", fontSize: 12 },

  // Metrics Card
  metricsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10,
  },
  metricHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  metricTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  // Mood Bar
  moodBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  moodEmoji: { fontSize: 15, width: 20 },
  moodLabel: { color: colors.textSecondary, fontSize: 12, width: 56 },
  moodBarTrack: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" },
  moodBarFill: { height: "100%", borderRadius: 4 },
  moodPct: { fontSize: 12, fontWeight: "700", width: 35, textAlign: "right" },

  // Two Col
  twoColRow: { flexDirection: "row", gap: 12 },

  // Habit Ring
  habitRingContainer: { alignItems: "center", justifyContent: "center", height: 80, position: "relative" },
  habitRingBg: { position: "absolute", width: 70, height: 70, borderRadius: 35, borderWidth: 7 },
  habitRingContent: { alignItems: "center" },
  habitRingScore: { fontSize: 20, fontWeight: "900" },
  habitRingLabel: { color: colors.textMuted, fontSize: 10 },

  // Sleep
  sleepNote: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

  // Aria Insight Card
  ariaInsightCard: {
    borderRadius: 24,
    padding: 18,
    gap: 12,
    overflow: "hidden",
    position: "relative",
  },
  ariaGlowOrb: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(167,139,250,0.3)",
  },
  ariaInsightHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  ariaIconBg: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(167,139,250,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  ariaInsightLabel: { color: "rgba(233,213,255,0.8)", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  ariaInsightSub: { color: "rgba(167,139,250,0.7)", fontSize: 10, marginTop: 2 },
  ariaInsightText: { color: "#E9D5FF", fontSize: 14, lineHeight: 22 },
  ariaChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignSelf: "flex-start",
  },
  ariaChatBtnText: { color: "#E9D5FF", fontSize: 13, fontWeight: "700" },

  // Share
  shareBtn: { borderRadius: 16, overflow: "hidden" },
  shareBtnGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 15,
  },
  shareBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  // Close
  closeOutlineBtn: {
    alignItems: "center",
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
  },
  closeOutlineBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: "700" },
});
