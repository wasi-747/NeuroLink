import React, { useState, useEffect } from "react";
import { getEntries, createEntry } from "../../api/gratitude";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  HeartHandshake,
  Loader2,
  Heart,
  Calendar,
  CheckCircle2,
  Flame,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { format, parseISO, isSameDay, differenceInCalendarDays } from "date-fns";

const PROMPT_SUGGESTIONS = [
  "A friend or classmate who smiled or helped me today",
  "A quiet moment of peaceful coffee or tea",
  "A challenge I overcame or a lesson I learned",
  "My body and breath keeping me alive and well",
];

const calculateStreak = (entries) => {
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
  const today = new Date();
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

const GratitudeLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState(["", "", ""]);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [streak, setStreak] = useState(0);

  const fetchEntries = async () => {
    try {
      const res = await getEntries();
      if (res.data?.data) {
        const sortedEntries = res.data.data.sort(
          (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
        );
        setEntries(sortedEntries);
        setStreak(calculateStreak(sortedEntries));

        // Check if there's already an entry for today
        if (sortedEntries.length > 0) {
          const today = new Date();
          const firstDate = sortedEntries[0].createdAt || sortedEntries[0].date;
          if (firstDate) {
            const lastEntryDate =
              typeof firstDate === "string" ? parseISO(firstDate) : new Date(firstDate);
            setHasLoggedToday(isSameDay(today, lastEntryDate));
          }
        }
      }
    } catch (err) {
      toast.error("Failed to load gratitude history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleApplySuggestion = (text) => {
    const emptyIndex = items.findIndex((i) => i.trim() === "");
    if (emptyIndex !== -1) {
      handleItemChange(emptyIndex, text);
    } else {
      handleItemChange(0, text);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filledItems = items.filter((item) => item.trim() !== "");

    if (filledItems.length === 0) {
      toast.error("Please add at least one thing you are grateful for.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEntry({ items: filledItems });

      // Confetti celebration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f472b6", "#fb7185", "#7c3aed", "#34d399", "#f59e0b"],
        });
      } catch (err) {}

      toast.success("Gratitude logged! Your streak is active ✨");
      setItems(["", "", ""]);
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to log gratitude");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="card-lift p-6 md:p-8 bg-linear-to-r from-pink-50 via-white to-cream relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-pink-100 text-pink-700 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <HeartHandshake className="w-3.5 h-3.5" />
                Gratitude Sanctuary
              </span>
              {streak > 0 && (
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-amber-500/15 text-amber-700 rounded-full inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {streak} Day Streak
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-ink tracking-tight">
              Daily Gratitude Log 💖
            </h1>
            <p className="text-muted font-medium text-sm mt-1">
              Reflecting on positive moments rewires neural pathways for lasting calmness and resilience.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card-lift p-6 md:p-8 bg-white">
            <h2 className="text-lg font-black text-ink mb-1 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              Today's Reflections
            </h2>
            <p className="text-xs text-muted mb-5">
              Take 60 seconds to note 3 things you appreciate today
            </p>

            {hasLoggedToday ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-black text-emerald-900 text-base">
                  Awesome Consistency!
                </h3>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  You have already logged your gratitude for today. Come back tomorrow to keep your streak glowing!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      I am grateful for...
                    </label>
                    <input
                      type="text"
                      value={items[index]}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      placeholder={
                        index === 0
                          ? "A comforting person or friend..."
                          : index === 1
                            ? "A peaceful moment or small victory..."
                            : "Something pleasant I saw, tasted, or felt..."
                      }
                      className="input-field w-full"
                      maxLength={120}
                    />
                  </div>
                ))}

                {/* Prompt Inspiration Buttons */}
                <div className="pt-2">
                  <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Need an idea? Tap to insert:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplySuggestion(sug)}
                        className="text-[11px] font-bold text-muted bg-cream/70 hover:bg-white hover:text-ink px-2.5 py-1.5 rounded-xl border border-cream-dark transition-all text-left truncate max-w-full cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-coral py-3.5 flex justify-center items-center gap-2 mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Gratitude...
                    </>
                  ) : (
                    <>
                      <span>Save Gratitude</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-ink flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              Past Reflections
            </h2>
            <span className="text-xs text-muted font-bold">
              {entries.length} Entries logged
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : entries.length === 0 ? (
            <div className="card-lift p-8 text-center bg-white">
              <span className="text-3xl mb-2 block">🌸</span>
              <p className="text-muted font-bold text-sm">
                Your gratitude journal is waiting. Start with today's 3 reflections!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  className="card-lift p-5 bg-white border-2 border-cream-dark hover:border-pink-200"
                >
                  <div className="text-xs font-black text-pink-600 mb-3 tracking-wider uppercase flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    {format(
                      parseISO(entry.createdAt || entry.date),
                      "EEEE, MMM d, yyyy",
                    )}
                  </div>

                  <ul className="space-y-2">
                    {entry.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-ink leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GratitudeLog;

