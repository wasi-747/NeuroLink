import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { colors } from "../../theme/colors";
import {
  Smile,
  Flame,
  BookOpen,
  Wind,
  Brain,
  Stethoscope,
  ShieldAlert,
  Droplets,
  Heart,
  Moon,
  ChevronLeft,
  Zap,
} from "lucide-react-native";

export default function QuickAddModal({ visible, onClose, onSelectOption }) {
  const options = [
    { id: "mood", label: "Log Mood", icon: Smile, color: "#818CF8", bg: "rgba(99, 102, 241, 0.15)" },
    { id: "journal", label: "AI Journal", icon: BookOpen, color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" },
    { id: "gratitude", label: "Gratitude 3x", icon: Heart, color: "#F43F5E", bg: "rgba(244, 63, 94, 0.15)" },
    { id: "habit", label: "Habit Check", icon: Flame, color: "#34D399", bg: "rgba(16, 185, 129, 0.15)" },
    { id: "quiz", label: "Stress Quiz", icon: Zap, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
    { id: "breathe", label: "4-7-8 Reset", icon: Wind, color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" },
    { id: "aria", label: "Talk to Aria AI", icon: Brain, color: "#C084FC", bg: "rgba(192, 132, 252, 0.15)" },
    { id: "therapist", label: "Book Therapist", icon: Stethoscope, color: "#A5B4FC", bg: "rgba(99, 102, 241, 0.15)" },
    { id: "crisis", label: "Crisis SOS", icon: ShieldAlert, color: "#FB7185", bg: "rgba(244, 63, 94, 0.15)" },
    { id: "sleep", label: "Log Sleep", icon: Moon, color: "#A5B4FC", bg: "rgba(79, 70, 229, 0.15)" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
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
            <Text style={styles.headerTitle}>Quick Action & Check-In</Text>
          </View>

          <Text style={styles.sectionLabel}>Select Action</Text>

          {/* 2-Column Grid */}
          <View style={styles.gridContainer}>
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.gridItem}
                  activeOpacity={0.75}
                  onPress={() => {
                    onSelectOption && onSelectOption(opt.id);
                    onClose();
                  }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: opt.bg }]}>
                    <Icon size={20} color={opt.color} />
                  </View>
                  <Text style={styles.itemLabel}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: "#131C2A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 44,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  gridItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#182436",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 1,
  },
});

