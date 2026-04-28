import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getMoods, createMood } from "../../api/mood";
import { toast } from "react-hot-toast";
import { Smile, Frown, Meh, Activity, Loader2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

const moods = [
  { label: "Anxious", value: 1, icon: "😖", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  { label: "Sad", value: 2, icon: "😢", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Calm", value: 4, icon: "😌", color: "text-brand-500", bg: "bg-brand-50", border: "border-brand-200" },
  { label: "Happy", value: 5, icon: "😁", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
];

const MoodTracker = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");

  const fetchMoods = async () => {
    try {
      const res = await getMoods("30d");
      if (res.data?.data) {
        const processed = res.data.data.map((m) => ({
          date: format(parseISO(m.timestamp), "MMM dd"),
          score: moods.find(md => md.label === m.mood)?.value || 3,
          fullDate: format(parseISO(m.timestamp), "MMM dd, yyyy HH:mm"),
          note: m.note,
          rawMood: m.mood
        }));
        setData(processed);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Please select a mood first.");
      return;
    }

    setSubmitting(true);
    try {
      await createMood({ mood: selectedMood.label, note });
      toast.success("Mood logged successfully!");
      setSelectedMood(null);
      setNote("");
      fetchMoods();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save mood.");
    } finally {
      setSubmitting(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 min-w-[200px]">
          <p className="font-semibold text-slate-800 mb-1">{data.fullDate}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{moods.find(m => m.label === data.rawMood)?.icon}</span>
            <span className="font-medium text-slate-600">{data.rawMood}</span>
          </div>
          {data.note && (
            <p className="text-sm text-slate-500 italic border-l-2 border-brand-200 pl-2">"{data.note}"</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
          <Activity className="text-brand-500" />
          Mood Tracker
        </h1>
        <p className="text-slate-500">Log how you're feeling and visualize your emotional landscape over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              How are you right now?
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${
                      selectedMood?.label === mood.label
                        ? `${mood.bg} ${mood.border} scale-[1.02] shadow-sm ring-2 ring-brand-100`
                        : "bg-transparent border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-4xl transform hover:scale-110 transition-transform">{mood.icon}</span>
                    <span className={`font-semibold ${selectedMood?.label === mood.label ? mood.color : "text-slate-600"}`}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4">Add a note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  placeholder="What's making you feel this way?"
                />
                <div className="text-right mt-1">
                  <span className="text-xs text-slate-400 font-medium">{note.length}/300</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedMood}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Log Mood"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History Graph */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 h-full min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-8">Your 30-Day Landscape</h2>
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-4" />
                <p className="text-slate-500 font-medium">Loading history...</p>
              </div>
            ) : data.length > 0 ? (
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 6]} 
                      axisLine={false} 
                      tickLine={false}
                      tick={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#a855f7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Frown className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No data yet</h3>
                <p className="text-slate-500 max-w-sm">Start logging your moods using the panel on the left to see your personalized emotional landscape here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
