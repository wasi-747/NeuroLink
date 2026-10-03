import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Star,
  Play,
  CheckCircle2,
  Award,
  Sparkles,
  Headphones,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { getCoursesApi } from "../services/api";

const CATEGORIES = ["All", "Stress", "Anxiety", "Sleep", "Mindfulness"];

export default function CoursesScreen({ onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const data = await getCoursesApi();
    setCourses(data);
    setLoading(false);
  };

  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter(
          (c) => (c?.category || "").toLowerCase() === (activeCategory || "").toLowerCase()
        );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <LinearGradient
        colors={["#3b0764", "#581c87", "#1e1b4b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.badge}>
          <GraduationCap size={12} color="#C084FC" />
          <Text style={styles.badgeText}>EVIDENCE-BASED MASTERCLASSES</Text>
        </View>
        <Text style={styles.headerTitle}>Psychoeducation & Growth</Text>
        <Text style={styles.headerSubtitle}>
          Interactive bite-sized courses designed by neuroscientists to rewire anxiety, conquer stress, and sleep deeply.
        </Text>
      </LinearGradient>

      {/* Category Pills */}
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

      {/* Courses List */}
      {loading ? (
        <ActivityIndicator color="#A855F7" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.coursesList}>
          {filteredCourses.map((course, index) => {
            const courseKey = course._id || course.id || index;
            const instructorName =
              typeof course.instructor === "object"
                ? (course.instructor?.name || "NeuroLink Faculty")
                : (course.instructor || "NeuroLink Faculty");

            return (
              <TouchableOpacity
                key={courseKey}
                style={styles.courseCard}
                onPress={() => onSelectCourse(course)}
                activeOpacity={0.85}
              >
                {/* Top Banner Gradient */}
                <LinearGradient
                  colors={course.thumbnailColor || ["#1e1b4b", "#4338ca"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.courseTopGradient}
                >
                  <View style={styles.courseHeaderRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>
                        {course.category}
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingBadgeText}>{course.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.courseCardTitle}>{course.title}</Text>
                  <Text style={styles.instructorText}>
                    By {instructorName}
                  </Text>
                </LinearGradient>

              {/* Course Meta Body */}
              <View style={styles.courseBody}>
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {course.description}
                </Text>

                {/* Info Row: Duration & Lessons */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={13} color={colors.textMuted} />
                    <Text style={styles.metaText}>{course.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <BookOpen size={13} color={colors.textMuted} />
                    <Text style={styles.metaText}>
                      {course.lessonsCount} lessons
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Award size={13} color={colors.textMuted} />
                    <Text style={styles.metaText}>{course.level}</Text>
                  </View>
                </View>

                {/* Progress bar if started */}
                {course.progress > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>
                        {course.progress}%
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${course.progress}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Start / Continue Button */}
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => onSelectCourse(course)}
                >
                  <LinearGradient
                    colors={["#7C3AED", "#6366F1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startBtnGradient}
                  >
                    <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.startBtnText}>
                      {course.progress > 0
                        ? "Continue Lesson"
                        : "Start Masterclass"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
    borderColor: "rgba(192, 132, 252, 0.2)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(192, 132, 252, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 6,
  },
  badgeText: {
    color: "#E9D5FF",
    fontSize: 11,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#E2E8F0",
    lineHeight: 18,
  },
  categoryPills: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderColor: "#A855F7",
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#E9D5FF",
    fontWeight: "700",
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  courseTopGradient: {
    padding: 18,
    paddingBottom: 20,
  },
  courseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  courseCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  instructorText: {
    fontSize: 12,
    color: "#CBD5E1",
  },
  courseBody: {
    padding: 16,
  },
  courseDescription: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  progressSection: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  progressValue: {
    fontSize: 11,
    color: "#A855F7",
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A855F7",
    borderRadius: 3,
  },
  startBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  startBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 8,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
