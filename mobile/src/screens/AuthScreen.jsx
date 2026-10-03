import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Brain,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("student1@test.edu");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");

  const { login, register, continueAsGuest, loading } = useAuth();

  const handleAuthSubmit = async () => {
    setErrorMsg("");
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (isRegister && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setErrorMsg(typeof err === "string" ? err : "Authentication failed.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Logo & Hero Header */}
        <View style={styles.brandHero}>
          <LinearGradient
            colors={["#7C3AED", "#6366F1"]}
            style={styles.logoCircle}
          >
            <Brain size={36} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.brandTitle}>NeuroLink</Text>
          <Text style={styles.brandTagline}>
            AI-Powered Mental Wellness & Neurotechnology
          </Text>
        </View>

        {/* Auth Card */}
        <View style={styles.authCard}>
          {/* Tab Switcher: Sign In vs Sign Up */}
          <View style={styles.tabSwitchContainer}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                !isRegister && styles.tabBtnActive,
              ]}
              onPress={() => {
                setIsRegister(false);
                setErrorMsg("");
              }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  !isRegister && styles.tabBtnTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                isRegister && styles.tabBtnActive,
              ]}
              onPress={() => {
                setIsRegister(true);
                setErrorMsg("");
              }}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  isRegister && styles.tabBtnTextActive,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form Inputs */}
          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Alex Rivera"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleAuthSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#4F46E5", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.submitBtnText}>
                    {isRegister ? "Start Wellness Journey" : "Sign In to NeuroLink"}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Continue as Guest Button */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={continueAsGuest}
            activeOpacity={0.7}
          >
            <Text style={styles.guestBtnText}>Explore as Guest / Offline</Text>
          </TouchableOpacity>
        </View>

        {/* Security & Privacy Banner */}
        <View style={styles.securityFooter}>
          <ShieldCheck size={16} color="#38BDF8" />
          <Text style={styles.securityText}>
            256-Bit Encrypted • HIPAA-Compliant • Confidential
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "center",
  },
  brandHero: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  authCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  tabSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: "#6366F1",
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  guestBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  guestBtnText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  securityText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
});
