import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMoods } from "../../api/mood";
import { getHabits, getLogs as getHabitLogs } from "../../api/habit";
import { getEntries as getJournalEntries } from "../../api/journal";
import { getHistory as getQuizHistory } from "../../api/stressQuiz";
import { getEntries as getGratitudeEntries } from "../../api/gratitude";
import { SparkLineChart } from "@tremor/react";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ForYou from "./ForYou";
import WeeklyReport from "./WeeklyReport";
import { motion } from "framer-motion";

const StatCard = ({
  title,
  value,
  icon,
  linkTo,
  unit,
  children,
  colorClass,
}) => (
  <div className="bg-white rounded-3xl border-2 border-cream-dark p-5 hover:-translate-y-1 transition-transform duration-200 shadow-[4px_4px_0px_0px_#F9E4CC] hover:shadow-[6px_6px_0px_0px_#E8D0B0]">
    <div
      className={`w-10 h-10 flex items-center justify-center text-xl rounded-2xl mb-4 ${
        colorClass === "brand"
          ? "bg-brand-light text-brand"
          : colorClass === "mint"
            ? "bg-mint/10 text-emerald-600"
            : colorClass === "golden"
              ? "bg-golden/10 text-amber-600"
              : colorClass === "sky"
                ? "bg-sky/10 text-sky-600"
                : "bg-coral/10 text-red-500"
      }`}
    >
      {icon}
    </div>
    <div>
      <p className="text-3xl font-extrabold text-ink tracking-tight">
        {value}
        {unit && (
          <span className="text-base font-bold text-muted ml-1 tracking-normal">
            {unit}
          </span>
        )}
      </p>
      <h3 className="text-xs font-bold text-muted uppercase tracking-wide mt-1">
        {title}
      </h3>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

import MoodCheckIn from "../../components/MoodCheckIn";
import SentimentJournal from "../../components/SentimentJournal";
import SleepTracker from "../../components/SleepTracker";
import FAQSearch from "../../components/FAQSearch";

const calculateGratitudeStreak = (entries) => {
  if (entries.length === 0) return 0;
  const dates = entries
    .map((e) => format(parseISO(e.createdAt), "yyyy-MM-dd"))
    .sort()
    .reverse();
  const uniqueDates = [...new Set(dates)];
  let streak = 0;
  let today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const yesterdayStr = format(
    new Date().setDate(today.getDate() - 1),
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

const Dashboard = () => {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState([]);
  const [habitCompletion, setHabitCompletion] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [lastStressScore, setLastStressScore] = useState(null);
  const [gratitudeStreak, setGratitudeStreak] = useState(0);
  const [quote, setQuote] = useState({ content: "", author: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const moodRes = await getMoods("7d").catch(() => ({
          data: { data: [] },
        }));
        if (moodRes.data && moodRes.data.data) {
          const processedMoods = moodRes.data.data.map((m) => ({
            date: format(parseISO(m.timestamp), "MMM dd"),
            mood:
              m.mood === "Happy"
                ? 5
                : m.mood === "Calm"
                  ? 4
                  : m.mood === "Sad"
                    ? 2
                    : m.mood === "Anxious"
                      ? 1
                      : 0,
          }));
          setMoodData(processedMoods);
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
            possibleLogs > 0
              ? Math.round((actualLogs / possibleLogs) * 100)
              : 0,
          );
        }

        const journalRes = await getJournalEntries().catch(() => ({
          data: { data: [] },
        }));
        if (journalRes.data?.data) {
          const monthStart = startOfMonth(today);
          const monthEnd = endOfMonth(today);
          const count = journalRes.data.data.filter((e) =>
            isWithinInterval(parseISO(e.createdAt), {
              start: monthStart,
              end: monthEnd,
            }),
          ).length;
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

        const fallbackQuotes = [
          {
            content:
              "Healing takes time, and asking for help is a courageous step.",
            author: "Mariska Hargitay",
          },
          {
            content:
              "You don't have to control your thoughts. You just have to stop letting them control you.",
            author: "Dan Millman",
          },
          {
            content:
              "There is hope, even when your brain tells you there isn't.",
            author: "John Green",
          },
          {
            content:
              "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.",
            author: "Kahlil Gibran",
          },
          {
            content:
              "What mental health needs is more sunlight, more candor, and more unashamed conversation.",
            author: "Glenn Close",
          },
        ];
        const randomQuote =
          fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        setQuote(randomQuote);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Loading your NeuroVerse...
        </p>
      </div>
    );
  }

  const moodChartColors = {
    increase: "emerald",
    moderate: "amber",
    decrease: "rose",
  };

  const getMoodTrendColor = () => {
    if (moodData.length < 2) return moodChartColors.moderate;
    const last = moodData[moodData.length - 1].mood;
    const prev = moodData[moodData.length - 2].mood;
    if (last > prev) return moodChartColors.increase;
    if (last < prev) return moodChartColors.decrease;
    return moodChartColors.moderate;
  };

  return (
    <div className="space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-muted font-semibold text-sm mb-1">
          {new Date().getHours() < 12
            ? "☀️ Good morning"
            : new Date().getHours() < 17
              ? "🌤️ Good afternoon"
              : "🌙 Good evening"}
        </p>
        <h1 className="text-4xl font-extrabold text-ink">
          Hey, {user?.name || "Student"}! 👋
        </h1>
        <p className="text-muted text-sm mt-2">
          How are you feeling today? Let's check in. ✨
        </p>
      </motion.div>

      {quote.content && (
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-linear-to-r from-brand-light via-white to-cream-dark rounded-3xl p-5 mb-8 border-2 border-brand/10 relative overflow-hidden"
        >
          <span className="absolute -top-4 -left-2 text-[120px] text-brand/5 font-black select-none">
            "
          </span>

          <p className="text-base font-bold text-ink italic relative z-10">
            "{quote.content}"
          </p>
          <p className="text-xs text-muted mt-2 font-semibold">
            — Daily Reminder 💜
          </p>
        </motion.div>
      )}

      <WeeklyReport />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Mood"
          value={
            moodData.length > 0
              ? moodData[moodData.length - 1].mood >= 4
                ? "Good"
                : moodData[moodData.length - 1].mood >= 3
                  ? "Okay"
                  : "Low"
              : "N/A"
          }
          icon="😊"
          linkTo="/mood"
          colorClass="brand"
        ></StatCard>

        <StatCard
          title="Habits"
          value={habitCompletion}
          unit="%"
          icon="✅"
          linkTo="/habits"
          colorClass="mint"
        ></StatCard>

        <StatCard
          title="Streak"
          value={gratitudeStreak}
          unit=""
          icon="🔥"
          linkTo="/gratitude"
          colorClass="golden"
        ></StatCard>

        <StatCard
          title="Journal"
          value={journalCount}
          unit=""
          icon="✍️"
          linkTo="/journal"
          colorClass="sky"
        />

        <StatCard
          title="Stress"
          value={lastStressScore ? lastStressScore.score : "N/A"}
          unit=""
          icon="💆"
          linkTo="/stress-quiz"
          colorClass="coral"
        ></StatCard>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/mood"
            className="font-bold text-sm rounded-2xl px-4 py-2.5 border-2 border-transparent hover:border-current hover:scale-105 transition-all duration-150 bg-brand-light text-brand"
          >
            😊 Log Mood
          </Link>
          <Link
            to="/journal"
            className="font-bold text-sm rounded-2xl px-4 py-2.5 border-2 border-transparent hover:border-current hover:scale-105 transition-all duration-150 bg-sky/10 text-sky-600"
          >
            📝 Journal
          </Link>
          <Link
            to="/habits"
            className="font-bold text-sm rounded-2xl px-4 py-2.5 border-2 border-transparent hover:border-current hover:scale-105 transition-all duration-150 bg-mint/10 text-emerald-600"
          >
            ✅ Habits
          </Link>
          <Link
            to="/stress-quiz"
            className="font-bold text-sm rounded-2xl px-4 py-2.5 border-2 border-transparent hover:border-current hover:scale-105 transition-all duration-150 bg-coral/10 text-red-500"
          >
            💆 Stress
          </Link>
          <Link
            to="/gratitude"
            className="font-bold text-sm rounded-2xl px-4 py-2.5 border-2 border-transparent hover:border-current hover:scale-105 transition-all duration-150 bg-golden/10 text-amber-600"
          >
            🙏 Gratitude
          </Link>
        </div>
      </div>
      <section className="mt-12 mb-8">
        <h3 className="text-2xl font-extrabold tracking-tight text-ink mb-1">
          🤖 Your AI Wellness Toolkit
        </h3>
        <p className="text-sm text-muted mb-6">
          Powered by real ML models trained just for you 🧠
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <MoodCheckIn />
            <SleepTracker />
          </div>
          <div className="space-y-6 flex flex-col h-full">
            <SentimentJournal />
            <FAQSearch />
          </div>
        </div>
      </section>

      <section className="mt-16 pt-8 border-t-2 border-cream-dark/30">
        <h3 className="text-2xl font-extrabold tracking-tight text-ink mb-1">
          ✨ Made for You
        </h3>
        <p className="text-sm text-muted mb-8">Based on your activity</p>
        <ForYou />
      </section>
    </div>
  );
};

export default Dashboard;
