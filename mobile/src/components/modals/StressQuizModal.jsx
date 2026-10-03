import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Brain,
  AlertTriangle,
  ArrowRight,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import { submitStressQuizApi } from "../../services/api";

const { width } = Dimensions.get("window");

const PSS_QUESTIONS = [
  { id: 1, text: "In the last month, how often have you been upset because of something that happened unexpectedly?", reverse: false },
  { id: 2, text: "In the last month, how often have you felt that you were unable to control the important things in your life?", reverse: false },
  { id: 3, text: "In the last month, how often have you felt nervous and 'stressed'?", reverse: false },
  { id: 4, text: "In the last month, how often have you felt confident about your ability to handle your personal problems?", reverse: true },
  { id: 5, text: "In the last month, how often have you felt that things were going your way?", reverse: true },
  { id: 6, text: "In the last month, how often have you found that you could not cope with all the things that you had to do?", reverse: false },
  { id: 7, text: "In the last month, how often have you been able to control irritations in your life?", reverse: true },
  { id: 8, text: "In the last month, how often have you felt that you were on top of things?", reverse: true },
  { id: 9, text: "In the last month, how often have you been angered because of things that were outside of your control?", reverse: false },
  { id: 10, text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", reverse: false },
];

const OPTIONS = [
  { value: 0, label: "Never", emoji: "😌" },
  { value: 1, label: "Almost Never", emoji: "🙂" },
  { value: 2, label: "Sometimes", emoji: "😐" },
  { value: 3, label: "Fairly Often", emoji: "😟" },
  { value: 4, label: "Very Often", emoji: "😫" },
];

export default function StressQuizModal({
  visible,
  onClose,
  onOpenAria,
  onQuizComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0); // 0-9 questions, 10 for results
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!visible) return null;

  const currentQ = PSS_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / PSS_QUESTIONS.length) * 100);

  const handleSelectOption = (val) => {
    const updatedAnswers = { ...answers, [currentQ.id]: val };
    setAnswers(updatedAnswers);

    if (currentStep < 9) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 250);
    } else {
      // All questions completed, submit
      handleSubmit(updatedAnswers);
    }
  };

  const calculateLocalScore = (ans) => {
    let score = 0;
    PSS_QUESTIONS.forEach((q) => {
      const v = ans[q.id] !== undefined ? ans[q.id] : 0;
      if (q.reverse) {
        score += 4 - v;
      } else {
        score += v;
      }
    });
    return score;
  };

  const handleSubmit = async (ansToSubmit = answers) => {
    setIsSubmitting(true);
    try {
      const res = await submitStressQuizApi(ansToSubmit);
      const data = res?.data || res;
      setResult(data);
      if (onQuizComplete) {
        onQuizComplete(data);
      }
    } catch (err) {
      const localScore = calculateLocalScore(ansToSubmit);
      const level = localScore <= 13 ? "Low" : localScore <= 26 ? "Moderate" : "High";
      const fallbackResult = {
        score: localScore,
        level,
        recommendations:
          level === "Low"
            ? ["Maintain your healthy habits and coping strategies.", "Continue mindfulness exercises."]
            : level === "Moderate"
            ? ["Identify your top stressors and take short breaks.", "Practice 2-min box breathing with Aria."]
            : ["Consider speaking to a certified mental health counselor.", "Prioritize gentle restorative sleep."],
      };
      setResult(fallbackResult);
      if (onQuizComplete) {
        onQuizComplete(fallbackResult);
      }
    } finally {
      setIsSubmitting(false);
      setCurrentStep(10);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setResult(null);
    setCurrentStep(0);
  };

  const getLevelColor = (lvl) => {
    if (lvl === "Low") return "#10B981";
    if (lvl === "Moderate") return "#F59E0B";
    return "#EF4444";
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
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Zap size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>PSS-10 Stress Assessment</Text>
                <Text style={styles.headerSubtitle}>
                  Scientifically validated clinical scale
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          {currentStep < 10 ? (
            <ScrollView
              contentContainerStyle={styles.quizContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Progress Indicator */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressStepText}>
                    Question {currentStep + 1} of 10
                  </Text>
                  <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Question Card */}
              <LinearGradient
                colors={["#1e1b4b", "#312e81"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.questionCard}
              >
                <Text style={styles.questionText}>{currentQ?.text}</Text>
                {currentQ?.reverse && (
                  <View style={styles.reverseBadge}>
                    <Text style={styles.reverseBadgeText}>Positive Resilience Indicator</Text>
                  </View>
                )}
              </LinearGradient>

              {/* Options List */}
              <View style={styles.optionsList}>
                {OPTIONS.map((opt) => {
                  const isSelected = answers[currentQ?.id] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      onPress={() => handleSelectOption(opt.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Navigation Back / Next Row */}
              <View style={styles.navRow}>
                {currentStep > 0 ? (
                  <TouchableOpacity
                    style={styles.prevBtn}
                    onPress={() => setCurrentStep((prev) => prev - 1)}
                  >
                    <ChevronLeft size={18} color="#94A3B8" />
                    <Text style={styles.prevBtnText}>Previous</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                {answers[currentQ?.id] !== undefined && currentStep < 9 && (
                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={() => setCurrentStep((prev) => prev + 1)}
                  >
                    <Text style={styles.nextBtnText}>Next</Text>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : (
            /* Results Screen */
            <ScrollView
              contentContainerStyle={styles.resultsContent}
              showsVerticalScrollIndicator={false}
            >
              {isSubmitting ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#6366F1" />
                  <Text style={styles.loadingText}>
                    Analyzing psychological stress score...
                  </Text>
                </View>
              ) : (
                <>
                  <LinearGradient
                    colors={["#1e1b4b", "#2e1065"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.resultHero}
                  >
                    <View
                      style={[
                        styles.scoreOrb,
                        { borderColor: getLevelColor(result?.level) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreNumber,
                          { color: getLevelColor(result?.level) },
                        ]}
                      >
                        {result?.score || 0}
                      </Text>
                      <Text style={styles.scoreMax}>/ 40</Text>
                    </View>

                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: `${getLevelColor(result?.level)}25` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelBadgeText,
                          { color: getLevelColor(result?.level) },
                        ]}
                      >
                        {result?.level || "Moderate"} Stress Level
                      </Text>
                    </View>

                    <Text style={styles.resultSummary}>
                      {result?.level === "Low"
                        ? "Your stress levels are well-regulated. Keep up your positive self-care rituals."
                        : result?.level === "Moderate"
                        ? "You are experiencing moderate perceived stress. Small cognitive resets and breathing breaks can help prevent burnout."
                        : "High stress detected. Your nervous system is under significant pressure. Consider speaking with a counselor."}
                    </Text>
                  </LinearGradient>

                  {/* Recommendations */}
                  <View style={styles.recommendationsCard}>
                    <View style={styles.recomHeader}>
                      <Sparkles size={16} color="#818CF8" />
                      <Text style={styles.recomTitle}>Evidence-Based Action Plan</Text>
                    </View>
                    {result?.recommendations?.map((rec, i) => (
                      <View key={i} style={styles.recomItem}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <Text style={styles.recomText}>{rec}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.resultActions}>
                    {onOpenAria && (
                      <TouchableOpacity
                        style={styles.ariaActionBtn}
                        onPress={() => {
                          onClose();
                          onOpenAria();
                        }}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={["#7C3AED", "#6366F1"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.ariaGradient}
                        >
                          <Brain size={18} color="#FFFFFF" />
                          <Text style={styles.ariaActionText}>
                            Discuss with Aria AI Companion
                          </Text>
                          <ArrowRight size={16} color="#FFFFFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    <View style={styles.secondaryActionsRow}>
                      <TouchableOpacity
                        style={styles.retakeBtn}
                        onPress={handleRestart}
                      >
                        <RotateCcw size={16} color="#94A3B8" />
                        <Text style={styles.retakeText}>Retake Quiz</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                        <Text style={styles.doneText}>Save & Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
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
    maxHeight: "90%",
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
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
  quizContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressStepText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  progressPercentText: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "800",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  questionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
  },
  reverseBadge: {
    marginTop: 10,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reverseBadgeText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "700",
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionCardSelected: {
    backgroundColor: "rgba(99, 102, 241, 0.18)",
    borderColor: "#6366F1",
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#6366F1",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366F1",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  prevBtnText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resultHero: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    marginBottom: 16,
  },
  scoreOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginBottom: 14,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: "900",
  },
  scoreMax: {
    fontSize: 12,
    color: colors.textMuted,
  },
  levelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultSummary: {
    color: "#CBD5E1",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  recommendationsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  recomHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recomTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  recomItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  recomText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  resultActions: {
    gap: 10,
  },
  ariaActionBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  ariaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  ariaActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    gap: 6,
  },
  retakeText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
  doneBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#6366F1",
  },
  doneText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
