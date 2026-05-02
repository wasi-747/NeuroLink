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

const StatCard = ({
  title,
  value,
  icon,
  linkTo,
  unit,
  children,
  colorClass,
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
    <div
      className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass}-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110`}
    />
    <div className="z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </h3>
        <div className={`p-2 rounded-xl bg-slate-50 text-${colorClass}-600`}>
          {icon}
        </div>
      </div>
      <p className="text-4xl font-extrabold text-slate-800 tracking-tight">
        {value}
        {unit && (
          <span className="text-lg font-medium text-slate-400 ml-1 tracking-normal">
            {unit}
          </span>
        )}
      </p>
    </div>
    <div className="mt-6 z-10">{children}</div>
    {linkTo && (
      <Link
        to={linkTo}
        className={`text-sm font-semibold text-${colorClass}-600 hover:text-${colorClass}-700 mt-6 flex items-center transition-colors`}
      >
        View Details <ChevronsRight size={16} className="ml-1" />
      </Link>
    )}
  </div>
);

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your wellness snapshot. Keep up the great work.
        </p>
      </div>

      <WeeklyReport />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Avg. Mood (7 days)"
          value={
            moodData.length > 0
              ? moodData[moodData.length - 1].mood >= 4
                ? "Good"
                : moodData[moodData.length - 1].mood >= 3
                  ? "Okay"
                  : "Low"
              : "N/A"
          }
          icon={<Smile />}
          linkTo="/mood"
          colorClass="brand"
        >
          {moodData.length > 1 ? (
            <div className="h-14 mt-2">
              <SparkLineChart
                data={moodData}
                index="date"
                categories={["mood"]}
                colors={[getMoodTrendColor()]}
                className="h-full w-full"
                showAnimation={true}
              />
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-400 mt-2 bg-slate-50 p-2 rounded-md border border-slate-100">
              Log more moods to see your weekly trend.
            </p>
          )}
        </StatCard>

        <StatCard
          title="Weekly Habit Completion"
          value={habitCompletion}
          unit="%"
          icon={<TrendingUp />}
          linkTo="/habits"
          colorClass="purple"
        >
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${habitCompletion}%` }}
            ></div>
          </div>
        </StatCard>

        <StatCard
          title="Gratitude Streak"
          value={gratitudeStreak}
          unit={gratitudeStreak === 1 ? "day" : "days"}
          icon={<Award />}
          linkTo="/gratitude"
          colorClass="pink"
        >
          <p className="text-sm font-medium text-slate-500 mt-2">
            Keep the streak going! What are you grateful for today?
          </p>
        </StatCard>

        <StatCard
          title="Journal Entries"
          value={journalCount}
          unit="this month"
          icon={<BookOpen />}
          linkTo="/journal"
          colorClass="blue"
        />

        <StatCard
          title="Last Stress Score"
          value={lastStressScore ? lastStressScore.score : "N/A"}
          unit={lastStressScore ? `/ 40` : ""}
          icon={<Zap />}
          linkTo="/stress-quiz"
          colorClass="rose"
        >
          {lastStressScore && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 bg-rose-100 text-rose-800`}
            >
              {lastStressScore.level}
            </span>
          )}
        </StatCard>

        {quote.content && (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden sm:col-span-2 lg:col-span-1 border border-slate-800 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10 group-hover:bg-brand-500/20 transition-colors" />
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Quote of the Day
            </h3>
            <blockquote className="text-lg font-medium leading-relaxed">
              "{quote.content}"
            </blockquote>
            <cite className="block mt-4 text-sm font-semibold text-brand-300">
              - {quote.author}
            </cite>
          </div>
        )}
      </div>

      <div className="mt-12 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Link
            to="/mood"
            className="p-4 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-2xl text-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-brand-100 shadow-sm flex flex-col items-center gap-2"
          >
            <Smile className="w-6 h-6 mb-1 opacity-80" /> Log Mood
          </Link>
          <Link
            to="/journal"
            className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-100 shadow-sm flex flex-col items-center gap-2"
          >
            <BookOpen className="w-6 h-6 mb-1 opacity-80" /> Note Journal
          </Link>
          <Link
            to="/habits"
            className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl text-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-purple-100 shadow-sm flex flex-col items-center gap-2"
          >
            <TrendingUp className="w-6 h-6 mb-1 opacity-80" /> Check Habits
          </Link>
          <Link
            to="/stress-quiz"
            className="p-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-rose-100 shadow-sm flex flex-col items-center gap-2"
          >
            <Zap className="w-6 h-6 mb-1 opacity-80" /> Check Stress
          </Link>
          <Link
            to="/gratitude"
            className="p-4 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-2xl text-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-pink-100 shadow-sm flex flex-col items-center gap-2 col-span-2 md:col-span-1 lg:col-span-1"
          >
            <Award className="w-6 h-6 mb-1 opacity-80" /> Add Gratitude
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <ForYou />
      </div>
    </div>
  );
};

export default Dashboard;
