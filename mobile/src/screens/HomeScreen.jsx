import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import {
  Smile,
  Flame,
  Sparkles,
  Brain,
  Stethoscope,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
  Wind,
  CheckCircle2,
  BookOpen,
  Heart,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import DailyActivityCard from "../components/cards/DailyActivityCard";
import StepsCard from "../components/cards/StepsCard";
import ForYouRecommendationsCard from "../components/cards/ForYouRecommendationsCard";
import {
  SleepCard,
  WaterCard,
  HeartRateCard,
  StressCard,
  BloodOxygenCard,
} from "../components/cards/HealthGridCards";

export default function HomeScreen({
  activeFilter,
  onNavigateTab,
  onOpenQuickAdd,
  onOpenAria,
  onOpenCrisis,
  onOpenStress,
  onOpenSleep,
  onOpenHeartRate,
  onOpenJournal,
  onOpenGratitude,
  onOpenQuiz,
  onOpenReport,
}) {
  const [waterMl, setWaterMl] = useState(750);
  const [steps, setSteps] = useState(822);
  const [activeMins, setActiveMins] = useState(8);
  const [calories, setCalories] = useState(27);

  const handleAddWater = () => {
    setWaterMl((prev) => Math.min(3000, prev + 250));
  };

  const handleSelectActivity = () => {
    setSteps((prev) => prev + 200);
    setActiveMins((prev) => prev + 5);
    setCalories((prev) => prev + 15);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Aria AI Daily Reflection Prompt Card */}
      <TouchableOpacity
        style={styles.ariaHeroCard}
        onPress={onOpenAria}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#2e1065", "#4c1d95", "#312e81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ariaHeroGradient}
        >
          <View style={styles.ariaHeroTop}>
            <View style={styles.ariaHeroBadge}>
              <Brain size={12} color="#C084FC" />
              <Text style={styles.ariaHeroBadgeText}>ARIA WELLNESS COMPANION</Text>
            </View>
            <View style={styles.ariaPulseDot} />
          </View>
          <Text style={styles.ariaHeroTitle}>
            "How is your stress level today? Take 60s for mindful balance."
          </Text>
          <View style={styles.ariaHeroFooter}>
            <Text style={styles.ariaHeroAction}>Talk to Aria AI →</Text>
            <Sparkles size={16} color="#C084FC" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Daily Activity Neural Brain Card */}
      <DailyActivityCard
        steps={steps}
        stepGoal={6000}
        activeMinutes={activeMins}
        activeGoal={30}
        calories={calories}
        calorieGoal={300}
      />

      {/* For You ML Recommendations Engine */}
      <ForYouRecommendationsCard
        onOpenAria={onOpenAria}
        onOpenStress={onOpenStress}
        onOpenGratitude={onOpenGratitude}
        onOpenJournal={onOpenJournal}
        onOpenQuiz={onOpenQuiz}
      />

      {/* 2 Mental Wellness Quick Tiles: Mood Tracker & Habit Tracker */}
      <View style={styles.dualBannerRow}>
        {/* Mood Check-In Tile */}
        <TouchableOpacity
          style={[styles.tileCard, { borderColor: "rgba(99, 102, 241, 0.3)" }]}
          onPress={() => onNavigateTab("mood")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#1e1b4b", "#312e81"]}
            style={styles.tileGradient}
          >
            <View style={styles.tileHeader}>
              <View style={[styles.tileIconBox, { backgroundColor: "rgba(99, 102, 241, 0.2)" }]}>
                <Smile size={18} color="#818CF8" />
              </View>
              <Text style={styles.tileEmoji}>😊</Text>
            </View>
            <Text style={styles.tileTitle}>Mood Tracker</Text>
            <Text style={styles.tileSubtitle}>Score: 4.5 • Happy</Text>
            <View style={styles.tileActionRow}>
              <Text style={[styles.tileActionText, { color: "#A5B4FC" }]}>Log Mood →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Habits Consistency Tile */}
        <TouchableOpacity
          style={[styles.tileCard, { borderColor: "rgba(16, 185, 129, 0.3)" }]}
          onPress={() => onNavigateTab("habits")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#064e3b", "#065f46"]}
            style={styles.tileGradient}
          >
            <View style={styles.tileHeader}>
              <View style={[styles.tileIconBox, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
                <Flame size={18} color="#34D399" />
              </View>
              <Text style={styles.streakBadgeText}>🔥 7d</Text>
            </View>
            <Text style={styles.tileTitle}>Habit Tracker</Text>
            <Text style={styles.tileSubtitle}>3 of 5 done today</Text>
            <View style={styles.tileActionRow}>
              <Text style={[styles.tileActionText, { color: "#6EE7B7" }]}>View Streaks →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 3 Reflection & Analytics Quick Access Cards */}
      <View style={styles.tripleActionRow}>
        <TouchableOpacity
          style={styles.miniActionCard}
          onPress={onOpenJournal}
          activeOpacity={0.8}
        >
          <View style={[styles.miniIconBox, { backgroundColor: "rgba(56, 189, 248, 0.15)" }]}>
            <BookOpen size={16} color="#38BDF8" />
          </View>
          <Text style={styles.miniActionTitle}>AI Journal</Text>
          <Text style={styles.miniActionSub}>Reflect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.miniActionCard}
          onPress={onOpenGratitude}
          activeOpacity={0.8}
        >
          <View style={[styles.miniIconBox, { backgroundColor: "rgba(244, 63, 94, 0.15)" }]}>
            <Heart size={16} color="#F43F5E" />
          </View>
          <Text style={styles.miniActionTitle}>Gratitude</Text>
          <Text style={styles.miniActionSub}>3 Good Things</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.miniActionCard}
          onPress={onOpenReport}
          activeOpacity={0.8}
        >
          <View style={[styles.miniIconBox, { backgroundColor: "rgba(52, 211, 153, 0.15)" }]}>
            <TrendingUp size={16} color="#34D399" />
          </View>
          <Text style={styles.miniActionTitle}>Mind Report</Text>
          <Text style={styles.miniActionSub}>Weekly Score</Text>
        </TouchableOpacity>
      </View>

      {/* Steps Counter & Activity Bar */}
      <StepsCard
        steps={steps}
        stepGoal={6000}
        onSelectActivity={handleSelectActivity}
      />

      {/* Quick Services Showcase (Therapists, Community, Masterclasses) */}
      <View style={styles.quickServicesContainer}>
        {/* Therapists Directory Shortcut */}
        <TouchableOpacity
          style={styles.serviceRowItem}
          onPress={() => onNavigateTab("therapists")}
          activeOpacity={0.8}
        >
          <View style={[styles.serviceIcon, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
            <Stethoscope size={18} color="#818CF8" />
          </View>
          <View style={styles.serviceMeta}>
            <Text style={styles.serviceTitle}>Certified Therapists</Text>
            <Text style={styles.serviceSubtitle}>1-on-1 confidential video therapy</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Masterclasses & Learning Shortcut */}
        <TouchableOpacity
          style={styles.serviceRowItem}
          onPress={() => onNavigateTab("courses")}
          activeOpacity={0.8}
        >
          <View style={[styles.serviceIcon, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
            <GraduationCap size={18} color="#C084FC" />
          </View>
          <View style={styles.serviceMeta}>
            <Text style={styles.serviceTitle}>Wellness Masterclasses</Text>
            <Text style={styles.serviceSubtitle}>Evidence-based cognitive drills</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* 2-Column Health Tiles Grid (Physical Health & Biometrics) */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <StressCard
            stressLevel="Calm"
            score={24}
            onPress={onOpenStress}
          />
          <SleepCard
            hours={7.5}
            score={84}
            onPress={onOpenSleep}
          />
        </View>

        <View style={styles.gridRow}>
          <HeartRateCard
            bpm={72}
            onPress={onOpenHeartRate}
          />
          <WaterCard
            waterMl={waterMl}
            targetMl={2000}
            onAddWater={handleAddWater}
          />
        </View>
      </View>

      {/* Spacing for Floating Navigation Bar */}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  ariaHeroCard: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.25)",
  },
  ariaHeroGradient: {
    padding: 16,
  },
  ariaHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ariaHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(192, 132, 252, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 6,
  },
  ariaHeroBadgeText: {
    color: "#E9D5FF",
    fontSize: 10,
    fontWeight: "700",
  },
  ariaPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A855F7",
  },
  ariaHeroTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 21,
    marginBottom: 10,
  },
  ariaHeroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ariaHeroAction: {
    color: "#C084FC",
    fontSize: 12,
    fontWeight: "700",
  },
  dualBannerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  tileCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  tileGradient: {
    padding: 14,
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmoji: {
    fontSize: 18,
  },
  streakBadgeText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "700",
  },
  tileTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  tileSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  tileActionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tileActionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  quickServicesContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  serviceRowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceMeta: {
    flex: 1,
  },
  serviceTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  serviceSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  tripleActionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  miniActionCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  miniIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  miniActionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  miniActionSub: {
    fontSize: 10,
    color: "#94A3B8",
  },
});

