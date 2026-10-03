import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Brain,
  Sparkles,
  BookOpen,
  Wind,
  ChevronRight,
  Stethoscope,
  Zap,
} from "lucide-react-native";
import { colors } from "../../../theme/colors";
import api from "../../../services/api";

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK_DATA = {
  focusArea: "Exam Anxiety & Stress Management",
  drills: [
    { id: "d1", name: "4-7-8 Breathing", description: "Activate vagus nerve in 60 seconds", icon: "wind" },
    { id: "d2", name: "5-4-3-2-1 Grounding", description: "Anchor to present moment", icon: "zap" },
  ],
  articles: [
    { id: "a1", title: "Understanding Academic Burnout", readTime: "4 min read", tag: "Stress" },
    { id: "a2", title: "CBT Techniques for Exam Anxiety", readTime: "6 min read", tag: "Anxiety" },
    { id: "a3", title: "Sleep Optimization for Students", readTime: "5 min read", tag: "Sleep" },
  ],
  therapistSpecialization: "Cognitive Behavioural Therapy (CBT)",
};

// ─── Shimmer Component (recommended default loading state) ────────────────────
function ShimmerBar({ width, height = 14, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 6, opacity },
        style,
      ]}
    />
  );
}

function ShimmerSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <ShimmerBar width="60%" height={16} style={{ marginBottom: 16 }} />
      <ShimmerBar width="90%" height={12} style={{ marginBottom: 8 }} />
      <ShimmerBar width="75%" height={12} style={{ marginBottom: 20 }} />
      <ShimmerBar width="40%" height={12} style={{ marginBottom: 8 }} />
      <ShimmerBar width="80%" height={38} style={{ borderRadius: 12, marginBottom: 12 }} />
      <ShimmerBar width="80%" height={38} style={{ borderRadius: 12, marginBottom: 20 }} />
      <ShimmerBar width="100%" height={44} style={{ borderRadius: 14 }} />
    </View>
  );
}

// ─── Drill Icon Helper ────────────────────────────────────────────────────────
function DrillIcon({ type, size = 16, color = "#FFFFFF" }) {
  if (type === "wind") return <Wind size={size} color={color} />;
  return <Zap size={size} color={color} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ForYouRecommendationsCard({ onOpenAria, onSelectArticle, onSelectTool }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRecommendations();
    // Pulsing glow on the header
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await api.get("/ml/recommendations");
      setData(res.data?.data || FALLBACK_DATA);
    } catch (_) {
      setData(FALLBACK_DATA);
    } finally {
      setIsLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#1E1B4B", "#312E81", "#4338CA"]} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <ShimmerSkeleton />
      </LinearGradient>
    );
  }

  const rec = data || FALLBACK_DATA;

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <LinearGradient
        colors={["#1E1B4B", "#2D2A7A", "#4338CA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Glowing orb decoration */}
        <Animated.View style={[styles.glowOrb, { opacity: glowOpacity }]} />

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerIconBg}>
            <Brain size={18} color="#C7D2FE" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>FOR YOU</Text>
            <Text style={styles.cardTitle}>ML Wellness Recommendations</Text>
          </View>
          <Sparkles size={16} color="rgba(199,210,254,0.6)" />
        </View>

        {/* Focus Area */}
        <View style={styles.focusRow}>
          <View style={styles.focusBadge}>
            <Text style={styles.focusLabel}>Current Focus</Text>
            <Text style={styles.focusArea}>{rec.focusArea}</Text>
          </View>
        </View>

        {/* Cognitive Drills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Cognitive Drills</Text>
          <View style={styles.drillsCol}>
            {rec.drills.map((drill) => (
              <TouchableOpacity
                key={drill.id}
                style={styles.drillItem}
                onPress={() => onSelectTool && onSelectTool(drill)}
                activeOpacity={0.8}
              >
                <View style={styles.drillIconBg}>
                  <DrillIcon type={drill.icon} size={15} color="#A5B4FC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drillName}>{drill.name}</Text>
                  <Text style={styles.drillDesc}>{drill.description}</Text>
                </View>
                <ChevronRight size={14} color="rgba(165,180,252,0.5)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Psychoeducation Articles</Text>
          <View style={styles.articlesCol}>
            {rec.articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleItem}
                onPress={() => onSelectArticle && onSelectArticle(article)}
                activeOpacity={0.8}
              >
                <BookOpen size={14} color="#818CF8" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                </View>
                <View style={styles.readTimeBadge}>
                  <Text style={styles.readTimeText}>{article.readTime}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Therapist Specialization */}
        <View style={styles.therapistRow}>
          <Stethoscope size={15} color="#A5B4FC" />
          <Text style={styles.therapistLabel}>Suggested Specialist:</Text>
          <Text style={styles.therapistValue}>{rec.therapistSpecialization}</Text>
        </View>

        {/* Aria CTA */}
        <TouchableOpacity
          style={styles.ariaBtn}
          onPress={() => onOpenAria && onOpenAria()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["rgba(99,102,241,0.3)", "rgba(129,140,248,0.2)"]}
            style={styles.ariaBtnInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Sparkles size={16} color="#E9D5FF" />
            <Text style={styles.ariaBtnText}>Talk to Aria about these recommendations</Text>
            <ChevronRight size={14} color="#E9D5FF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardGradient: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    overflow: "hidden",
    position: "relative",
  },

  // Glow Orb
  glowOrb: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(99,102,241,0.4)",
  },

  // Header
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconBg: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(99,102,241,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  cardLabel: { color: "rgba(199,210,254,0.7)", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 1 },

  // Focus
  focusRow: {},
  focusBadge: {
    backgroundColor: "rgba(99,102,241,0.2)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  focusLabel: { color: "rgba(199,210,254,0.7)", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  focusArea: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginTop: 2 },

  // Section
  section: { gap: 8 },
  sectionTitle: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },

  // Drills
  drillsCol: { gap: 6 },
  drillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  drillIconBg: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: "rgba(99,102,241,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  drillName: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  drillDesc: { color: "rgba(148,163,184,0.8)", fontSize: 11, marginTop: 1 },

  // Articles
  articlesCol: { gap: 6 },
  articleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  articleTitle: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600", flex: 1 },
  readTimeBadge: {
    backgroundColor: "rgba(99,102,241,0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  readTimeText: { color: "#A5B4FC", fontSize: 10, fontWeight: "700" },

  // Therapist
  therapistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    flexWrap: "wrap",
  },
  therapistLabel: { color: "rgba(165,180,252,0.8)", fontSize: 11, fontWeight: "600" },
  therapistValue: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  // Aria Button
  ariaBtn: { borderRadius: 14, overflow: "hidden" },
  ariaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.4)",
    borderRadius: 14,
  },
  ariaBtnText: { flex: 1, color: "#E9D5FF", fontSize: 13, fontWeight: "700" },

  // Skeleton
  skeletonContainer: { padding: 4, gap: 0 },
});
