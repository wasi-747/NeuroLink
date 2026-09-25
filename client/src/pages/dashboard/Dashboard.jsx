import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";
import { getMoods, createMood } from "../../api/mood";
import { getHabits, getLogs as getHabitLogs } from "../../api/habit";
import { getEntries as getJournalEntries } from "../../api/journal";
import { getHistory as getQuizHistory } from "../../api/stressQuiz";
import { getEntries as getGratitudeEntries } from "../../api/gratitude";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";
import {
  TrendingUp,
  BookOpen,
  Smile,
  Zap,
  Award,
  ChevronsRight,
  Loader2,
  Flame,
  Sparkles,
  RefreshCw,
  MessageSquareHeart,
  ArrowUpRight,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ForYou from "./ForYou";
import WeeklyReport from "./WeeklyReport";
import { motion, AnimatePresence } from "framer-motion";

import MoodCheckIn from "../../components/MoodCheckIn";
import SentimentJournal from "../../components/SentimentJournal";
import SleepTracker from "../../components/SleepTracker";
import FAQSearch from "../../components/FAQSearch";

const calculateGratitudeStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  const dates = entries
    .map((e) => {
      const dateVal = e.createdAt || e.date;
      if (!dateVal) return format(new Date(), "yyyy-MM-dd");
      const parsed = typeof dateVal === "string" ? parseISO(dateVal) : new Date(dateVal);
      return format(parsed, "yyyy-MM-dd");
    })
    .sort()
    .reverse();
  const uniqueDates = [...new Set(dates)];
  let streak = 0;
  let today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const yesterdayStr = format(
    new Date(today.getTime() - 24 * 60 * 60 * 1000),
    "yyyy-MM-dd",
  );

  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = parseISO(uniqueDates[i]);
      const next = parseISO(uniqueDates[i + 1]);
      if (differenceInCalendarDays(current, next) === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
  return streak;
};

const AFFIRMATIONS = [
  {
    content: "Healing takes time, and asking for help is a courageous step.",
    author: "Mariska Hargitay",
  },
  {
    content: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
  },
  {
    content: "There is hope, even when your brain tells you there isn't.",
    author: "John Green",
  },
  {
    content: "Small daily steps of self-kindness create monumental changes over time.",
    author: "NeuroLink Wisdom",
  },
  {
    content: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
  },
  {
    content: "Exams and grades measure memory and moments, not your true intelligence or worth.",
    author: "Campus Life Guide",
  },
  {
    content: "Rest is not a reward you earn; it is an essential human fuel you need to thrive.",
    author: "Student Wellness",
  },
  {
    content: "What mental health needs is more sunlight, more candor, and more unashamed conversation.",
    author: "Glenn Close",
  },
];

const StatCard = ({
  title,
  value,
  icon,
  linkTo,
  unit,
  subtitle,
  progress,
  colorClass,
}) => {
  const content = (
    <div className="card-lift p-5 h-full flex flex-col justify-between group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 flex items-center justify-center text-xl rounded-2xl transition-transform duration-200 group-hover:scale-110 ${
            colorClass === "brand"
              ? "bg-brand-light text-brand"
              : colorClass === "mint"
                ? "bg-mint/15 text-emerald-600"
                : colorClass === "golden"
                  ? "bg-golden/15 text-amber-600"
                  : colorClass === "sky"
                    ? "bg-sky/15 text-sky-600"
                    : "bg-coral/15 text-red-500"
          }`}
        >
          {icon}
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted/60 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-ink tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-bold text-muted tracking-normal">
              {unit}
            </span>
          )}
        </div>
        <h3 className="text-xs font-extrabold text-muted uppercase tracking-wider mt-1">
          {title}
        </h3>
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-cream-dark/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                colorClass === "mint"
                  ? "bg-mint"
                  : colorClass === "brand"
                    ? "bg-brand"
                    : colorClass === "golden"
                      ? "bg-golden"
                      : "bg-sky"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <p className="text-[11px] font-semibold text-muted mt-2 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState([]);
  const [habitCompletion, setHabitCompletion] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [lastStressScore, setLastStressScore] = useState(null);
  const [gratitudeStreak, setGratitudeStreak] = useState(0);
  const [quote, setQuote] = useState(AFFIRMATIONS[0]);
  const [isShufflingQuote, setIsShufflingQuote] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [isLoggingMood, setIsLoggingMood] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const moodRes = await getMoods("7d").catch(() => ({
        data: { data: [] },
      }));
      if (moodRes.data && moodRes.data.data) {
        const rawMoods = moodRes.data.data;
        const processedMoods = rawMoods.map((m) => {
          const dateVal = m.timestamp;
          const parsed = dateVal
            ? typeof dateVal === "string"
              ? parseISO(dateVal)
              : new Date(dateVal)
            : new Date();
          const numericMood =
            typeof m.mood === "number"
              ? m.mood
              : m.mood === "Happy"
                ? 5
                : m.mood === "Calm"
                  ? 4
                  : m.mood === "Sad"
                    ? 2
                    : m.mood === "Anxious"
                      ? 1
                      : 3;
          return {
            date: format(parsed, "MMM dd"),
            isoDate: format(parsed, "yyyy-MM-dd"),
            mood: numericMood,
          };
        });
        setMoodData(processedMoods);

        // Check if user already logged today
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const foundToday = processedMoods.find((m) => m.isoDate === todayStr);
        if (foundToday) {
          setTodayMood(foundToday.mood);
        }
      }

      const habitsRes = await getHabits().catch(() => ({
        data: { data: [] },
      }));
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      const habitLogsRes = await getHabitLogs(
        format(weekStart, "yyyy-MM-dd"),
        format(weekEnd, "yyyy-MM-dd"),
      ).catch(() => ({ data: { data: [] } }));
      if (habitsRes.data?.data && habitLogsRes.data?.data) {
        const totalHabits = habitsRes.data.data.length;
        const possibleLogs = totalHabits * 7;
        const actualLogs = habitLogsRes.data.data.length;
        setHabitCompletion(
          possibleLogs > 0 ? Math.round((actualLogs / possibleLogs) * 100) : 0,
        );
      }

      const journalRes = await getJournalEntries().catch(() => ({
        data: { data: [] },
      }));
      if (journalRes.data?.data) {
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const count = journalRes.data.data.filter((e) => {
          const dateVal = e.createdAt;
          if (!dateVal) return false;
          const parsed =
            typeof dateVal === "string" ? parseISO(dateVal) : new Date(dateVal);
          return isWithinInterval(parsed, {
            start: monthStart,
            end: monthEnd,
          });
        }).length;
        setJournalCount(count);
      }

      const quizRes = await getQuizHistory().catch(() => ({
        data: { data: [] },
      }));
      if (quizRes.data?.data && quizRes.data.data.length > 0) {
        setLastStressScore(quizRes.data.data[0]);
      }

      const gratitudeRes = await getGratitudeEntries().catch(() => ({
        data: { data: [] },
      }));
      if (gratitudeRes.data?.data) {
        setGratitudeStreak(calculateGratitudeStreak(gratitudeRes.data.data));
      }

      // Pick a random quote
      setQuote(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShuffleQuote = () => {
    setIsShufflingQuote(true);
    setTimeout(() => {
      const remaining = AFFIRMATIONS.filter((q) => q.content !== quote.content);
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      setQuote(next || AFFIRMATIONS[0]);
      setIsShufflingQuote(false);
    }, 200);
  };

  const handleQuickMood = async (score, label) => {
    if (isLoggingMood) return;
    setIsLoggingMood(true);
    setTodayMood(score);

    // Fire joyful confetti burst!
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#7c3aed", "#34d399", "#f59e0b", "#ff6b6b", "#38bdf8"],
      });
    } catch (e) {
      // Confetti fallback
    }

    try {
      await createMood({
        mood: score,
        note: `Quick check-in from dashboard (${label})`,
      });
      toast.success(`Logged ${label}! +25 Mindful XP earned 🌱`, {
        icon: "✨",
      });

      // Update local moodData array so cards react instantly
      const todayStr = format(new Date(), "MMM dd");
      const todayIso = format(new Date(), "yyyy-MM-dd");
      setMoodData((prev) => {
        const filtered = prev.filter((item) => item.isoDate !== todayIso);
        return [...filtered, { date: todayStr, isoDate: todayIso, mood: score }];
      });
    } catch (err) {
      toast.error("Could not save mood, but feeling noted!");
    } finally {
      setIsLoggingMood(false);
    }
  };

  const openAriaChat = (prompt) => {
    window.dispatchEvent(
      new CustomEvent("open-aria-chat", {
        detail: { prompt },
      }),
    );
  };

  // Gamification Level Calculation
  const totalXP =
    gratitudeStreak * 25 +
    habitCompletion * 1.5 +
    journalCount * 30 +
    (todayMood ? 25 : 0) +
    (moodData.length * 10);

  let currentLevel = 1;
  let levelTitle = "🌱 Sprout Seeker";
  let xpForNext = 150;
  let prevLevelXP = 0;

  if (totalXP >= 450) {
    currentLevel = 4;
    levelTitle = "⭐ Serenity Master";
    xpForNext = 800;
    prevLevelXP = 450;
  } else if (totalXP >= 250) {
    currentLevel = 3;
    levelTitle = "🌸 Zen Pioneer";
    xpForNext = 450;
    prevLevelXP = 250;
  } else if (totalXP >= 100) {
    currentLevel = 2;
    levelTitle = "🌿 Mindful Explorer";
    xpForNext = 250;
    prevLevelXP = 100;
  }

  const levelProgress = Math.min(
    100,
    Math.max(
      8,
      Math.round(((totalXP - prevLevelXP) / (xpForNext - prevLevelXP)) * 100),
    ),
  );

  const MOOD_OPTIONS = [
    { score: 5, emoji: "🤩", label: "Energized", desc: "Top of the world" },
    { score: 4, emoji: "😊", label: "Good", desc: "Feeling positive" },
    { score: 3, emoji: "😌", label: "Calm", desc: "Centered & steady" },
    { score: 2, emoji: "😐", label: "Meh", desc: "Getting through it" },
    { score: 1, emoji: "🌧️", label: "Low", desc: "Need some gentleness" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500 mb-4" />
        <p className="text-muted font-bold animate-pulse">
          Loading your NeuroVerse...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top Welcome & Gamification Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-lift p-6 md:p-8 bg-linear-to-br from-white via-cream to-cream-dark/40 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-brand-light text-brand rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Level {currentLevel} • {levelTitle}
              </span>
              {gratitudeStreak > 0 && (
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-amber-500/15 text-amber-700 rounded-full inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                  {gratitudeStreak} Day Streak
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
              Welcome back, {user?.name || "Student"}! 👋
            </h1>
            <p className="text-muted font-medium text-sm md:text-base mt-1">
              Your mental sanctuary is ready. Let's make today mindful and rewarding.
            </p>

            {/* XP Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-muted mb-1.5">
                <span>Wellness XP: {Math.round(totalXP)} pts</span>
                <span>Next Rank: {xpForNext} XP</span>
              </div>
              <div className="w-full bg-cream-dark/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-cream-dark">
                <div
                  className="bg-linear-to-r from-brand to-brand-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Mood 1-Click Interactive Bar */}
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-3xl border-2 border-cream-dark shadow-sm shrink-0">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-brand" />
                Quick Check-In
              </span>
              {todayMood && (
                <span className="text-[11px] font-bold text-emerald-600 bg-mint/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Logged
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {MOOD_OPTIONS.map((item) => {
                const isSelected = todayMood === item.score;
                return (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => handleQuickMood(item.score, item.label)}
                    disabled={isLoggingMood}
                    title={`${item.label}: ${item.desc}`}
                    className={`flex flex-col items-center justify-center w-12 h-14 rounded-2xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-brand text-white scale-110 shadow-md ring-2 ring-brand-400"
                        : "bg-cream/60 hover:bg-white hover:scale-105 hover:shadow-xs border border-cream-dark/60 text-ink"
                    }`}
                  >
                    <span className="text-2xl leading-none">{item.emoji}</span>
                    <span
                      className={`text-[9px] font-bold mt-1 uppercase ${
                        isSelected ? "text-white" : "text-muted"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Affirmation Card with Shuffle */}
      {quote.content && (
        <motion.div
          layout
          className="bg-linear-to-r from-brand-light via-white to-cream-dark rounded-3xl p-5 border-2 border-brand/15 relative overflow-hidden shadow-xs"
        >
          <span className="absolute -top-4 -left-2 text-[120px] text-brand/5 font-black select-none pointer-events-none">
            "
          </span>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex-1 pr-4">
              <p className="text-base font-bold text-ink italic leading-relaxed">
                "{quote.content}"
              </p>
              <p className="text-xs text-brand font-bold mt-2 flex items-center gap-1.5">
                <span>— {quote.author}</span>
                <span className="text-muted font-normal">• Daily Affirmation</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleShuffleQuote}
                disabled={isShufflingQuote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand/20 text-brand text-xs font-bold hover:bg-brand hover:text-white transition-all duration-150 shadow-xs cursor-pointer"
                title="Shuffle for another thought"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isShufflingQuote ? "animate-spin" : ""
                  }`}
                />
                Shuffle
              </button>
              <button
                type="button"
                onClick={() =>
                  openAriaChat(`Let's reflect on this quote: "${quote.content}"`)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-all duration-150 shadow-xs cursor-pointer"
              >
                <MessageSquareHeart className="w-3.5 h-3.5" />
                Reflect with Aria
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly Report Integration */}
      <WeeklyReport />

      {/* Upgraded Interactive Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Mood"
          value={
            todayMood
              ? MOOD_OPTIONS.find((m) => m.score === todayMood)?.label || "Logged"
              : moodData.length > 0
                ? moodData[moodData.length - 1].mood >= 4
                  ? "Good"
                  : moodData[moodData.length - 1].mood >= 3
                    ? "Okay"
                    : "Low"
                : "Not logged"
          }
          icon={
            todayMood
              ? MOOD_OPTIONS.find((m) => m.score === todayMood)?.emoji || "😊"
              : "😊"
          }
          linkTo="/mood"
          subtitle={todayMood ? "✅ Logged for today" : "Tap to log today"}
          colorClass="brand"
        />

        <StatCard
          title="Habits"
          value={habitCompletion}
          unit="%"
          icon="✅"
          linkTo="/habits"
          progress={habitCompletion}
          subtitle="Weekly target: 70%"
          colorClass="mint"
        />

        <StatCard
          title="Streak"
          value={gratitudeStreak}
          unit="days"
          icon="🔥"
          linkTo="/gratitude"
          subtitle={gratitudeStreak > 0 ? "Consistency champion" : "Start your streak"}
          colorClass="golden"
        />

        <StatCard
          title="Journal"
          value={journalCount}
          unit="entries"
          icon="✍️"
          linkTo="/journal"
          subtitle="Written this month"
          colorClass="sky"
        />

        <StatCard
          title="Stress"
          value={
            lastStressScore
              ? `${lastStressScore.score}/10`
              : "Check"
          }
          unit=""
          icon="💆"
          linkTo="/stress-quiz"
          subtitle={
            lastStressScore
              ? lastStressScore.score <= 3
                ? "Low stress zone"
                : lastStressScore.score <= 6
                  ? "Moderate level"
                  : "Elevated tension"
              : "Take quick quiz"
          }
          colorClass="coral"
        />
      </div>

      {/* Aria Quick Spark Prompts */}
      <div className="card-lift p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="text-sm font-extrabold text-ink">
                Quick Talk with Aria
              </h3>
              <p className="text-xs text-muted">
                One-tap prompts to talk through whatever is on your plate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAriaChat()}
            className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Open Chat <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-2">
          {[
            {
              title: "Study & Deadlines",
              desc: "Feeling overwhelmed by classes",
              prompt: "I am feeling overwhelmed with university study deadlines and need a realistic calming strategy.",
              emoji: "📚",
            },
            {
              title: "Box Breathing",
              desc: "Quick 2-minute reset",
              prompt: "Can you guide me through a 2-minute box breathing relaxation exercise?",
              emoji: "🧘",
            },
            {
              title: "Quiet Bedtime",
              desc: "Tips to unwind tonight",
              prompt: "My mind is racing and I can't sleep. Can you give me calming bedtime guidance?",
              emoji: "🌙",
            },
            {
              title: "Positive Reframing",
              desc: "Shift out of self-doubt",
              prompt: "I'm having heavy self-critical thoughts today. Can you help me gently reframe them?",
              emoji: "🌸",
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openAriaChat(item.prompt)}
              className="p-3 rounded-2xl bg-cream/50 hover:bg-brand-light/60 border border-cream-dark hover:border-brand/30 text-left transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-xs font-bold text-ink group-hover:text-brand transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-muted font-medium mt-1 truncate">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* AI Wellness Toolkit Section */}
      <section className="mt-12 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-ink flex items-center gap-2">
              <span>🤖</span> Your AI Wellness Toolkit
            </h3>
            <p className="text-sm text-muted">
              Powered by real ML models trained just for university students 🧠
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-6">
            <MoodCheckIn />
            <SleepTracker />
          </div>
          <div className="flex flex-col gap-6">
            <SentimentJournal />
            <FAQSearch />
          </div>
        </div>
      </section>

      {/* Made For You Section */}
      <section className="mt-16 pt-8 border-t-2 border-cream-dark/40">
        <h3 className="text-2xl font-extrabold tracking-tight text-ink mb-1 flex items-center gap-2">
          <span>✨</span> Made for You
        </h3>
        <p className="text-sm text-muted mb-8">
          Personalized daily recommendations based on your logs
        </p>
        <ForYou />
      </section>
    </div>
  );
};

export default Dashboard;

