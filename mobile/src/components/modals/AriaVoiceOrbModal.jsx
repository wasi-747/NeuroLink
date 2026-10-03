import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Brain,
  MessageSquare,
  RefreshCw,
} from "lucide-react-native";
import { colors } from "../../theme/colors";
import { chatWithAria } from "../../services/api";

const { width } = Dimensions.get("window");

const QUICK_VOICE_PROMPTS = [
  "I'm feeling anxious about today",
  "Can you guide me through a 2-minute reset?",
  "Why am I finding it hard to focus?",
  "Give me an evening sleep meditation",
];

export default function AriaVoiceOrbModal({
  visible,
  onClose,
  onSwitchToTextChat,
  userMetrics = {},
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ariaSpeechText, setAriaSpeechText] = useState(
    "Hello Alex. I'm listening. Speak openly about what you're feeling right now."
  );
  const [voiceRate, setVoiceRate] = useState("Calm");

  // Animations for glowing Neuro-Orb
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim1 = useRef(new Animated.Value(0.4)).current;
  const waveAnim2 = useRef(new Animated.Value(0.6)).current;
  const waveAnim3 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (isListening || isSpeaking) {
      // Pulse animation when active
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Soundwave bar animations
      const startWave = (anim, duration) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        ).start();
      };

      startWave(waveAnim1, 400);
      startWave(waveAnim2, 600);
      startWave(waveAnim3, 500);
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, isSpeaking]);

  const speakText = (text) => {
    try {
      Speech.stop();
      setIsSpeaking(true);
      const clean = text.replace(/[*#_~`]/g, "").trim();
      Speech.speak(clean, {
        language: "en-US",
        pitch: 1.05,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    try {
      Speech.stop();
    } catch (e) {}
    setIsSpeaking(false);
  };

  const handleClose = () => {
    handleStopSpeaking();
    setIsListening(false);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      const greeting =
        "Hi, I'm Aria. I'm an AI wellness companion, not a therapist, but I'm here to support you. How are you feeling today?";
      setAriaSpeechText(greeting);
      speakText(greeting);
    } else {
      handleStopSpeaking();
    }
    return () => {
      handleStopSpeaking();
    };
  }, [visible]);

  if (!visible) return null;

  const handleToggleMic = () => {
    if (!isListening) {
      handleStopSpeaking();
      setIsListening(true);
      setTranscript("Listening to your voice...");

      // Voice capture simulation
      setTimeout(async () => {
        const spoken = "I've been feeling tight in my chest and overwhelmed with work.";
        setTranscript(`"${spoken}"`);
        setIsListening(false);

        try {
          const res = await chatWithAria(
            [{ role: "user", content: spoken }],
            userMetrics
          );
          const reply =
            res.reply ||
            "Take a slow deep breath with me. Inhale for 4 seconds, hold for 4, and gently exhale.";
          setAriaSpeechText(reply);
          speakText(reply);
        } catch (e) {
          const fallback =
            "I hear the strain in your voice. Let's drop your shoulders and do a 4-7-8 breath reset together right now.";
          setAriaSpeechText(fallback);
          speakText(fallback);
        }
      }, 2500);
    } else {
      setIsListening(false);
      setTranscript("");
    }
  };

  const handlePromptTap = async (prompt) => {
    handleStopSpeaking();
    setTranscript(`"${prompt}"`);
    setIsListening(false);

    try {
      const res = await chatWithAria(
        [{ role: "user", content: prompt }],
        userMetrics
      );
      const reply =
        res.reply || "I'm right here with you. Let's take this one step at a time.";
      setAriaSpeechText(reply);
      speakText(reply);
    } catch (e) {
      const fallback =
        "Take a gentle breath in through your nose, hold softly, and let go.";
      setAriaSpeechText(fallback);
      speakText(fallback);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <LinearGradient
        colors={["#0A061E", "#150C30", "#070E18"]}
        style={styles.container}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleClose}>
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.modeBadge}>
            <Sparkles size={12} color="#C084FC" />
            <Text style={styles.modeBadgeText}>ARIA LIVE VOICE</Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              onClose();
              if (onSwitchToTextChat) onSwitchToTextChat();
            }}
          >
            <MessageSquare size={18} color="#C4B5FD" />
          </TouchableOpacity>
        </View>

        {/* Central Orb & Visualizer */}
        <View style={styles.centerContainer}>
          {/* Animated Glow Ring */}
          <Animated.View
            style={[
              styles.orbOuterRing,
              {
                transform: [{ scale: pulseAnim }, { rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={["#7C3AED", "#EC4899", "#3B82F6", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.orbGradient}
            />
          </Animated.View>

          {/* Inner Core */}
          <View style={styles.orbInnerCore}>
            <LinearGradient
              colors={["#2E1065", "#4C1D95"]}
              style={styles.orbCoreGradient}
            >
              <Brain size={44} color="#E9D5FF" />
            </LinearGradient>
          </View>

          {/* Audio Waveform Bars */}
          <View style={styles.waveformContainer}>
            <Animated.View
              style={[
                styles.waveformBar,
                { height: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [6, 28] }) },
              ]}
            />
            <Animated.View
              style={[
                styles.waveformBar,
                { height: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [10, 42] }) },
              ]}
            />
            <Animated.View
              style={[
                styles.waveformBar,
                { height: waveAnim3.interpolate({ inputRange: [0, 1], outputRange: [8, 34] }) },
              ]}
            />
            <Animated.View
              style={[
                styles.waveformBar,
                { height: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [12, 38] }) },
              ]}
            />
            <Animated.View
              style={[
                styles.waveformBar,
                { height: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [6, 26] }) },
              ]}
            />
          </View>

          {/* Dynamic Status Text */}
          <Text style={styles.statusIndicatorText}>
            {isListening
              ? "Listening to your thoughts..."
              : isSpeaking
              ? "Aria is speaking..."
              : "Tap Microphone to Speak"}
          </Text>

          {/* Transcript / Spoken Output Box */}
          <View style={styles.speechBubbleCard}>
            {transcript ? (
              <Text style={styles.userTranscriptText}>{transcript}</Text>
            ) : null}
            <Text style={styles.ariaSpeechText}>{ariaSpeechText}</Text>
          </View>
        </View>

        {/* Quick Voice Starters */}
        <View style={styles.promptsSection}>
          <Text style={styles.promptsLabel}>Quick Voice Queries</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsScroll}
          >
            {QUICK_VOICE_PROMPTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handlePromptTap(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.promptChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Control Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonListening,
            ]}
            onPress={handleToggleMic}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isListening
                  ? ["#EC4899", "#EF4444"]
                  : ["#7C3AED", "#6366F1"]
              }
              style={styles.micGradient}
            >
              {isListening ? (
                <MicOff size={28} color="#FFFFFF" />
              ) : (
                <Mic size={28} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(192, 132, 252, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  modeBadgeText: {
    color: "#E9D5FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  centerContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginVertical: 10,
  },
  orbOuterRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  orbGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 85,
    opacity: 0.8,
  },
  orbInnerCore: {
    position: "absolute",
    top: 25,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  orbCoreGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    gap: 6,
    marginTop: 20,
    marginBottom: 6,
  },
  waveformBar: {
    width: 4,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },
  statusIndicatorText: {
    color: "#C4B5FD",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
  },
  speechBubbleCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 22,
    padding: 16,
    maxHeight: 140,
  },
  userTranscriptText: {
    color: "#93C5FD",
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 6,
  },
  ariaSpeechText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  promptsSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  promptsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  promptsScroll: {
    flexDirection: "row",
    gap: 8,
  },
  promptChip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  promptChipText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "500",
  },
  controlsBar: {
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  micButtonListening: {
    shadowColor: "#EF4444",
  },
  micGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
