import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getMoods, createMood } from "../../api/mood";
import { mlService } from "../../services/mlService";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  Smile,
  Activity,
  Loader2,
  Calendar,
  Zap,
  Sparkles,
  MessageSquareHeart,
  Tag,
  CheckCircle2,
  Heart,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// Aligned with mobile MoodTrackerScreen.jsx
const MOOD_OPTIONS = [
  { label: "Ecstatic", emoji: "🤩", score: 5, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", accent: "#10b981" },
  { label: "Happy", emoji: "😊", score: 4, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-300", accent: "#0284c7" },
  { label: "Calm", emoji: "😌", score: 4, color: "text-brand-600", bg: "bg-brand-50", border: "border-brand-300", accent: "#7c3aed" },
  { label: "Neutral", emoji: "😐", score: 3, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-300", accent: "#64748b" },
  { label: "Anxious", emoji: "😰", score: 2, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", accent: "#d97706" },
  { label: "Sad", emoji: "😢", score: 2, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-300", accent: "#db2777" },
  { label: "Overwhelmed", emoji: "🤯", score: 1, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-300", accent: "#e11d48" },
];

const FEELING_TAGS = [
  "Grateful",
  "Productive",
  "Tired",
  "Inspired",
  "Stressed",
  "Relaxed",
  "Focused",
  "Lonely",
  "Motivated",
  "Loved",
];

const MoodTracker = () => {
  const [data, setData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[1]);
  const [selectedTags, setSelectedTags] = useState(["Grateful"]);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [note, setNote] = useState("");
  const [aiSentiment, setAiSentiment] = useState(null);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  const fetchMoods = async () => {
    try {
      const res = await getMoods("30d");
      if (res.data?.data) {
        const raw = res.data.data;
        const processed = raw.map((m) => {
          const dateVal = m.timestamp;
          const parsed = dateVal
            ? typeof dateVal === "string"
              ? parseISO(dateVal)
              : new Date(dateVal)
            : new Date();
          const numericMood =
            typeof m.mood === "number"
              ? m.mood
              : MOOD_OPTIONS.find((md) => md.label === m.mood)?.score || 3;
          return {
            date: format(parsed, "MMM dd"),
            score: numericMood,
            fullDate: format(parsed, "MMM dd, yyyy HH:mm"),
            note: m.note,
            rawMood: m.mood,
          };
        });
        setData(processed);
        setRecentLogs([...raw].reverse().slice(0, 5));
      }
    } catch (err) {
      toast.error("Failed to load mood history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    setNote(text);
    if (text.trim().length === 0) {
      setAiSentiment(null);
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!note.trim()) return;
    setAnalyzingSentiment(true);
    try {
      const result = await mlService.analyzeSentiment(note);
      if (result) {
        setAiSentiment(result);
        toast.success(`AI detected: ${result.sentiment || "Neutral"} tone!`);
      }
    } catch (err) {
      // Fallback
    } finally {
      setAnalyzingSentiment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Please select a mood first.");
      return;
    }

    setSubmitting(true);
    try {
      // Compose note with tags & energy metadata
      const tagStr = selectedTags.length > 0 ? ` [Tags: ${selectedTags.join(", ")}]` : "";
      const energyStr = ` [⚡ Energy: ${energyLevel}/5]`;
      const fullNote = `${note.trim()}${tagStr}${energyStr}`.slice(0, 300);

      await createMood({
        mood: selectedMood.score,
        note: fullNote,
      });

      // Confetti burst
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7c3aed", "#34d399", "#f59e0b", "#ff6b6b", "#38bdf8"],
        });
      } catch (err) {}

      toast.success("Mood & energy logged successfully! 🌱");
      setNote("");
      setSelectedTags(["Grateful"]);
      setAiSentiment(null);
      fetchMoods();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save mood.");
    } finally {
      setSubmitting(false);
    }
  };

  const openAriaChat = (topic) => {
    window.dispatchEvent(
      new CustomEvent("open-aria-chat", {
        detail: {
          prompt: topic || `I'm feeling ${selectedMood.label} today and would like to talk.`,
        },
      }),
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-cream-dark min-w-[200px]">
          <p className="font-extrabold text-ink text-xs mb-1">{pData.fullDate}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">
              {MOOD_OPTIONS.find((m) => m.score === pData.score)?.emoji || "😊"}
            </span>
            <span className="font-bold text-brand">
              Score: {pData.score}/5
            </span>
          </div>
          {pData.note && (
            <p className="text-xs text-muted italic border-l-2 border-brand/30 pl-2">
              "{pData.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="card-lift p-6 md:p-8 bg-linear-to-r from-brand-50 via-white to-cream relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-brand-light text-brand rounded-full inline-flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Emotional Landscape
              </span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight">
              Mood & Wellness Tracker 🎭
            </h1>
            <p className="text-muted font-medium text-sm mt-1">
              Reflect on your mental state, track energy fluctuations, and let AI discover trends.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAriaChat()}
            className="btn-primary self-start sm:self-center inline-flex items-center gap-2 text-xs"
          >
            <MessageSquareHeart className="w-4 h-4" />
            Talk to Aria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Section (Mobile Screen Parity) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-lift p-6 md:p-8 bg-white">
            <h2 className="text-lg font-black text-ink mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand" />
              How are you feeling right now?
            </h2>
            <p className="text-xs text-muted mb-5">
              Select the emotional state that best resonates with you
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 7 Mood Options from Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood?.label === mood.label;
                  return (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => setSelectedMood(mood)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-150 border-2 cursor-pointer ${
                        isSelected
                          ? `${mood.bg} ${mood.border} scale-105 shadow-sm ring-2 ring-brand-400`
                          : "bg-cream/40 border-cream-dark hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-3xl transform hover:scale-110 transition-transform">
                        {mood.emoji}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? mood.color : "text-ink"
                        }`}
                      >
                        {mood.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Energy Level Selector (⚡ 1 to 5) */}
              <div className="p-4 rounded-2xl bg-cream/50 border border-cream-dark">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Energy Level: {energyLevel}/5
                  </span>
                  <span className="text-xs font-bold text-muted">
                    {energyLevel >= 4
                      ? "High Energy ⚡"
                      : energyLevel === 3
                        ? "Balanced 🔋"
                        : "Low Battery 🪫"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        energyLevel >= lvl
                          ? "bg-amber-400 text-ink shadow-xs"
                          : "bg-white border border-cream-dark text-muted"
                      }`}
                    >
                      {lvl} ⚡
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeling Tags (from Mobile Version) */}
              <div>
                <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-brand" />
                  What influenced your mood?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEELING_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                          active
                            ? "bg-brand text-white shadow-xs scale-105"
                            : "bg-cream/60 hover:bg-white text-muted border border-cream-dark"
                        }`}
                      >
                        {active ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reflection Note & Live AI Sentiment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-ink uppercase tracking-wider">
                    Reflection Note (Optional)
                  </label>
                  {note.length > 5 && (
                    <button
                      type="button"
                      onClick={handleAnalyzeSentiment}
                      disabled={analyzingSentiment}
                      className="text-[11px] font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      {analyzingSentiment ? "Analyzing..." : "Check AI Sentiment"}
                    </button>
                  )}
                </div>
                <textarea
                  value={note}
                  onChange={handleNoteChange}
                  maxLength={300}
                  rows={3}
                  className="input-field w-full resize-none"
                  placeholder="What's on your mind or contributing to how you feel?"
                />
                <div className="flex items-center justify-between mt-1 text-xs">
                  {aiSentiment ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-mint/15 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Tone: {aiSentiment.sentiment || "Positive"} ({Math.round((aiSentiment.confidence || 0.85) * 100)}%)
                    </span>
                  ) : (
                    <span className="text-muted text-[11px]">Keep it real and honest.</span>
                  )}
                  <span className="text-muted font-bold text-[11px]">
                    {note.length}/300
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedMood}
                className="w-full btn-primary py-3.5 flex justify-center items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording Mood...
                  </>
                ) : (
                  <>
                    <span>Log My State</span>
                    <span>✨</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: 30-Day Emotional Landscape & Recent Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Chart Card */}
          <div className="card-lift p-6 md:p-8 bg-white min-h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-ink flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand" />
                  Your 30-Day Landscape
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Visualizing score trajectory over recent check-ins
                </p>
              </div>
              <span className="text-xs font-bold text-brand bg-brand-light px-3 py-1 rounded-full">
                {data.length} Logs recorded
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-brand mb-3" />
                <p className="text-muted font-bold text-sm">
                  Loading your emotional history...
                </p>
              </div>
            ) : data.length > 0 ? (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="moodColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f9e4cc"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a08060", fontSize: 11, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[1, 5]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a08060", fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#7c3aed"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#moodColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <span className="text-4xl mb-3">🌱</span>
                <h3 className="text-base font-extrabold text-ink mb-1">
                  No mood entries yet
                </h3>
                <p className="text-xs text-muted max-w-xs">
                  Log your first mood on the left to reveal your interactive graph!
                </p>
              </div>
            )}
          </div>

          {/* Recent Timeline Logs */}
          <div className="card-lift p-6 bg-white">
            <h3 className="text-base font-black text-ink mb-4 flex items-center justify-between">
              <span>Recent Check-In Reflections</span>
              <span className="text-xs text-muted font-bold">Latest 5</span>
            </h3>

            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((item, idx) => {
                  const dateStr = item.timestamp
                    ? format(
                        typeof item.timestamp === "string"
                          ? parseISO(item.timestamp)
                          : new Date(item.timestamp),
                        "MMM dd, yyyy • h:mm a",
                      )
                    : "Today";
                  const score = typeof item.mood === "number" ? item.mood : 4;
                  const matchedMood =
                    MOOD_OPTIONS.find((m) => m.score === score) || MOOD_OPTIONS[1];

                  return (
                    <div
                      key={item._id || idx}
                      className="p-3.5 rounded-2xl bg-cream/40 border border-cream-dark flex items-start gap-3 hover:bg-cream/70 transition-colors"
                    >
                      <span className="text-2xl shrink-0 p-1.5 bg-white rounded-xl shadow-xs">
                        {matchedMood.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-ink">
                            {matchedMood.label} ({score}/5)
                          </span>
                          <span className="text-[11px] text-muted font-bold">
                            {dateStr}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-ink/80 font-medium mt-1 leading-relaxed">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted italic">No recent history.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
