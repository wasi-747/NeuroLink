import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Search,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Award,
  Sparkles,
  Stethoscope,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { getTherapistsApi } from "../services/api";

const SPECIALTIES = [
  "All",
  "Anxiety & Panic",
  "Depression Support",
  "Trauma & PTSD",
  "Burnout",
  "Relationship Stress",
  "Sleep Disorders",
];

export default function TherapistsScreen({ onSelectTherapist, onOpenMyBookings }) {
  const [therapists, setTherapists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    setLoading(true);
    const data = await getTherapistsApi();
    setTherapists(data);
    setLoading(false);
  };

  const filteredTherapists = therapists.filter((t) => {
    const q = (searchQuery || "").toLowerCase();
    const nameMatch = (t?.name || "").toLowerCase().includes(q);
    const titleMatch = (t?.title || "").toLowerCase().includes(q);
    const specs = Array.isArray(t?.specializations) ? t.specializations : [];
    const specMatch = specs.some((s) => (s || "").toLowerCase().includes(q));

    const matchesSpecialty =
      selectedSpecialty === "All" ||
      specs.some(
        (s) => (s || "").toLowerCase() === (selectedSpecialty || "").toLowerCase()
      );
    return (nameMatch || titleMatch || specMatch) && matchesSpecialty;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <LinearGradient
        colors={["#1e1b4b", "#3730a3", "#1e1b4b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.topHeaderRow}>
          <View style={styles.badge}>
            <Stethoscope size={12} color="#A5B4FC" />
            <Text style={styles.badgeText}>LICENSED CLINICAL TELEHEALTH</Text>
          </View>

          {onOpenMyBookings && (
            <TouchableOpacity
              style={styles.myBookingsHeaderBtn}
              onPress={onOpenMyBookings}
              activeOpacity={0.8}
            >
              <Calendar size={13} color="#FFFFFF" />
              <Text style={styles.myBookingsHeaderText}>My Appointments</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.headerTitle}>Certified Therapists</Text>
        <Text style={styles.headerSubtitle}>
          Connect with world-class psychologists and neuro-counselors for secure 1-on-1 sessions.
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by specialty, name, or focus..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Specialty Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyChips}
      >
        {SPECIALTIES.map((spec) => (
          <TouchableOpacity
            key={spec}
            style={[
              styles.specChip,
              selectedSpecialty === spec && styles.specChipActive,
            ]}
            onPress={() => setSelectedSpecialty(spec)}
          >
            <Text
              style={[
                styles.specChipText,
                selectedSpecialty === spec && styles.specChipTextActive,
              ]}
            >
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Therapists List */}
      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.therapistList}>
          {filteredTherapists.map((therapist, index) => (
            <View key={therapist._id || therapist.id || index} style={styles.therapistCard}>
              {/* Card Top Row */}
              <View style={styles.cardTopRow}>
                <Image
                  source={{ uri: therapist.avatar }}
                  style={styles.avatarImage}
                />
                <View style={styles.therapistMeta}>
                  <View style={styles.nameRow}>
                    <Text style={styles.therapistName}>{therapist.name}</Text>
                    {therapist.verified && (
                      <ShieldCheck size={16} color="#38BDF8" />
                    )}
                  </View>
                  <Text style={styles.therapistTitle}>{therapist.title}</Text>

                  <View style={styles.ratingExpRow}>
                    <View style={styles.ratingBox}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{therapist.rating}</Text>
                      <Text style={styles.reviewsText}>
                        ({therapist.reviewsCount})
                      </Text>
                    </View>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.expText}>{therapist.experience}</Text>
                  </View>
                </View>
              </View>

              {/* Bio snippet */}
              <Text style={styles.bioText} numberOfLines={2}>
                {therapist.bio}
              </Text>

              {/* Specialization Tags */}
              <View style={styles.specTagsRow}>
                {therapist.specializations.map((tag, i) => (
                  <View key={i} style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Available slot & Pricing Row */}
              <View style={styles.slotPriceRow}>
                <View style={styles.slotGroup}>
                  <Clock size={13} color="#34D399" />
                  <Text style={styles.slotText}>{therapist.availableNext}</Text>
                </View>
                <Text style={styles.priceText}>{therapist.rate}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => onSelectTherapist(therapist)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#6366F1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bookGradient}
                  >
                    <Calendar size={16} color="#FFFFFF" />
                    <Text style={styles.bookBtnText}>Book Session</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.videoQuickBtn}
                  onPress={() => onSelectTherapist(therapist)}
                >
                  <Video size={18} color="#818CF8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  myBookingsHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  myBookingsHeaderText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  badgeText: {
    color: "#C7D2FE",
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
    color: "#94A3B8",
    lineHeight: 18,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  specialtyChips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  specChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  specChipActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: "#818CF8",
  },
  specChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  specChipTextActive: {
    color: "#C7D2FE",
    fontWeight: "700",
  },
  therapistList: {
    gap: 16,
  },
  therapistCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 14,
    backgroundColor: "#1E293B",
  },
  therapistMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  therapistName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  therapistTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingExpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "700",
  },
  reviewsText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  bulletDot: {
    color: colors.textMuted,
  },
  expText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  bioText: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 12,
  },
  specTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  tagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagPillText: {
    fontSize: 11,
    color: "#C7D2FE",
    fontWeight: "500",
  },
  slotPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  slotGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  slotText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "600",
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  bookButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  bookGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  videoQuickBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
