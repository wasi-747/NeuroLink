import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";
import MoodEntry from "../models/MoodEntry.js";
import StressQuizResult from "../models/StressQuizResult.js";
import JournalEntry from "../models/JournalEntry.js";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import Article from "../models/Article.js";
import Course from "../models/Course.js";
import axios from "axios";

// @desc    Get smart resource recommendations for the logged-in user
// @route   GET /api/ml/recommendations
// @access  Private
export const getRecommendations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // 1. Fetch all data in parallel
  const [moodEntries, stressQuizzes, journalEntries, sleepHabit] =
    await Promise.all([
      MoodEntry.find({ user: userId, timestamp: { $gte: fourteenDaysAgo } }).sort({
        timestamp: -1,
      }),
      StressQuizResult.find({
        user: userId,
        completedAt: { $gte: fourteenDaysAgo },
      }).sort({ completedAt: -1 }),
      JournalEntry.find({ user: userId, createdAt: { $gte: fourteenDaysAgo } }),
      Habit.findOne({ user: userId, name: "Sleep" }),
    ]);

  let sleepHabitLogs = [];
  if (sleepHabit) {
    sleepHabitLogs = await HabitLog.find({
      habit: sleepHabit._id,
      date: { $gte: fourteenDaysAgo },
    });
  }

  // 2. Calculate scores
  let anxiety_score = 0;
  let depression_score = 0;
  let stress_score = 0;
  let sleep_score = 0;
  let anger_score = 0;

  // Mood-based scores
  const lowMoodDays = moodEntries.filter((e) => e.rating <= 2).length;
  anxiety_score += lowMoodDays * 2;
  stress_score += lowMoodDays * 1;

  let consecutiveLowMoodDays = 0;
  let maxConsecutiveLowMoodDays = 0;
  // Assuming moodEntries are sorted by date descending
  for (let i = 0; i < moodEntries.length; i++) {
    if (moodEntries[i].rating <= 2) {
      consecutiveLowMoodDays++;
    } else {
      if (consecutiveLowMoodDays > maxConsecutiveLowMoodDays) {
        maxConsecutiveLowMoodDays = consecutiveLowMoodDays;
      }
      consecutiveLowMoodDays = 0;
    }
  }
  if (consecutiveLowMoodDays > maxConsecutiveLowMoodDays) {
    maxConsecutiveLowMoodDays = consecutiveLowMoodDays;
  }
  depression_score += maxConsecutiveLowMoodDays * 3;

  // Stress quiz-based scores
  const highStressQuizCount = stressQuizzes.filter((q) => q.score > 25).length;
  anxiety_score += highStressQuizCount * 3;
  stress_score += highStressQuizCount * 3;

  // Journal sentiment-based scores
  const negativeJournalCount = journalEntries.filter(
    (j) => j.sentimentLabel === "NEGATIVE" || j.sentimentLabel === "CRISIS",
  ).length;
  const fearSadnessCount = journalEntries.filter(
    (j) =>
      j.sentimentLabel === "NEGATIVE" &&
      (j.emotions.fear > 0.5 || j.emotions.sadness > 0.5),
  ).length;
  const angerCount = journalEntries.filter(
    (j) => j.emotions && j.emotions.anger > 0.6,
  ).length;

  depression_score += negativeJournalCount * 2;
  anxiety_score += fearSadnessCount * 1.5;
  anger_score += angerCount * 2;

  // Habit-based scores
  const sleepHabitDays = new Set(
    sleepHabitLogs.map((log) => log.date.toISOString().split("T")[0]),
  );
  const fourteenDaysRange = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });
  const uncheckedSleepDays = fourteenDaysRange.filter(
    (day) => !sleepHabitDays.has(day),
  ).length;
  sleep_score += uncheckedSleepDays * 2;

  // 3. Determine top issue
  const scores = {
    anxiety: anxiety_score,
    depression: depression_score,
    stress: stress_score,
    sleep: sleep_score,
    anger: anger_score,
  };

  let topIssue = "general";
  let maxScore = 0;
  for (const issue in scores) {
    if (scores[issue] > maxScore) {
      maxScore = scores[issue];
      topIssue = issue;
    }
  }

  if (maxScore === 0) {
    topIssue = "general";
  }

  // 4. Fetch recommendations based on top issue
  let recommendedArticles = [];
  let recommendedCourses = [];
  let recommendedTools = [];
  let therapistSpecializations = [];
  let message =
    "Based on your recent patterns, we think these resources might help you right now.";

  const articleQuery = { tags: { $regex: new RegExp(topIssue, "i") } };
  recommendedArticles = await Article.find(articleQuery).limit(3);

  const courseQuery = { tags: { $regex: new RegExp(topIssue, "i") } };
  recommendedCourses = await Course.find(courseQuery).limit(2);

  switch (topIssue) {
    case "anxiety":
      recommendedTools = ["5-4-3-2-1 Grounding", "Box Breathing"];
      therapistSpecializations = [
        "Anxiety & Panic Attacks",
        "Cognitive Behavioral Therapy (CBT)",
      ];
      message =
        "It looks like you've been feeling anxious lately. These resources are designed to help you find calm and regain control.";
      break;
    case "depression":
      recommendedTools = ["Gratitude Journaling", "Mindful Observation"];
      therapistSpecializations = [
        "Depression & Mood Disorders",
        "Mindfulness-Based Cognitive Therapy (MBCT)",
      ];
      message =
        "We've noticed your mood has been low. Remember that it's okay to not be okay. Here are some tools that may help lift your spirits.";
      break;
    case "stress":
      recommendedTools = ["4-7-8 Breathing", "Body Scan Meditation"];
      therapistSpecializations = ["Stress Management", "Work-Life Balance"];
      message =
        "High stress levels can be tough. We've selected some resources to help you unwind and manage the pressure.";
      break;
    case "sleep":
      recommendedTools = [
        "Progressive Muscle Relaxation",
        "Guided Sleep Meditation",
      ];
      therapistSpecializations = [
        "Sleep Issues & Insomnia",
        "Lifestyle & Wellness Coaching",
      ];
      message =
        "Getting enough quality sleep is crucial. Here are some resources to help you improve your sleep hygiene and rest better.";
      break;
    case "anger":
      recommendedTools = ["Mindful Anger-Release", "Box Breathing"];
      therapistSpecializations = ["Anger Management", "Emotional Regulation"];
      message =
        "Feeling angry is a valid emotion. These resources can help you understand and process it in a healthy way.";
      break;
    default: // general
      recommendedTools = ["Mindful Breathing", "Gratitude Journaling"];
      therapistSpecializations = ["General Wellness", "Talk Therapy"];
      recommendedArticles = await Article.find()
        .sort({ createdAt: -1 })
        .limit(3);
      recommendedCourses = await Course.find().sort({ createdAt: -1 }).limit(2);
      break;
  }

  res.status(200).json({
    success: true,
    data: {
      topIssue,
      score: maxScore,
      recommendations: {
        articles: recommendedArticles,
        courses: recommendedCourses,
        tools: recommendedTools,
        therapistSpecializations,
        message,
      },
    },
  });
});

