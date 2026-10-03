import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Wind,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  CheckCircle,
  Activity,
  HeartHandshake,
  Zap,
} from "lucide-react-native";
import { colors } from "../../theme/colors";

export default function StressDetailModal({ visible, onClose, onOpenAria, onTakeQuiz }) {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale (4s)");
  const breathAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      stopBreathing();
    }
  }, [visible]);

  const startBreathing = () => {
    setIsBreathing(true);
    runBreathCycle();
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathPhase("Ready");
    Animated.timing(breathAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const runBreathCycle = () => {
    // 1. Inhale: 4s
    setBreathPhase("Inhale through nose (4s)");
    Animated.timing(breathAnim, {
      toValue: 1.45,
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      // 2. Hold: 7s
      setBreathPhase("Hold gentle (7s)");
      timerRef.current = setTimeout(() => {
        // 3. Exhale: 8s
        setBreathPhase("Slow exhale through mouth (8s)");
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();

        timerRef.current = setTimeout(() => {
          runBreathCycle();
        }, 8000);
      }, 7000);
    }, 4000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Stress & Neural Calm</Text>
              <Text style={styles.headerSubtitle}>Cortisol regulation & somatic reset</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Stress Telemetry Card */}
            <LinearGradient
              colors={["#78350f", "#451a03"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.telemetryCard}
            >
              <View style={styles.telemetryTop}>
                <View>
                  <Text style={styles.telemetryLabel}>REAL-TIME STRESS INDEX</Text>
                  <Text style={styles.telemetryScore}>24 / 100</Text>
                </View>
                <View style={styles.badgeCalm}>
                  <Activity size={14} color="#34D399" />
                  <Text style={styles.badgeCalmText}>Calm & Regulated</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.barTrack}>
                <LinearGradient
                  colors={["#34D399", "#F59E0B", "#EF4444"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBar}
                />
                {/* Pointer indicator */}
                <View style={[styles.barPointer, { left: "24%" }]} />
              </View>
              <Text style={styles.telemetryFooter}>
                Your autonomic nervous system is in a balanced parasympathetic state.
              </Text>
            </LinearGradient>

            {/* 4-7-8 Breathwork Pacer */}
            <View style={styles.breathCard}>
              <View style={styles.sectionHeaderRow}>
                <Wind size={18} color="#38BDF8" />
                <Text style={styles.sectionTitle}>4-7-8 Somatic Breathwork</Text>
              </View>
              <Text style={styles.sectionDesc}>
                Proven clinical breathing rhythm to activate the vagus nerve and downregulate acute cortisol within 60 seconds.
              </Text>

              {/* Animated Breath Visualizer Orb */}
              <View style={styles.orbContainer}>
                <Animated.View
                  style={[
                    styles.breathOrb,
                    {
                      transform: [{ scale: breathAnim }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#0284c7", "#38bdf8", "#818cf8"]}
                    style={styles.orbGradient}
                  >
                    <Wind size={32} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              </View>

              <Text style={styles.breathPhaseText}>{breathPhase}</Text>

              {/* Start / Stop Button */}
              <TouchableOpacity
                style={styles.breathControlBtn}
                onPress={isBreathing ? stopBreathing : startBreathing}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isBreathing ? ["#991B1B", "#DC2626"] : ["#0284C7", "#0284C7"]}
                  style={styles.breathControlGradient}
                >
                  {isBreathing ? (
                    <>
                      <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.controlBtnText}>Stop Pacer</Text>
                    </>
                  ) : (
                    <>
                      <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.controlBtnText}>Start 4-7-8 Breathing</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick De-Stress Drills */}
            <View style={styles.drillsCard}>
              <Text style={styles.drillsTitle}>Cognitive Stress Protocols</Text>

              <View style={styles.drillItem}>
                <CheckCircle size={18} color="#818CF8" />
                <View style={styles.drillMeta}>
                  <Text style={styles.drillName}>5-4-3-2-1 Grounding</Text>
                  <Text style={styles.drillSub}>Anchor awareness to external physical senses</Text>
                </View>
              </View>

              <View style={styles.drillItem}>
                <CheckCircle size={18} color="#34D399" />
                <View style={styles.drillMeta}>
                  <Text style={styles.drillName}>Physiological Sigh</Text>
                  <Text style={styles.drillSub}>Two quick inhales followed by one long exhale</Text>
                </View>
              </View>
            </View>

            {/* PSS-10 Clinical Stress Assessment Button */}
            {onTakeQuiz && (
              <TouchableOpacity
                style={styles.quizTriggerCard}
                onPress={() => {
                  onClose();
                  onTakeQuiz();
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#b45309", "#d97706"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quizGradient}
                >
                  <Zap size={20} color="#FEF3C7" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quizCardTitle}>Take PSS-10 Stress Assessment</Text>
                    <Text style={styles.quizCardSubtitle}>10 clinical questions to evaluate stress</Text>
                  </View>
                  <ChevronRight size={18} color="#FEF3C7" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Aria AI Support Button */}
            <TouchableOpacity
              style={styles.ariaTriggerCard}
              onPress={() => {
                onClose();
                onOpenAria && onOpenAria();
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#4c1d95", "#6d28d9"]}
                style={styles.ariaGradient}
              >
                <Brain size={20} color="#E9D5FF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ariaCardTitle}>Process Stress with Aria AI</Text>
                  <Text style={styles.ariaCardSubtitle}>Guided emotional defusion & reframing</Text>
                </View>
                <Sparkles size={18} color="#E9D5FF" />
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: "#0B1320",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  telemetryCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  telemetryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  telemetryLabel: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  telemetryScore: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  badgeCalm: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  badgeCalmText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "700",
  },
  barTrack: {
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
  },
  gradientBar: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  barPointer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  telemetryFooter: {
    color: "#FEF3C7",
    fontSize: 12,
    lineHeight: 16,
  },
  breathCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    alignItems: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionDesc: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  orbContainer: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  breathOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  orbGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  breathPhaseText: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 14,
  },
  breathControlBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  breathControlGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  controlBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  drillsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  drillsTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  drillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  drillMeta: {
    flex: 1,
  },
  drillName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  drillSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  ariaTriggerCard: {
    borderRadius: 18,
    overflow: "hidden",
  },
  ariaGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  ariaCardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  ariaCardSubtitle: {
    color: "#E9D5FF",
    fontSize: 11,
  },
  quizTriggerCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginVertical: 4,
  },
  quizGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  quizCardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  quizCardSubtitle: {
    color: "#FEF3C7",
    fontSize: 11,
  },
});
