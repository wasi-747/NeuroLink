import React, { useState, useEffect } from "react";
import { getHabits, createHabit, getLogs, logHabit, deleteHabit } from "../../api/habit";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  TrendingUp,
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  Flame,
  Calendar as CalendarIcon,
  Target,
  X,
  Trash2,
  Sparkles,
  Brain,
  Droplets,
  Dumbbell,
  PhoneOff,
  Book,
  Moon,
  Sun,
  HeartPulse,
  Coffee,
  Briefcase,
  Music,
  Star,
  Check,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

const CATEGORIES = ["All", "Mind", "Health", "Fitness", "Sleep"];

const HABIT_ICONS = {
  Moon,
  Dumbbell,
  Brain,
  Book,
  PhoneOff,
  Droplets,
  Sun,
  HeartPulse,
  Coffee,
  Briefcase,
  Music,
  Star,
};

const AVAILABLE_ICONS = Object.keys(HABIT_ICONS);

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Mind");
  const [selectedIcon, setSelectedIcon] = useState("Brain");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchData = async () => {
    try {
      const [habitsRes, logsRes] = await Promise.all([
        getHabits(),
        getLogs(format(weekStart, "yyyy-MM-dd"), format(weekEnd, "yyyy-MM-dd")),
      ]);

      if (habitsRes.data?.data) setHabits(habitsRes.data.data);
      if (logsRes.data?.data) setLogs(logsRes.data.data);
    } catch (err) {
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await createHabit({
        name: newHabitName,
        icon: selectedIcon,
        category: selectedCategory,
      });
      toast.success("Habit added to your routine! 🌱");
      setNewHabitName("");
      setIsAdding(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add habit");
    }
  };

  const handleToggleLog = async (habitId, date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const existingLog = logs.find(
      (l) =>
        l.habit === habitId &&
        format(parseISO(l.date), "yyyy-MM-dd") === dateStr,
    );
    const isCompleted = existingLog ? !existingLog.completed : true;

    // Trigger confetti if completing today's habit
    if (isCompleted && isSameDay(date, today)) {
      try {
        confetti({
          particleCount: 45,
          spread: 50,
          origin: { y: 0.65 },
          colors: ["#34d399", "#10b981", "#7c3aed", "#f59e0b"],
        });
      } catch (e) {}
    }

    // Optimistic UI update
    const newLogs = [...logs];
    if (existingLog) {
      existingLog.completed = isCompleted;
      setLogs([...newLogs]);
    } else {
      setLogs([
        ...newLogs,
        { habit: habitId, date: dateStr, completed: isCompleted },
      ]);
    }

    try {
      await logHabit(habitId, { date: dateStr, completed: isCompleted });
    } catch (err) {
      toast.error("Failed to update habit log");
      fetchData(); // Revert on failure
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Delete this habit from your matrix?")) return;
    try {
      await deleteHabit(id);
      toast.success("Habit removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete habit");
    }
  };

  const calculateCompletion = (habitId) => {
    const habitLogs = logs.filter((l) => l.habit === habitId && l.completed);
    return Math.round((habitLogs.length / 7) * 100);
  };

  const calculateStreak = (habitId) => {
    const habitLogs = logs
      .filter((l) => l.habit === habitId && l.completed)
      .map((l) => format(parseISO(l.date), "yyyy-MM-dd"));
    let streak = 0;
    const todayStr = format(today, "yyyy-MM-dd");
    if (habitLogs.includes(todayStr)) streak++;
    return streak;
  };

  const RenderIcon = ({ name, className }) => {
    const IconComponent = HABIT_ICONS[name] || Star;
    return <IconComponent className={className} />;
  };

  // Filtered habits by Category
  const filteredHabits =
    activeCategoryFilter === "All"
      ? habits
      : habits.filter(
          (h) =>
            h.category?.toLowerCase() === activeCategoryFilter.toLowerCase(),
        );

  // Overall Matrix Stats
  const todayStr = format(today, "yyyy-MM-dd");
  const completedTodayCount = habits.filter((h) => {
    const log = logs.find(
      (l) =>
        l.habit === h._id &&
        format(parseISO(l.date), "yyyy-MM-dd") === todayStr,
    );
    return log?.completed;
  }).length;

  const totalHabitsCount = habits.length;
  const overallPercentage =
    totalHabitsCount > 0
      ? Math.round((completedTodayCount / totalHabitsCount) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-muted font-bold animate-pulse">
          Loading your Neural Habit Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Neural Habit Matrix Overview Banner (Mobile Parity) */}
      <div className="card-lift p-6 md:p-8 bg-linear-to-br from-[#064e3b] via-[#065f46] to-[#042f2e] text-white relative overflow-hidden shadow-lg border-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full inline-flex items-center gap-1.5 border border-emerald-400/30">
                <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                NEURAL HABIT MATRIX
              </span>
              <span className="text-xs font-bold text-emerald-200/80">
                Current Week
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Build Lasting Consistency 🌱
            </h1>
            <p className="text-emerald-100/80 font-medium text-sm md:text-base mt-1 max-w-md">
              Small atomic routines compound into emotional resilience and university success.
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs font-extrabold text-emerald-200">
              <span className="bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/50">
                ✅ {completedTodayCount} of {totalHabitsCount} Done Today
              </span>
              <span className="bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/50">
                ⚡ {overallPercentage}% Daily Velocity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-950 font-extrabold text-xs hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? "Cancel" : "Add Habit"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Habit Form Card */}
      {isAdding && (
        <div className="card-lift p-6 md:p-8 bg-white border-2 border-brand/20 shadow-md">
          <h3 className="text-base font-black text-ink mb-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand" /> Create New Habit
          </h3>
          <p className="text-xs text-muted mb-4">
            Pick a routine that supports your physical or mental well-being
          </p>

          <form onSubmit={handleAddHabit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. 10m Box Breathing, Drink 2L Water"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
                  Category
                </label>
                <div className="flex gap-1.5">
                  {["Mind", "Health", "Fitness", "Sleep"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-brand text-white shadow-xs"
                          : "bg-cream/60 border border-cream-dark text-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1.5">
                Choose an Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedIcon === icon
                        ? "bg-brand text-white shadow-xs scale-110 ring-2 ring-brand-300"
                        : "bg-cream/60 border border-cream-dark text-muted hover:bg-white"
                    }`}
                  >
                    <RenderIcon name={icon} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">
                Save to Matrix ✨
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter Pills (From Mobile Version) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-sm scale-105"
                  : "bg-white border-2 border-cream-dark text-muted hover:text-ink hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Habits Grid Table */}
      <div className="card-lift bg-white overflow-hidden p-0">
        {/* Table Header: Current Week Days */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] bg-cream/40 border-b-2 border-cream-dark p-4 gap-4 items-center">
          <div className="font-extrabold text-xs text-muted uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand" /> Routine
          </div>

          <div className="hidden md:grid grid-cols-7 gap-2 items-center text-center">
            {weekDays.map((date) => (
              <div key={date.toISOString()} className="flex flex-col items-center">
                <span className="text-[10px] font-black text-muted uppercase tracking-wider">
                  {format(date, "EEE")}
                </span>
                <span
                  className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl mt-0.5 ${
                    isSameDay(date, today)
                      ? "bg-brand text-white shadow-xs"
                      : "text-ink bg-white border border-cream-dark"
                  }`}
                >
                  {format(date, "d")}
                </span>
              </div>
            ))}
          </div>

          <div className="hidden md:block text-right font-extrabold text-xs text-muted uppercase tracking-wider pr-4">
            Progress
          </div>
        </div>

        {/* Habit Rows */}
        <div className="divide-y-2 divide-cream-dark/40">
          {filteredHabits.length === 0 ? (
            <div className="p-12 text-center text-muted font-bold">
              <span className="text-3xl mb-2 block">🌿</span>
              No habits found in this category. Start by adding one above!
            </div>
          ) : (
            filteredHabits.map((habit) => {
              const completion = calculateCompletion(habit._id);
              const streak = calculateStreak(habit._id);

              return (
                <div
                  key={habit._id}
                  className="p-4 grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] gap-4 items-center group hover:bg-cream/20 transition-colors"
                >
                  {/* Habit Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-light flex items-center justify-center shrink-0 text-brand">
                      <RenderIcon name={habit.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-ink truncate pr-2">
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {streak}d streak
                        </span>
                        {habit.category && (
                          <span className="text-[10px] font-bold text-muted uppercase">
                            • {habit.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {!habit.isDefault && (
                      <button
                        onClick={() => handleDeleteHabit(habit._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 cursor-pointer"
                        title="Remove habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Checkbox Strip */}
                  <div className="flex justify-between md:grid md:grid-cols-7 gap-2 px-2 md:px-0">
                    {weekDays.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const log = logs.find(
                        (l) =>
                          l.habit === habit._id &&
                          format(parseISO(l.date), "yyyy-MM-dd") === dateStr,
                      );
                      const isCompleted = log?.completed;
                      const isFuture = date > today;

                      return (
                        <div key={dateStr} className="flex justify-center">
                          <button
                            disabled={isFuture}
                            onClick={() => handleToggleLog(habit._id, date)}
                            title={`${format(date, "EEE, MMM dd")}: ${
                              isCompleted ? "Completed" : "Not yet"
                            }`}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                              isFuture
                                ? "opacity-30 cursor-not-allowed bg-cream/40"
                                : isCompleted
                                  ? "bg-emerald-500 text-white shadow-sm scale-105 ring-2 ring-emerald-300"
                                  : "bg-cream/60 border border-cream-dark text-muted/40 hover:bg-white hover:text-emerald-500"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 stroke-[3]" />
                            ) : (
                              <Circle className="w-4 h-4" strokeWidth={2.5} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Stats */}
                  <div className="hidden md:flex flex-col items-end justify-center pr-4">
                    <span className="text-sm font-black text-ink">
                      {completion}%
                    </span>
                    <div className="w-full max-w-[80px] bg-cream-dark rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;