// @desc    Proxy chat requests to the ML service
// @route   POST /api/ml/chat
// @access  Private
const ARIA_SYSTEM_PROMPT = `You are NeuroLink's AI wellness companion for university students.
Your name is Aria. You are warm, empathetic, validating, and non-judgmental.

Rules you MUST follow:
- Never diagnose any mental health condition or prescribe medications.
- If a user expresses suicidal thoughts, self-harm, or severe crisis, immediately respond with compassionate emergency helplines:
  * Bangladesh: Kaan Pete Roi at +8801779554391 or Emergency at 999 / 16773.
  * International: Call or text 988 (US/Canada), 111 (UK).
- Always remind users you are an AI companion, not a licensed therapist.
- Keep responses concise, warm, and helpful (under 160 words).
- When helpful, suggest grounding exercises (e.g. 4-7-8 breath, 5-4-3-2-1 senses reset).
- End with a gentle, supportive question.`;

// @desc    Proxy chat requests to the ML service with Groq & rule-based fallbacks
// @route   POST /api/ml/chat
// @access  Private
export const proxyChat = asyncHandler(async (req, res, next) => {
  const { messages, user_context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return next(new ErrorResponse("Messages are required", 400));
  }

  // 1. Try FastAPI ML Service if configured
  if (process.env.ML_SERVICE_URL) {
    try {
      const response = await axios.post(
        `${process.env.ML_SERVICE_URL}/api/ml/chat`,
        { messages, user_context },
        { timeout: 8000 }
      );
      if (response.data?.reply) {
        return res.status(200).json(response.data);
      }
    } catch (error) {
      console.warn("ML Service unavailable, falling back to direct LLM:", error.message);
    }
  }

  // 2. Direct Groq fallback if GROQ_API_KEY is available
  if (process.env.GROQ_API_KEY) {
    const groqModels = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
    const formattedMessages = [
      { role: "system", content: ARIA_SYSTEM_PROMPT },
      ...messages.slice(-8), // Keep context window efficient
    ];

    for (const model of groqModels) {
      try {
        const groqRes = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model,
            max_tokens: 220,
            temperature: 0.7,
            messages: formattedMessages,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        const reply = groqRes.data?.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, modelUsed: model });
        }
      } catch (err) {
        console.warn(`Groq model ${model} failed:`, err.response?.data?.error?.message || err.message);
      }
    }
  }

  // 3. Empathetic rule-based fallback if offline/rate-limited
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";

  // Crisis detection
  if (
    /suicid|kill myself|die|end my life|hurt myself|self harm|hanging|overdose|jump/.test(
      lastUserMsg
    )
  ) {
    return res.status(200).json({
      reply:
        "I hear how much pain you're in, and I want you to know you are not alone. Please reach out to someone who can help right now. You can call or text the Suicide & Crisis Lifeline at 988 (US/Canada), call 111 (UK), or in Bangladesh call Kaan Pete Roi at +8801779554391 or 999. Please connect with them—there is hope and support available for you.",
      isCrisis: true,
    });
  }

  if (/anxio|panic|stress|overwhelm|scared/.test(lastUserMsg)) {
    return res.status(200).json({
      reply:
        "I'm right here with you. When anxiety spikes, your nervous system is trying to protect you, but we can signal safety together. Let's do a simple 4-4-6 breath: inhale slowly through your nose for 4 seconds, hold gently for 4, and exhale smoothly through your mouth for 6. Would you like to try one round together?",
    });
  }

  if (/sleep|tired|insomnia|bed|exhaust/.test(lastUserMsg)) {
    return res.status(200).json({
      reply:
        "Resting can be so challenging when your mind is racing with academic deadlines or worries. Try releasing the tension in your jaw, dropping your shoulders down, and placing a soft hand on your chest. You don't have to force sleep right now—just resting your eyes and body is restorative. How is your room's lighting right now?",
    });
  }

  // General warm empathetic fallback
  return res.status(200).json({
    reply:
      "Thank you for sharing that with me. Academic life and daily stressors can feel really heavy, but taking a moment to acknowledge your feelings is a courageous first step. Remember to be gentle with yourself today. What is one small, kind thing you could do for yourself in the next hour?",
  });
});
