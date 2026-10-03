import axios from "axios";
import { Platform } from "react-native";

// Production Cloud Endpoints (Live on Render)
export const PROD_SERVER_URL = "https://neurolink-w2pd.onrender.com/api/v1";
export const PROD_ML_URL = "https://neurolink-ml.onrender.com/api/ml";

// Machine LAN IP for local device testing over Wi-Fi
export const LOCAL_MACHINE_IP = "192.168.0.103";
export const EMULATOR_IP = "10.0.2.2";

// Set to true so standalone APK and device connect to 24/7 cloud backend anywhere
export const USE_PROD_API = true;

// Determine the default server host based on device platform
export const getDefaultHost = () => {
  if (Platform.OS === "android") {
    return LOCAL_MACHINE_IP;
  }
  return "localhost";
};

let currentHost = getDefaultHost();

export const getServerBaseUrl = () => {
  if (USE_PROD_API || !__DEV__) {
    return PROD_SERVER_URL;
  }
  return `http://${currentHost}:5000/api/v1`;
};

export const getMlBaseUrl = () => {
  if (USE_PROD_API || !__DEV__) {
    return PROD_ML_URL;
  }
  return `http://${currentHost}:8000/api/ml`;
};

export const api = axios.create({
  baseURL: getServerBaseUrl(),
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const mlApi = axios.create({
  baseURL: getMlBaseUrl(),
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setCustomHost = (host) => {
  if (host && typeof host === "string") {
    currentHost = host.trim();
    api.defaults.baseURL = getServerBaseUrl();
    mlApi.defaults.baseURL = getMlBaseUrl();
    console.log(`[NeuroLink API] Host updated to: ${currentHost} (${getServerBaseUrl()})`);
  }
};

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const getAuthToken = () => authToken;

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging & graceful error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Network request failed";
    console.warn(`[API Response Error] ${error.config?.url}:`, errorMsg);
    return Promise.reject(error);
  }
);

/* ==========================================================================
   1. AUTHENTICATION APIS (/api/v1/auth)
   ========================================================================== */
export const loginApi = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  if (res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res.data;
};

export const registerApi = async (name, email, password) => {
  const res = await api.post("/auth/register", { name, email, password });
  if (res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data?.data;
};

export const updateDetailsApi = async (userData) => {
  const res = await api.put("/auth/updatedetails", userData);
  return res.data?.data;
};

export const logoutApi = async () => {
  try {
    await api.get("/auth/logout");
  } catch (err) {
    // Ignore offline errors on logout
  } finally {
    setAuthToken(null);
  }
};

/* ==========================================================================
   2. ARIA AI WELLNESS COMPANION & CRISIS (/api/v1/ml/chat)
   ========================================================================== */
export const chatWithAria = async (messages, userContext = {}) => {
  try {
    const res = await api.post("/ml/chat", {
      messages,
      user_context: userContext,
    });
    return res.data;
  } catch (error) {
    console.warn("Aria API error, using intelligent fallback:", error?.message);
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const isCrisis = /suicid|kill myself|end my life|hurt myself|die|hanging/.test(lastMsg);
    return {
      reply: isCrisis
        ? "I hear how much pain you're in, and I want you to know you are not alone. Please reach out to someone who can help right now. Call Kaan Pete Roi at +8801779554391 or 999 (Bangladesh), or 988 (US/Canada). Support and hope are available for you."
        : "I'm right here with you! Your mental wellness is my highest priority. Take a slow, gentle breath. We can do a quick 4-4-4-4 breathing reset, check in on your feelings, or talk through whatever is feeling heavy right now.",
      isCrisis,
    };
  }
};

/* ==========================================================================
   3. MOOD TRACKER APIS (/api/v1/mood)
   ========================================================================== */
export const getMoodsApi = async (range = "7d") => {
  try {
    const res = await api.get(`/mood?range=${range}`);
    return res.data?.data || [];
  } catch (error) {
    console.warn("getMoodsApi fallback to local demo data:", error.message);
    return [
      { id: "m1", mood: "Ecstatic", score: 5, rating: 5, note: "Completed sprint milestones and went for a run.", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: "m2", mood: "Happy", score: 4, rating: 4, note: "Great sleep and peaceful morning coffee.", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "m3", mood: "Calm", score: 4, rating: 4, note: "10-minute mindfulness breathing before work.", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: "m4", mood: "Happy", score: 4.5, rating: 4, note: "Connected with family and feeling balanced.", timestamp: new Date().toISOString() },
    ];
  }
};

export const createMoodApi = async (moodData) => {
  try {
    const rawVal = moodData.score || moodData.rating || moodData.mood || 3;
    const numericMood = Math.min(5, Math.max(1, Math.round(Number(rawVal) || 3)));
    const payload = {
      mood: numericMood,
      note: moodData.note || "",
    };
    const res = await api.post("/mood", payload);
    return res.data;
  } catch (error) {
    console.warn("createMoodApi offline fallback:", error.message);
    return {
      success: true,
      data: {
        ...moodData,
        _id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
    };
  }
};

export const getMoodStatsApi = async (timeframe = "month") => {
  try {
    const res = await api.get(`/mood/stats?timeframe=${timeframe}`);
    return res.data?.data;
  } catch (error) {
    return null;
  }
};

/* ==========================================================================
   4. HABIT TRACKER APIS (/api/v1/habits)
   ========================================================================== */
export const getHabitsApi = async () => {
  try {
    const res = await api.get("/habits");
    return res.data?.data || [];
  } catch (error) {
    console.warn("getHabitsApi fallback to local habits:", error.message);
    return [
      { _id: "h1", name: "Morning Meditation", icon: "Brain", streak: 7, completedToday: true, category: "Mind", frequency: "daily" },
      { _id: "h2", name: "Drink 2.5L Water", icon: "Droplets", streak: 12, completedToday: true, category: "Health", frequency: "daily" },
      { _id: "h3", name: "10,000 Steps", icon: "Dumbbell", streak: 4, completedToday: false, category: "Fitness", frequency: "daily" },
      { _id: "h4", name: "No Screen Before Bed", icon: "SmartphoneOff", streak: 9, completedToday: false, category: "Sleep", frequency: "daily" },
      { _id: "h5", name: "Gratitude Journal", icon: "Book", streak: 15, completedToday: true, category: "Mind", frequency: "daily" },
    ];
  }
};

export const createHabitApi = async (habitData) => {
  const res = await api.post("/habits", habitData);
  return res.data?.data;
};

export const logHabitApi = async (habitId, dateStr = null) => {
  const date = dateStr || new Date().toISOString().split("T")[0];
  const res = await api.post(`/habits/${habitId}/log`, { date });
  return res.data;
};

export const updateHabitApi = async (habitId, updateData) => {
  const res = await api.put(`/habits/${habitId}`, updateData);
  return res.data?.data;
};

export const deleteHabitApi = async (habitId) => {
  const res = await api.delete(`/habits/${habitId}`);
  return res.data;
};

/* ==========================================================================
   5. THERAPISTS & TELEHEALTH APIS (/api/v1/therapists)
   ========================================================================== */
export const getTherapistsApi = async (filters = {}) => {
  try {
    const res = await api.get("/therapists", { params: filters });
    return res.data?.data || [];
  } catch (error) {
    console.warn("getTherapistsApi fallback:", error.message);
    return [
      {
        _id: "t1",
        id: "t1",
        name: "Dr. Sarah Jenkins, Ph.D.",
        title: "Clinical Psychologist & Neuro-Counselor",
        rating: 4.9,
        reviewsCount: 128,
        experience: "12 yrs exp",
        hourlyRate: 85,
        rate: "$85/session",
        avatar: "https://images.unsplash.com/photo-1594824813589-325b3992b8d0?w=400&q=80",
        specializations: ["Anxiety & Panic", "CBT", "Burnout", "Sleep Disorders"],
        availableNext: "Today at 4:30 PM",
        bio: "Specializing in evidence-based cognitive behavioral therapy and neurofeedback integration for stress and high performance.",
        verified: true,
      },
      {
        _id: "t2",
        id: "t2",
        name: "Dr. Michael Chen, MD",
        title: "Psychiatrist & Mindfulness Specialist",
        rating: 4.8,
        reviewsCount: 94,
        experience: "15 yrs exp",
        hourlyRate: 110,
        rate: "$110/session",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
        specializations: ["Depression Support", "Trauma & PTSD", "Mindfulness"],
        availableNext: "Tomorrow at 11:00 AM",
        bio: "Holistic psychiatrist blending psychiatric care with evidence-based mindfulness and breathwork.",
        verified: true,
      },
      {
        _id: "t3",
        id: "t3",
        name: "Elena Rostova, LMFT",
        title: "Licensed Family & Relationship Therapist",
        rating: 4.9,
        reviewsCount: 86,
        experience: "9 yrs exp",
        hourlyRate: 75,
        rate: "$75/session",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
        specializations: ["Relationship Stress", "Self-Esteem", "Grief Counseling"],
        availableNext: "Wed at 2:00 PM",
        bio: "Helping individuals and couples navigate emotional challenges and build deep resilience.",
        verified: true,
      },
    ];
  }
};

export const bookTherapistApi = async (therapistId, bookingData) => {
  const res = await api.post(`/therapists/${therapistId}/book`, bookingData);
  return res.data;
};

export const getMyBookingsApi = async () => {
  try {
    const res = await api.get("/therapists/bookings/my-bookings");
    return res.data?.data || [];
  } catch (error) {
    return [];
  }
};

/* ==========================================================================
   6. COMMUNITY FORUM APIS (/api/v1/forum/posts)
   ========================================================================== */
export const getCommunityPostsApi = async (category = "All") => {
  try {
    const url = category && category !== "All"
      ? `/forum/posts?category=${encodeURIComponent(category)}`
      : "/forum/posts";
    const res = await api.get(url);
    return res.data?.data || [];
  } catch (error) {
    console.warn("getCommunityPostsApi fallback:", error.message);
    return [
      {
        _id: "p1",
        id: "p1",
        authorName: "Alex_Mindful",
        isAnonymous: false,
        category: "Anxiety",
        title: "How the 4-7-8 breathing technique stopped my panic attack today",
        content: "I was having an overwhelming surge before a presentation. Sitting quietly and doing 4 rounds of slow breathing brought my heart rate down. Highly recommend!",
        likesCount: 42,
        commentsCount: 15,
        isLiked: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        _id: "p2",
        id: "p2",
        authorName: "Anonymous Warrior",
        isAnonymous: true,
        category: "General Support",
        title: "Day 30 without burnout: What finally worked for me",
        content: "Setting digital sunset boundaries at 9 PM and logging my mood daily on NeuroLink kept me grounded. Remember you are not alone in this journey.",
        likesCount: 89,
        commentsCount: 27,
        isLiked: false,
        createdAt: new Date(Date.now() - 18000000).toISOString(),
      },
    ];
  }
};

export const createCommunityPostApi = async (postData) => {
  const res = await api.post("/forum/posts", postData);
  return res.data?.data;
};

export const reactCommunityPostApi = async (postId, reactionType = "like") => {
  const res = await api.post(`/forum/posts/${postId}/react`, { type: reactionType });
  return res.data;
};

export const getPostCommentsApi = async (postId) => {
  const res = await api.get(`/forum/posts/${postId}/comments`);
  return res.data?.data || [];
};

export const addPostCommentApi = async (postId, content, isAnonymous = false) => {
  const res = await api.post(`/forum/posts/${postId}/comments`, { content, isAnonymous });
  return res.data?.data;
};

/* ==========================================================================
   7. COURSES & MASTERCLASSES APIS (/api/v1/courses, /api/v1/learning)
   ========================================================================== */
export const getCoursesApi = async () => {
  try {
    const res = await api.get("/courses");
    return res.data?.data || [];
  } catch (error) {
    console.warn("getCoursesApi fallback:", error.message);
    return [
      {
        _id: "c1",
        id: "c1",
        title: "Mastering Stress & Cortisol Regulation",
        category: "Stress",
        level: "Beginner",
        duration: "45 mins",
        lessonsCount: 6,
        rating: 4.9,
        instructor: "Dr. Sarah Jenkins",
        progress: 66,
        description: "Understand the neuroscience of chronic stress and practical somatic techniques to reset your nervous system in real-time.",
        thumbnailColor: ["#1e1b4b", "#4338ca"],
      },
      {
        _id: "c2",
        id: "c2",
        title: "CBT Foundations for Panic & Anxiety",
        category: "Anxiety",
        level: "Intermediate",
        duration: "1h 20m",
        lessonsCount: 8,
        rating: 4.8,
        instructor: "Dr. Michael Chen",
        progress: 25,
        description: "Learn cognitive reframing, thought dissection, and exposure tools to dismantle negative spirals.",
        thumbnailColor: ["#312e81", "#6366f1"],
      },
    ];
  }
};

export const getCourseDetailsApi = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data?.data;
};

export const updateCourseProgressApi = async (courseId, lessonId, completed = true) => {
  try {
    const res = await api.put(`/learning/progress/${courseId}`, {
      lessonId,
      completed,
    });
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

/* ==========================================================================
   8. PSS-10 STRESS QUIZ APIS (/api/v1/stress-quiz)
   ========================================================================== */
export const submitStressQuizApi = async (answers) => {
  try {
    const res = await api.post("/stress-quiz", { answers });
    return res.data;
  } catch (error) {
    // Offline local scoring calculation fallback
    console.warn("submitStressQuizApi offline calculation:", error.message);
    let score = 0;
    const invertedIds = [4, 5, 7, 8];
    for (let i = 1; i <= 10; i++) {
      const val = answers[i] !== undefined ? answers[i] : (answers[String(i)] || 0);
      if (invertedIds.includes(i)) {
        score += (4 - val);
      } else {
        score += val;
      }
    }
    const level = score <= 13 ? "Low" : score <= 26 ? "Moderate" : "High";
    return {
      success: true,
      data: {
        score,
        level,
        recommendations:
          level === "Low"
            ? ["Maintain your healthy habits and coping strategies.", "Continue mindfulness exercises."]
            : level === "Moderate"
            ? ["Identify your top stressors and set micro-breaks.", "Practice daily 4-7-8 breathing reset with Aria."]
            : ["Consider speaking to a certified counselor.", "Prioritize gentle restorative sleep and self-care."],
      },
    };
  }
};

export const getStressQuizHistoryApi = async () => {
  try {
    const res = await api.get("/stress-quiz");
    return res.data?.data || [];
  } catch (err) {
    return [];
  }
};

/* ==========================================================================
   9. JOURNAL & GRATITUDE APIS (/api/v1/journal, /api/v1/gratitude)
   ========================================================================== */
export const getJournalEntriesApi = async () => {
  try {
    const res = await api.get("/journal");
    return res.data?.data || [];
  } catch (err) {
    return [];
  }
};

export const createJournalEntryApi = async (entryData) => {
  const res = await api.post("/journal", entryData);
  return res.data;
};

export const deleteJournalEntryApi = async (id) => {
  const res = await api.delete(`/journal/${id}`);
  return res.data;
};

export const getGratitudeEntriesApi = async () => {
  try {
    const res = await api.get("/gratitude");
    return res.data?.data || [];
  } catch (err) {
    return [];
  }
};

export const createGratitudeEntryApi = async (entryData) => {
  const res = await api.post("/gratitude", entryData);
  return res.data;
};

/* ==========================================================================
   10. SMART ML RECOMMENDATIONS ("FOR YOU") (/api/v1/ml/recommendations)
   ========================================================================== */
export const getSmartRecommendationsApi = async () => {
  try {
    const res = await api.get("/ml/recommendations");
    return res.data?.data;
  } catch (err) {
    return {
      topIssue: "general",
      recommendations: {
        tools: ["Box Breathing", "Gratitude Journaling"],
        message: "Take a mindful pause to reset your nervous system today.",
      },
    };
  }
};

/* ==========================================================================
   10B. WELLNESS REPORTS APIS (/api/v1/wellness-reports)
   ========================================================================== */
export const getWellnessReportsApi = async () => {
  try {
    const res = await api.get("/wellness-reports");
    return res.data?.data || [];
  } catch (err) {
    return [];
  }
};

export const generateWellnessReportApi = async () => {
  try {
    const res = await api.post("/wellness-reports/generate");
    return res.data?.data;
  } catch (err) {
    return null;
  }
};

/* ==========================================================================
   11. PREDICT SENTIMENT
   ========================================================================== */
export const predictSentiment = async (text) => {
  try {
    const res = await mlApi.post("/analyze-sentiment", { text });
    return res.data;
  } catch (error) {
    // Basic local sentiment heuristic
    const lower = (text || "").toLowerCase();
    const positiveWords = ["happy", "great", "good", "calm", "grateful", "relaxed", "peaceful", "better"];
    const negativeWords = ["anxious", "sad", "stressed", "overwhelmed", "panic", "tired", "worried", "bad"];
    let posCount = positiveWords.filter((w) => lower.includes(w)).length;
    let negCount = negativeWords.filter((w) => lower.includes(w)).length;
    return {
      sentiment: negCount > posCount ? "Negative" : "Positive",
      confidence: 0.85,
    };
  }
};

export default api;
