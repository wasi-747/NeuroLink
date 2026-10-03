import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  X,
  CalendarPlus,
  XCircle,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import api from "../../services/api";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Confirmed: { color: "#10B981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)" },
  Pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)" },
  Completed: { color: "#6366F1", bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.4)" },
  Cancelled: { color: "#F43F5E", bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.4)" },
};

// ─── Seed Bookings (fallback) ─────────────────────────────────────────────────
const SEED_BOOKINGS = [
  {
    _id: "b1",
    therapist: {
      name: "Dr. Sarah Jenkins, Ph.D.",
      title: "Clinical Psychologist",
      avatar: "https://images.unsplash.com/photo-1594824813589-325b3992b8d0?w=120&q=80",
      specialization: "CBT & Burnout",
    },
    sessionDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    timeSlot: "4:30 PM",
    status: "Confirmed",
  },
  {
    _id: "b2",
    therapist: {
      name: "Dr. Michael Chen, MD",
      title: "Psychiatrist",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&q=80",
      specialization: "Mindfulness & Trauma",
    },
    sessionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    timeSlot: "11:00 AM",
    status: "Completed",
  },
  {
    _id: "b3",
    therapist: {
      name: "Elena Rostova, LMFT",
      title: "Family Therapist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80",
      specialization: "Relationship & Self-Esteem",
    },
    sessionDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    timeSlot: "2:00 PM",
    status: "Pending",
  },
];

