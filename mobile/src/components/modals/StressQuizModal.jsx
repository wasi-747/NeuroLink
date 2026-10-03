import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Brain,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

// ─── PSS-10 Questions ────────────────────────────────────────────────────────
const PSS_QUESTIONS = [
  {
    id: 1,
    text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
    inverted: false,
  },
  {
    id: 2,
    text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
    inverted: false,
  },
  {
    id: 3,
    text: "In the last month, how often have you felt nervous and 'stressed'?",
    inverted: false,
  },
  {
    id: 4,
    text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    inverted: true,
  },
  {
    id: 5,
    text: "In the last month, how often have you felt that things were going your way?",
    inverted: true,
  },
  {
    id: 6,
    text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    inverted: false,
  },
  {
    id: 7,
    text: "In the last month, how often have you been able to control irritations in your life?",
    inverted: true,
  },
  {
    id: 8,
    text: "In the last month, how often have you felt that you were on top of things?",
    inverted: true,
  },
  {
    id: 9,
    text: "In the last month, how often have you been angered because of things that were outside of your control?",
    inverted: false,
  },
  {
    id: 10,
    text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
    inverted: false,
  },
];

const ANSWER_OPTIONS = [
  { value: 0, label: "Never", emoji: "😌" },
  { value: 1, label: "Almost Never", emoji: "🙂" },
  { value: 2, label: "Sometimes", emoji: "😐" },
  { value: 3, label: "Fairly Often", emoji: "😟" },
  { value: 4, label: "Very Often", emoji: "😫" },
];

// ─── Score Helpers ────────────────────────────────────────────────────────────
function computeScore(answers) {
  return Object.entries(answers).reduce((sum, [id, val]) => {
    const q = PSS_QUESTIONS.find((q) => q.id === parseInt(id));
    return sum + (q?.inverted ? 4 - val : val);
  }, 0);
}

function getStressLevel(score) {
  if (score <= 13) return "Low Stress";
  if (score <= 26) return "Moderate Stress";
  return "High Stress";
}

