import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Plus,
  Brain,
  Droplets,
  Dumbbell,
  PhoneOff,
  Book,
  Moon,
  Sun,
  Coffee,
  HeartPulse,
  Sparkles,
  CheckCircle2,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import { createHabitApi } from "../../services/api";

const HABIT_ICONS = [
  { id: "Brain", label: "Mind", icon: Brain },
  { id: "Droplets", label: "Water", icon: Droplets },
  { id: "Dumbbell", label: "Fitness", icon: Dumbbell },
  { id: "PhoneOff", label: "Digital Detox", icon: PhoneOff },
  { id: "Book", label: "Reading", icon: Book },
  { id: "Moon", label: "Sleep", icon: Moon },
  { id: "Sun", label: "Morning", icon: Sun },
  { id: "HeartPulse", label: "Cardio", icon: HeartPulse },
];

const CATEGORIES = ["Mind", "Health", "Fitness", "Sleep"];

export default function AddHabitModal({ visible, onClose, onHabitAdded }) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0].id);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [frequency, setFrequency] = useState("Daily");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    const newHabitObj = {
      name: name.trim(),
      category: selectedCategory.toLowerCase(),
      frequency: frequency.toLowerCase(),
      icon: selectedIcon,
    };

    try {
      const created = await createHabitApi(newHabitObj);
      setSuccess(true);
      if (onHabitAdded) {
        onHabitAdded(created || { ...newHabitObj, id: Date.now().toString(), streak: 0, completedToday: false });
      }
    } catch (err) {
      console.warn("createHabit fallback:", err.message);
      setSuccess(true);
      if (onHabitAdded) {
        onHabitAdded({ ...newHabitObj, id: Date.now().toString(), streak: 0, completedToday: false });
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        onClose();
      }, 1200);
    }
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
            <View>
              <Text style={styles.modalTitle}>Create New Habit</Text>
              <Text style={styles.modalSubtitle}>
                Build lifelong neural pathways through small daily wins
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
            {/* Habit Name */}
            <Text style={styles.fieldLabel}>Habit Title</Text>
            <TextInput
              style={styles.inputName}
              placeholder="e.g., 10-Minute Morning Breathwork"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Category Select */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Icon Picker */}
            <Text style={styles.fieldLabel}>Select Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.iconBox,
                      isSelected && styles.iconBoxActive,
                    ]}
                    onPress={() => setSelectedIcon(item.id)}
                  >
                    <Icon
                      size={20}
                      color={isSelected ? "#34D399" : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.iconLabel,
                        isSelected && styles.iconLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting || success || !name.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                success
                  ? ["#059669", "#10B981"]
                  : ["#059669", "#10B981"]
              }
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : success ? (
                <View style={styles.rowAlign}>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Habit Added!</Text>
                </View>
              ) : (
                <View style={styles.rowAlign}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Save Routine</Text>
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 6,
  },
  inputName: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10B981",
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#6EE7B7",
    fontWeight: "700",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  iconBox: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: 6,
  },
  iconBoxActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
  },
  iconLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  iconLabelActive: {
    color: "#A7F3D0",
  },
  submitBtn: {
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
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
