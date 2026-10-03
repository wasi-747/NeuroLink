import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  Lightbulb,
  Headphones,
  Check,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import { updateCourseProgressApi } from "../../services/api";

export default function CourseLessonModal({ visible, course, onClose }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!course) return null;

  const handleToggleComplete = async () => {
    setIsCompleted(true);
    const courseId = course._id || course.id;
    try {
      await updateCourseProgressApi(courseId, "lesson_1", true);
    } catch (err) {
      console.log("Course progress synced locally");
    }
    setTimeout(() => {
      onClose();
    }, 1200);
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
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.courseBadge}>
                {course.category.toUpperCase()} MASTERCLASS
              </Text>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {course.title}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Audio Companion Card */}
            <LinearGradient
              colors={["#3b0764", "#581c87"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.audioPlayerCard}
            >
              <View style={styles.audioMeta}>
                <View style={styles.audioIconCircle}>
                  <Headphones size={20} color="#C084FC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.audioTitle}>
                    Lesson 1: Neurobiology of Stress
                  </Text>
                  <Text style={styles.audioSubtitle}>
                    Guided audio walkthrough • 6:45 mins
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.playAudioBtn}
                onPress={() => setIsPlayingAudio(!isPlayingAudio)}
              >
                {isPlayingAudio ? (
                  <Pause size={18} color="#FFFFFF" />
                ) : (
                  <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                )}
                <Text style={styles.playAudioText}>
                  {isPlayingAudio ? "Pause Audio" : "Listen to Audio Lesson"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Lesson Breakdown Text */}
            <Text style={styles.sectionHeader}>Key Cognitive Takeaways</Text>
            <View style={styles.takeawayCard}>
              <View style={styles.takeawayRow}>
                <Lightbulb size={16} color="#F59E0B" />
                <Text style={styles.takeawayHeading}>The Amygdala Hijack</Text>
              </View>
              <Text style={styles.takeawayBody}>
                When acute stress triggers, your prefrontal cortex dials down while your amygdala takes executive control. Labeling the emotion ("I am experiencing panic right now") reduces amygdala reactivity by up to 40%.
              </Text>
            </View>

            <View style={styles.takeawayCard}>
              <View style={styles.takeawayRow}>
                <Sparkles size={16} color="#38BDF8" />
                <Text style={styles.takeawayHeading}>Physiological Sigh</Text>
              </View>
              <Text style={styles.takeawayBody}>
                Two rapid inhales through the nose followed by a long, slow exhale through the mouth reinflates collapsed alveoli in the lungs and rapidly slows cardiac pacing.
              </Text>
            </View>

            {/* Practical Action Step */}
            <View style={styles.actionPromptCard}>
              <Text style={styles.actionPromptTitle}>Daily Practice Drill</Text>
              <Text style={styles.actionPromptDesc}>
                Perform 3 physiological sighs before your next meeting or whenever you notice muscular tension in your shoulders or jaw.
              </Text>
            </View>
          </ScrollView>

          {/* Complete Lesson Button */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleToggleComplete}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isCompleted
                  ? ["#059669", "#10B981"]
                  : ["#7C3AED", "#6366F1"]
              }
              style={styles.completeGradient}
            >
              {isCompleted ? (
                <View style={styles.rowAlign}>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.completeBtnText}>Lesson Completed!</Text>
                </View>
              ) : (
                <View style={styles.rowAlign}>
                  <Check size={18} color="#FFFFFF" />
                  <Text style={styles.completeBtnText}>
                    Mark Lesson as Completed
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  courseBadge: {
    fontSize: 10,
    color: "#C084FC",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  audioPlayerCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  audioMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  audioIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  audioTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  audioSubtitle: {
    color: "#E9D5FF",
    fontSize: 11,
    marginTop: 2,
  },
  playAudioBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  playAudioText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  takeawayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 12,
  },
  takeawayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  takeawayHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  takeawayBody: {
    fontSize: 13,
    color: "#CBD5E1",
    lineHeight: 19,
  },
  actionPromptCard: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    marginBottom: 14,
  },
  actionPromptTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C7D2FE",
    marginBottom: 4,
  },
  actionPromptDesc: {
    fontSize: 12,
    color: "#E0E7FF",
    lineHeight: 18,
  },
  completeBtn: {
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  completeGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