function getLevelConfig(level) {
  switch (level) {
    case "Low Stress":
      return {
        color: "#10B981",
        bg: "rgba(16, 185, 129, 0.15)",
        border: "rgba(16, 185, 129, 0.4)",
        gradient: ["#064e3b", "#059669"],
        icon: <CheckCircle2 size={18} color="#34D399" />,
        recommendations: [
          "Keep up your current self-care habits — they're clearly working.",
          "Practice 5 minutes of gratitude journaling each morning.",
          "Maintain your sleep schedule to protect your stress resilience.",
          "Continue light physical activity or daily walks.",
        ],
      };
    case "Moderate Stress":
      return {
        color: "#F59E0B",
        bg: "rgba(245, 158, 11, 0.15)",
        border: "rgba(245, 158, 11, 0.4)",
        gradient: ["#78350f", "#d97706"],
        icon: <ShieldAlert size={18} color="#FCD34D" />,
        recommendations: [
          "Try a 10-minute daily mindfulness or breathing session (4-7-8 technique).",
          "Break large tasks into smaller steps to reduce overwhelm.",
          "Talk to a trusted friend or counselor about current stressors.",
          "Limit caffeine after 2 PM and maintain consistent sleep timing.",
        ],
      };
    default: // High Stress
      return {
        color: "#F43F5E",
        bg: "rgba(244, 63, 94, 0.15)",
        border: "rgba(244, 63, 94, 0.4)",
        gradient: ["#881337", "#f43f5e"],
        icon: <ShieldAlert size={18} color="#FB7185" />,
        recommendations: [
          "Consider speaking with a licensed mental health professional soon.",
          "Practice daily somatic grounding — the 5-4-3-2-1 technique helps.",
          "Reduce your task load immediately — ruthlessly prioritize only essentials.",
          "Use the Aria AI companion for structured emotional support and check-ins.",
        ],
      };
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StressQuizModal({
  visible,
  onClose,
  onOpenAria,
  onQuizComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [phase, setPhase] = useState("quiz"); // 'quiz' | 'loading' | 'result'
  const [result, setResult] = useState(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentQuestion = PSS_QUESTIONS[currentIndex];
  const totalQuestions = PSS_QUESTIONS.length;

  // Animate progress bar whenever index changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / totalQuestions,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  // Restore selected answer when navigating back
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion.id] ?? null);
  }, [currentIndex]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setCurrentIndex(0);
        setAnswers({});
        setSelectedAnswer(null);
        setPhase("quiz");
        setResult(null);
        progressAnim.setValue(0);
      }, 300);
    }
  }, [visible]);

  const slideToNext = (direction = 1) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(direction * 40);
      setCurrentIndex((i) => i + direction);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    });
  };

  const handleAnswer = (value) => {
    setSelectedAnswer(value);
    const updatedAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(updatedAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        slideToNext(1);
      } else {
        submitQuiz(updatedAnswers);
      }
    }, 350);
  };

  const submitQuiz = async (finalAnswers) => {
    setPhase("loading");
    const localScore = computeScore(finalAnswers);
    const localLevel = getStressLevel(localScore);

    try {
      const res = await api.post("/stress-quiz", {
        answers: Object.fromEntries(
          Object.entries(finalAnswers).map(([k, v]) => [k, v])
        ),
      });
      const score = res.data?.score ?? localScore;
      const level = res.data?.level ?? localLevel;
      setResult({ score, level });
    } catch (_) {
      // Offline fallback
      setResult({ score: localScore, level: localLevel });
    } finally {
      setPhase("result");
      onQuizComplete && onQuizComplete({ score: localScore, level: localLevel });
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setPhase("quiz");
    setResult(null);
    progressAnim.setValue(0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ── Header ── */}
          <LinearGradient
            colors={["#1E1B4B", "#312E81"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <Brain size={20} color="#A5B4FC" />
              <View>
                <Text style={styles.headerTitle}>Stress Assessment</Text>
                <Text style={styles.headerSubtitle}>PSS-10 Clinical Scale</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </LinearGradient>

          {/* ── Content ── */}
          {phase === "quiz" && (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Progress */}
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>
                  Question {currentIndex + 1} of {totalQuestions}
                </Text>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Question Card */}
              <Animated.View
                style={[
                  styles.questionCard,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.questionBadge}>
                  <Zap size={14} color="#818CF8" />
                  <Text style={styles.questionBadgeText}>
                    {currentQuestion.inverted ? "Positive Framing" : "Stress Indicator"}
                  </Text>
                </View>
                <Text style={styles.questionText}>{currentQuestion.text}</Text>
              </Animated.View>

              {/* Answer Options */}
              <View style={styles.optionsContainer}>
                {ANSWER_OPTIONS.map((option) => {
                  const isSelected = selectedAnswer === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleAnswer(option.value)}
                      activeOpacity={0.75}
                      style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                    >
                      {isSelected && (
                        <LinearGradient
                          colors={["rgba(99,102,241,0.3)", "rgba(129,140,248,0.15)"]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      )}
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {option.label}
                      </Text>
                      <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                        {isSelected && <View style={styles.optionRadioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Nav Buttons */}
              <View style={styles.navRow}>
                {currentIndex > 0 ? (
                  <TouchableOpacity
                    style={styles.navBackBtn}
                    onPress={() => slideToNext(-1)}
                    activeOpacity={0.8}
                  >
                    <ChevronLeft size={18} color="#94A3B8" />
                    <Text style={styles.navBackText}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                {selectedAnswer !== null && (
                  <TouchableOpacity
                    style={styles.navNextBtn}
                    onPress={() => {
                      if (currentIndex < totalQuestions - 1) slideToNext(1);
                      else submitQuiz(answers);
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={["#6366F1", "#818CF8"]}
                      style={styles.navNextGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.navNextText}>
                        {currentIndex < totalQuestions - 1 ? "Next" : "Submit"}
                      </Text>
                      <ChevronRight size={16} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}

          {/* ── Loading ── */}
          {phase === "loading" && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={styles.loadingText}>Analysing your responses…</Text>
            </View>
          )}

          {/* ── Result ── */}
          {phase === "result" && result && <ResultScreen result={result} onRetake={handleRetake} onOpenAria={onOpenAria} onClose={onClose} />}
        </View>
      </View>
    </Modal>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ result, onRetake, onOpenAria, onClose }) {
  const config = getLevelConfig(result.level);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.ScrollView
      style={{ opacity: fadeIn }}
      contentContainerStyle={styles.resultScroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Score Badge */}
      <LinearGradient
        colors={config.gradient}
        style={styles.scoreBadgeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.scoreBadgeTop}>
          <Sparkles size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.scoreBadgeLabel}>YOUR PSS-10 SCORE</Text>
        </View>
        <Text style={styles.scoreBadgeValue}>{result.score}</Text>
        <Text style={styles.scoreBadgeMax}>out of 40</Text>
        <View style={[styles.levelBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
          {config.icon}
          <Text style={[styles.levelBadgeText, { color: config.color }]}>{result.level}</Text>
        </View>
      </LinearGradient>

      {/* Recommendations */}
      <View style={styles.recommendCard}>
        <View style={styles.recommendHeader}>
          <Brain size={16} color="#818CF8" />
          <Text style={styles.recommendTitle}>Clinical Recommendations</Text>
        </View>
        {config.recommendations.map((rec, i) => (
          <View key={i} style={styles.recommendItem}>
            <View style={styles.recommendBullet} />
            <Text style={styles.recommendText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.ariaBtn} onPress={() => { onClose(); onOpenAria && onOpenAria(); }} activeOpacity={0.85}>
        <LinearGradient colors={["#4C1D95", "#6D28D9"]} style={styles.ariaBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Sparkles size={18} color="#E9D5FF" />
          <Text style={styles.ariaBtnText}>Talk to Aria AI</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.retakeBtn} onPress={onRetake} activeOpacity={0.8}>
        <RotateCcw size={16} color="#94A3B8" />
        <Text style={styles.retakeBtnText}>Retake Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeTextBtn} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.closeTextBtnLabel}>Close</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
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
  headerSubtitle: { color: "#A5B4FC", fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scrollContent: { padding: 18, paddingBottom: 32, gap: 16 },

  // Progress
  progressSection: { gap: 8 },
  progressLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#6366F1",
  },

  // Question Card
  questionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorderHighlight,
    gap: 12,
  },
  questionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  questionBadgeText: { color: "#818CF8", fontSize: 11, fontWeight: "700" },
  questionText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },

  // Options
  optionsContainer: { gap: 10 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 12,
    overflow: "hidden",
  },
  optionBtnSelected: { borderColor: "#6366F1" },
  optionEmoji: { fontSize: 22 },
  optionLabel: { flex: 1, color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  optionLabelSelected: { color: "#FFFFFF" },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  optionRadioSelected: { borderColor: "#6366F1" },
  optionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366F1",
  },

  // Nav
  navRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  navBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 10,
  },
  navBackText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  navNextBtn: { borderRadius: 14, overflow: "hidden" },
  navNextGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navNextText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  // Loading
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 14,
  },
  loadingText: { color: colors.textSecondary, fontSize: 14 },

  // Result
  resultScroll: { padding: 18, paddingBottom: 36, gap: 14 },
  scoreBadgeCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  scoreBadgeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  scoreBadgeLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  scoreBadgeValue: {
    color: "#FFFFFF",
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 70,
  },
  scoreBadgeMax: { color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 12 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  levelBadgeText: { fontSize: 14, fontWeight: "800" },

  // Recommend
  recommendCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  recommendHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  recommendTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  recommendItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  recommendBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6366F1",
    marginTop: 7,
    flexShrink: 0,
  },
  recommendText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  // Buttons
  ariaBtn: { borderRadius: 16, overflow: "hidden" },
  ariaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
  },
  ariaBtnText: { color: "#E9D5FF", fontSize: 15, fontWeight: "800" },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingVertical: 13,
  },
  retakeBtnText: { color: "#94A3B8", fontSize: 14, fontWeight: "700" },
  closeTextBtn: { alignItems: "center", paddingVertical: 6 },
  closeTextBtnLabel: { color: colors.textMuted, fontSize: 13 },
});
