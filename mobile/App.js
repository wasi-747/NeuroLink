import React, { useState } from "react";
import { StyleSheet, View, StatusBar, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./src/theme/colors";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Header from "./src/components/layout/Header";
import FloatingBottomBar from "./src/components/layout/FloatingBottomBar";
import HomeScreen from "./src/screens/HomeScreen";
import MoodTrackerScreen from "./src/screens/MoodTrackerScreen";
import HabitTrackerScreen from "./src/screens/HabitTrackerScreen";
import TherapistsScreen from "./src/screens/TherapistsScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import CoursesScreen from "./src/screens/CoursesScreen";
import CrisisScreen from "./src/screens/CrisisScreen";
import AuthScreen from "./src/screens/AuthScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// Modals
import QuickAddModal from "./src/components/modals/QuickAddModal";
import AriaChatModal from "./src/components/modals/AriaChatModal";
import AriaVoiceOrbModal from "./src/components/modals/AriaVoiceOrbModal";
import NotificationsModal from "./src/components/modals/NotificationsModal";
import BookTherapistModal from "./src/components/modals/BookTherapistModal";
import CreatePostModal from "./src/components/modals/CreatePostModal";
import AddHabitModal from "./src/components/modals/AddHabitModal";
import CourseLessonModal from "./src/components/modals/CourseLessonModal";
import StressDetailModal from "./src/components/modals/StressDetailModal";
import StressQuizModal from "./src/components/modals/StressQuizModal";
import SleepDetailModal from "./src/components/modals/SleepDetailModal";
import HeartRateDetailModal from "./src/components/modals/HeartRateDetailModal";
import JournalModal from "./src/components/modals/JournalModal";
import GratitudeModal from "./src/components/modals/GratitudeModal";
import MyBookingsModal from "./src/components/modals/MyBookingsModal";
import WeeklyReportModal from "./src/components/modals/WeeklyReportModal";

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAriaOpen, setIsAriaOpen] = useState(false);
  const [isAriaVoiceOpen, setIsAriaVoiceOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isStressOpen, setIsStressOpen] = useState(false);
  const [isStressQuizOpen, setIsStressQuizOpen] = useState(false);
  const [isSleepOpen, setIsSleepOpen] = useState(false);
  const [isHeartRateOpen, setIsHeartRateOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleSelectFilter = (filterId) => {
    setActiveFilter(filterId);
    if (filterId === "mood") {
      setActiveTab("mood");
    } else {
      setActiveTab("home");
    }
  };

  const handleQuickAddOption = (optionId) => {
    if (optionId === "mood") {
      setActiveTab("mood");
    } else if (optionId === "habit") {
      setActiveTab("habits");
    } else if (optionId === "journal") {
      setIsJournalOpen(true);
    } else if (optionId === "gratitude") {
      setIsGratitudeOpen(true);
    } else if (optionId === "report") {
      setIsWeeklyReportOpen(true);
    } else if (optionId === "quiz") {
      setIsStressQuizOpen(true);
    } else if (optionId === "breathe") {
      setIsStressOpen(true);
    } else if (optionId === "crisis") {
      setActiveTab("crisis");
    } else if (optionId === "therapist") {
      setActiveTab("therapists");
    } else if (optionId === "aria") {
      setIsAriaOpen(true);
    } else if (optionId === "sleep") {
      setIsSleepOpen(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.container}>
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          activeFilter={activeFilter}
          onSelectFilter={handleSelectFilter}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenCrisis={() => setActiveTab("crisis")}
          notificationCount={2}
        />

        {/* Tab Screens View */}
        <View style={styles.screenContainer}>
          {activeTab === "home" && (
            <HomeScreen
              activeFilter={activeFilter}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenAria={() => setIsAriaOpen(true)}
              onOpenCrisis={() => setActiveTab("crisis")}
              onOpenStress={() => setIsStressOpen(true)}
              onOpenSleep={() => setIsSleepOpen(true)}
              onOpenHeartRate={() => setIsHeartRateOpen(true)}
              onOpenJournal={() => setIsJournalOpen(true)}
              onOpenGratitude={() => setIsGratitudeOpen(true)}
              onOpenQuiz={() => setIsStressQuizOpen(true)}
              onOpenReport={() => setIsWeeklyReportOpen(true)}
            />
          )}

          {activeTab === "mood" && (
            <MoodTrackerScreen onOpenAria={() => setIsAriaOpen(true)} />
          )}

          {activeTab === "habits" && (
            <HabitTrackerScreen onOpenAddHabit={() => setIsAddHabitOpen(true)} />
          )}

          {activeTab === "therapists" && (
            <TherapistsScreen
              onSelectTherapist={(therapist) => setSelectedTherapist(therapist)}
              onOpenMyBookings={() => setIsMyBookingsOpen(true)}
            />
          )}

          {activeTab === "community" && (
            <CommunityScreen
              onOpenCreatePost={() => setIsCreatePostOpen(true)}
            />
          )}

          {activeTab === "courses" && (
            <CoursesScreen
              onSelectCourse={(course) => setSelectedCourse(course)}
            />
          )}

          {activeTab === "crisis" && <CrisisScreen />}
        </View>

        {/* Floating Pill Bottom Navigation */}
        <FloatingBottomBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenAria={() => setIsAriaOpen(true)}
        />

        {/* User Profile & Settings Modal */}
        <ProfileScreen
          visible={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />

        {/* Notifications & Reminders Center Modal */}
        <NotificationsModal
          visible={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onActionTrigger={(tab) => setActiveTab(tab)}
        />

        {/* Quick Add Logging Bottom Sheet */}
        <QuickAddModal
          visible={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSelectOption={handleQuickAddOption}
        />

        {/* Aria AI Wellness Companion Chat Modal */}
        <AriaChatModal
          visible={isAriaOpen}
          onClose={() => setIsAriaOpen(false)}
          onOpenVoiceMode={() => setIsAriaVoiceOpen(true)}
          onOpenCrisis={() => setActiveTab("crisis")}
          userMetrics={{
            steps: 822,
            sleepHours: 7.5,
            mood: "Happy (4.5/5)",
          }}
        />

        {/* Aria Live Voice Neuro-Orb Modal */}
        <AriaVoiceOrbModal
          visible={isAriaVoiceOpen}
          onClose={() => setIsAriaVoiceOpen(false)}
          onSwitchToTextChat={() => setIsAriaOpen(true)}
          userMetrics={{
            steps: 822,
            sleepHours: 7.5,
            mood: "Happy (4.5/5)",
          }}
        />

        {/* Add Habit Modal */}
        <AddHabitModal
          visible={isAddHabitOpen}
          onClose={() => setIsAddHabitOpen(false)}
          onHabitAdded={() => {}}
        />

        {/* Create Community Post Modal */}
        <CreatePostModal
          visible={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={() => {}}
        />

        {/* Book Therapist Modal */}
        <BookTherapistModal
          visible={!!selectedTherapist}
          therapist={selectedTherapist}
          onClose={() => setSelectedTherapist(null)}
        />

        {/* Course Lesson Learning Modal */}
        <CourseLessonModal
          visible={!!selectedCourse}
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />

        {/* Dedicated Health Metric Modals */}
        <StressDetailModal
          visible={isStressOpen}
          onClose={() => setIsStressOpen(false)}
          onOpenAria={() => setIsAriaOpen(true)}
          onTakeQuiz={() => setIsStressQuizOpen(true)}
        />

        <StressQuizModal
          visible={isStressQuizOpen}
          onClose={() => setIsStressQuizOpen(false)}
          onOpenAria={() => setIsAriaOpen(true)}
        />

        <SleepDetailModal
          visible={isSleepOpen}
          onClose={() => setIsSleepOpen(false)}
        />

        <HeartRateDetailModal
          visible={isHeartRateOpen}
          onClose={() => setIsHeartRateOpen(false)}
          bpm={72}
        />

        {/* AI Reflective Journal Modal */}
        <JournalModal
          visible={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          onOpenCrisis={() => setActiveTab("crisis")}
          onOpenAria={() => setIsAriaOpen(true)}
        />

        {/* Daily 3-Prompt Gratitude Modal */}
        <GratitudeModal
          visible={isGratitudeOpen}
          onClose={() => setIsGratitudeOpen(false)}
        />

        {/* Telehealth Appointments & Video Room Modal */}
        <MyBookingsModal
          visible={isMyBookingsOpen}
          onClose={() => setIsMyBookingsOpen(false)}
          onBookNew={() => setActiveTab("therapists")}
        />

        {/* Comprehensive Weekly Mind Balance Report Modal */}
        <WeeklyReportModal
          visible={isWeeklyReportOpen}
          onClose={() => setIsWeeklyReportOpen(false)}
          onOpenAria={() => setIsAriaOpen(true)}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: "relative",
  },
  screenContainer: {
    flex: 1,
  },
});


