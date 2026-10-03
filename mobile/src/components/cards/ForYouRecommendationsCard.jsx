import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Sparkles,
  Brain,
  Wind,
  Heart,
  BookOpen,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import { getSmartRecommendationsApi } from "../../services/api";

export default function ForYouRecommendationsCard({
  onOpenAria,
  onOpenStress,
  onOpenGratitude,
  onOpenJournal,
  onOpenQuiz,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const res = await getSmartRecommendationsApi();
      setData(res);
    } catch (err) {
      console.warn("Recommendations load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const topIssue = data?.topIssue || "stress";
  const recommendations = data?.recommendations || {};
  const message =
    recommendations.message ||
    "Based on your recent cognitive biometrics, we tailored these evidence-based techniques to help you restore balance.";

  const issueLabel =
    topIssue === "anxiety"
      ? "Anxiety & Nervous System Reset"
      : topIssue === "depression"
      ? "Mood Lift & Neuroplasticity"
      : topIssue === "sleep"
      ? "Circadian Rhythm & Rest"
      : "Stress & Mind Equilibrium";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1e1b4b", "#2e1065", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Header Badge */}
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Sparkles size={12} color="#C084FC" />
            <Text style={styles.badgeText}>FOR YOU • ML INSIGHTS</Text>
          </View>
          <View style={styles.neuralIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.neuralText}>Active Calibration</Text>
          </View>
        </View>

        {/* Issue Title */}
        <Text style={styles.issueHeading}>{issueLabel}</Text>
        <Text style={styles.messageText}>{message}</Text>

        {/* Action Drill Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsLabel}>Recommended Micro-Practices:</Text>
          <View style={styles.actionButtonsGrid}>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={onOpenStress}
              activeOpacity={0.8}
            >
              <Wind size={14} color="#38BDF8" />
              <Text style={styles.actionChipText}>4-7-8 Breathing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              onPress={onOpenGratitude}
              activeOpacity={0.8}
            >
              <Heart size={14} color="#FDA4AF" />
              <Text style={styles.actionChipText}>Gratitude 3x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              onPress={onOpenJournal}
              activeOpacity={0.8}
            >
              <BookOpen size={14} color="#818CF8" />
              <Text style={styles.actionChipText}>AI Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              onPress={onOpenQuiz}
              activeOpacity={0.8}
            >
              <Zap size={14} color="#F59E0B" />
              <Text style={styles.actionChipText}>PSS-10 Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Aria Direct Consult Footer */}
        <TouchableOpacity
          style={styles.ariaRow}
          onPress={onOpenAria}
          activeOpacity={0.85}
        >
          <View style={styles.ariaLeft}>
            <Brain size={16} color="#C084FC" />
            <Text style={styles.ariaPromptText}>
              Debrief with Aria AI about your day
            </Text>
          </View>
          <ArrowRight size={15} color="#C084FC" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  cardGradient: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.25)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(192, 132, 252, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#C084FC",
    letterSpacing: 0.6,
  },
  neuralIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  neuralText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  issueHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 19,
    marginBottom: 14,
  },
  actionsContainer: {
    marginBottom: 14,
  },
  actionsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  actionButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ariaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(192, 132, 252, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.2)",
  },
  ariaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ariaPromptText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E9D5FF",
  },
});
