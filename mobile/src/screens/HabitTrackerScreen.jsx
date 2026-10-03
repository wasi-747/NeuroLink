import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Flame,
  Check,
  Plus,
  Brain,
  Droplets,
  Dumbbell,
  PhoneOff,
  Book,
  Sparkles,
  Award,
  Target,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { getHabitsApi, logHabitApi } from "../services/api";
import { getLocalHabits, toggleLocalHabit, saveLocalHabits } from "../services/storageService";

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

const CATEGORIES = ["All", "Mind", "Health", "Fitness", "Sleep"];

const HABIT_ICONS = {
  Brain: Brain,
  Droplets: Droplets,
  Dumbbell: Dumbbell,
  PhoneOff: PhoneOff,
  SmartphoneOff: PhoneOff,
  Book: Book,
};

export default function HabitTrackerScreen({ onOpenAddHabit }) {
  const [habits, setHabits] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    const local = await getLocalHabits();
    if (local && local.length > 0) {
      setHabits(local);
      setLoading(false);
    }
    try {
      const data = await getHabitsApi();
      if (data && data.length > 0) {
        setHabits(data);
        saveLocalHabits(data);
      }
    } catch (e) {
      console.log("Offline mode: loaded local habits.");
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitComplete = async (id) => {
    const updated = await toggleLocalHabit(id);
    setHabits([...updated]);
    try {
      await logHabitApi(id);
    } catch (err) {
      console.log("Habit logged locally:", err.message);
    }
  };

  const filteredHabits =
    activeCategory === "All"
      ? habits
      : habits.filter(
          (h) => (h?.category || "").toLowerCase() === (activeCategory || "").toLowerCase()
        );

  const completedCount = habits.filter((h) => h.completedToday).length;
  const progressPercent =
    habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#064e3b", "#065f46", "#042f2e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overviewCard}
      >
        <View style={styles.overviewHeader}>
          <View>
            <View style={styles.badge}>
              <Flame size={12} color="#6EE7B7" />
              <Text style={styles.badgeText}>NEURAL HABIT MATRIX</Text>
            </View>
            <Text style={styles.overviewTitle}>Daily Consistency</Text>
            <Text style={styles.overviewSubtitle}>
              {completedCount} of {habits.length} daily habits completed today
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
            <Text style={styles.progressSubLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Flame size={16} color="#F59E0B" />
            <Text style={styles.statBoxValue}>15 Days</Text>
            <Text style={styles.statBoxLabel}>Best Streak</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Award size={16} color="#34D399" />
            <Text style={styles.statBoxValue}>Top 5%</Text>
            <Text style={styles.statBoxLabel}>Discipline</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Target size={16} color="#60A5FA" />
            <Text style={styles.statBoxValue}>{habits.length}</Text>
            <Text style={styles.statBoxLabel}>Active Routines</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Category Pills & Add Button */}
      <View style={styles.controlsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addHabitBtn}
          onPress={onOpenAddHabit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#059669", "#10B981"]}
            style={styles.addHabitGradient}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addHabitBtnText}>New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Habits List */}
      {loading ? (
        <ActivityIndicator color="#10B981" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.habitsList}>
          {filteredHabits.map((habit, index) => {
            const habitId = habit._id || habit.id || index;
            const IconComponent = HABIT_ICONS[habit.icon] || Sparkles;
            return (
              <View key={habitId} style={styles.habitCard}>
                <View style={styles.habitMainRow}>
                  {/* Icon & Title */}
                  <View style={styles.habitInfoGroup}>
                    <View
                      style={[
                        styles.habitIconBox,
                        habit.completedToday && styles.habitIconBoxDone,
                      ]}
                    >
                      <IconComponent
                        size={20}
                        color={habit.completedToday ? "#10B981" : "#A7F3D0"}
                      />
                    </View>
                    <View style={styles.habitTitleGroup}>
                      <Text
                        style={[
                          styles.habitName,
                          habit.completedToday && styles.habitNameDone,
                        ]}
                      >
                        {habit.name}
                      </Text>
                      <View style={styles.streakRow}>
                        <Flame size={13} color="#F59E0B" />
                        <Text style={styles.streakText}>
                          {habit.streak} day streak
                        </Text>
                        <Text style={styles.habitCategoryTag}>
                          • {habit.category}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Completion Toggle Button */}
                  <TouchableOpacity
                    style={[
                      styles.checkCircle,
                      habit.completedToday && styles.checkCircleDone,
                    ]}
                    onPress={() => toggleHabitComplete(habit._id || habit.id)}
                    activeOpacity={0.7}
                  >
                    {habit.completedToday && <Check size={18} color="#FFFFFF" />}
                  </TouchableOpacity>
                </View>

                {/* 7-Day Mini Dots Tracker */}
                <View style={styles.dotsRow}>
                  {DAYS_OF_WEEK.map((d, index) => {
                    const isToday = index === 4; // Mock today as Friday/current
                    const isFilled = index <= 4 && (index < 4 || habit.completedToday);

                    return (
                      <View key={index} style={styles.dayDotContainer}>
                        <Text
                          style={[
                            styles.dayDotLabel,
                            isToday && { color: "#34D399", fontWeight: "700" },
                          ]}
                        >
                          {d}
                        </Text>
                        <View
                          style={[
                            styles.dayDot,
                            isFilled && styles.dayDotFilled,
                            isToday && styles.dayDotToday,
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
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
  overviewCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 6,
  },
  badgeText: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "700",
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 13,
    color: "#A7F3D0",
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderWidth: 3,
    borderColor: "#34D399",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  progressSubLabel: {
    color: "#6EE7B7",
    fontSize: 10,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#34D399",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statBoxValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  statBoxLabel: {
    color: "#94A3B8",
    fontSize: 11,
  },
  statBoxDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  categoryPills: {
    flexDirection: "row",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#34D399",
    fontWeight: "700",
  },
  addHabitBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  addHabitGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  addHabitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  habitsList: {
    gap: 12,
  },
  habitCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  habitMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  habitInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  habitIconBoxDone: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  habitTitleGroup: {
    flex: 1,
  },
  habitName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  habitNameDone: {
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  habitCategoryTag: {
    color: colors.textMuted,
    fontSize: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dayDotContainer: {
    alignItems: "center",
    gap: 4,
  },
  dayDotLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dayDotFilled: {
    backgroundColor: "#10B981",
  },
  dayDotToday: {
    transform: [{ scale: 1.3 }],
    borderWidth: 1,
    borderColor: "#34D399",
  },
});