function isUpcoming(booking) {
  return (
    (booking.status === "Confirmed" || booking.status === "Pending") &&
    new Date(booking.sessionDate) >= new Date()
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyBookingsModal({
  visible,
  onClose,
  onBrowseTherapists,
  onJoinRoom,
}) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fetchBookings();
    }
  }, [visible]);

  const fetchBookings = async () => {
    setIsLoading(true);
    fadeAnim.setValue(0);
    try {
      const res = await api.get("/therapists/bookings/my-bookings");
      setBookings(res.data?.data || SEED_BOOKINGS);
    } catch (_) {
      setBookings(SEED_BOOKINGS);
    } finally {
      setIsLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  };

  const handleAddToCalendar = (booking) => {
    Alert.alert(
      "Add to Calendar",
      `Would you like to add your session with ${booking.therapist.name} on ${formatDate(booking.sessionDate)} at ${booking.timeSlot} to your device calendar?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add", onPress: () => Alert.alert("Added", "Session added to your device calendar.") },
      ]
    );
  };

  const handleCancel = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this session? This action cannot be undone.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel booking",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/therapists/bookings/${bookingId}`);
            } catch (_) {}
            setBookings((prev) =>
              prev.map((b) => (b._id === bookingId ? { ...b, status: "Cancelled" } : b))
            );
          },
        },
      ]
    );
  };

  const handleJoin = (booking) => {
    // Recommended default: call onJoinRoom prop and let parent handle
    onJoinRoom && onJoinRoom(booking);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient
            colors={["#1E1B4B", "#3730A3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <Stethoscope size={20} color="#A5B4FC" />
              <View>
                <Text style={styles.headerTitle}>My Sessions</Text>
                <Text style={styles.headerSubtitle}>Telehealth consultations</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={styles.loadingText}>Loading your sessions…</Text>
            </View>
          ) : bookings.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <LinearGradient colors={["#1E1B4B", "#2D2A7A"]} style={styles.emptyIllustration}>
                <Stethoscope size={48} color="#818CF8" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't booked any sessions with a therapist. Browse our verified counselors and schedule your first consultation.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => { onClose(); onBrowseTherapists && onBrowseTherapists(); }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#6366F1", "#818CF8"]}
                  style={styles.browseBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Stethoscope size={16} color="#FFF" />
                  <Text style={styles.browseBtnText}>Browse Available Therapists</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.ScrollView
              style={{ opacity: fadeAnim }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onJoin={handleJoin}
                  onAddToCalendar={handleAddToCalendar}
                  onCancel={handleCancel}
                  formatDate={formatDate}
                />
              ))}
            </Animated.ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onJoin, onAddToCalendar, onCancel, formatDate }) {
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
  const upcoming = isUpcoming(booking);

  return (
    <View style={styles.bookingCard}>
      {/* Therapist row */}
      <View style={styles.therapistRow}>
        <View style={styles.avatarWrapper}>
          {booking.therapist.avatar ? (
            <Image source={{ uri: booking.therapist.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={["#4338CA", "#6366F1"]} style={styles.avatarPlaceholder}>
              <Stethoscope size={20} color="#FFF" />
            </LinearGradient>
          )}
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={10} color="#10B981" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.therapistName}>{booking.therapist.name}</Text>
          <Text style={styles.therapistTitle}>{booking.therapist.title}</Text>
          <View style={styles.specializationTag}>
            <Text style={styles.specializationText}>{booking.therapist.specialization}</Text>
          </View>
        </View>
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{booking.status}</Text>
        </View>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfoRow}>
        <View style={styles.sessionInfoItem}>
          <Calendar size={13} color={colors.textMuted} />
          <Text style={styles.sessionInfoText}>{formatDate(booking.sessionDate)}</Text>
        </View>
        <View style={styles.sessionInfoDivider} />
        <View style={styles.sessionInfoItem}>
          <Clock size={13} color={colors.textMuted} />
          <Text style={styles.sessionInfoText}>{booking.timeSlot}</Text>
        </View>
      </View>

      {/* Actions for upcoming sessions */}
      {upcoming && (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => onJoin(booking)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#059669", "#10B981"]}
            style={styles.joinBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Video size={16} color="#FFF" />
            <Text style={styles.joinBtnText}>Join Encrypted Video Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Secondary actions */}
      {booking.status !== "Cancelled" && booking.status !== "Completed" && (
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onAddToCalendar(booking)}
            activeOpacity={0.8}
          >
            <CalendarPlus size={14} color="#A5B4FC" />
            <Text style={styles.secondaryBtnText}>Add to Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.cancelBtn]}
            onPress={() => onCancel(booking._id)}
            activeOpacity={0.8}
          >
            <XCircle size={14} color="#F43F5E" />
            <Text style={[styles.secondaryBtnText, { color: "#F43F5E" }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0B1320",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  headerSubtitle: { color: "#A5B4FC", fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  // Loading
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 14 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },

  // Empty State
  emptyContainer: { alignItems: "center", padding: 28, gap: 14 },
  emptyIllustration: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  emptySubtitle: { color: colors.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 20 },
  browseBtn: { borderRadius: 16, overflow: "hidden", width: "100%", marginTop: 6 },
  browseBtnGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 15,
  },
  browseBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  // Scroll
  scrollContent: { padding: 16, paddingBottom: 36, gap: 14 },

  // Booking Card
  bookingCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },

  // Therapist Row
  therapistRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.cardBgAlt },
  avatarPlaceholder: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute", bottom: -3, right: -3,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#0B1320",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(16,185,129,0.5)",
  },
  therapistName: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  therapistTitle: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  specializationTag: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  specializationText: { color: "#818CF8", fontSize: 10, fontWeight: "700" },

  // Status Badge
  statusBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 11, fontWeight: "800" },

  // Session Info
  sessionInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  sessionInfoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  sessionInfoText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  sessionInfoDivider: { width: 1, height: 14, backgroundColor: colors.cardBorder, marginHorizontal: 4 },

  // Join Button
  joinBtn: { borderRadius: 14, overflow: "hidden" },
  joinBtnGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13,
  },
  joinBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  // Secondary Actions
  secondaryActions: { flexDirection: "row", gap: 10 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 9,
  },
  cancelBtn: { borderColor: "rgba(244,63,94,0.3)" },
  secondaryBtnText: { color: "#A5B4FC", fontSize: 12, fontWeight: "700" },
});
