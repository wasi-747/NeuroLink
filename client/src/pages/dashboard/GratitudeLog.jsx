import React, { useState, useEffect } from "react";
import { getEntries, createEntry } from "../../api/gratitude";
import { toast } from "react-hot-toast";
import { HeartHandshake, Loader2, Heart, Calendar } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

const GratitudeLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState(["", "", ""]);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await getEntries();
      if (res.data?.data) {
        const sortedEntries = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEntries(sortedEntries);
        
        // Check if there's already an entry for today
        if (sortedEntries.length > 0) {
          const today = new Date();
          const lastEntryDate = parseISO(sortedEntries[0].createdAt || sortedEntries[0].date);
          setHasLoggedToday(isSameDay(today, lastEntryDate));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filledItems = items.filter(item => item.trim() !== "");
    
    if (filledItems.length === 0) {
      toast.error("Please add at least one thing you are grateful for.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEntry({ items: filledItems });
      toast.success("Gratitude logged! Your streak is active.");
      setItems(["", "", ""]);
      fetchEntries(); // Refetch to update list and hasLoggedToday
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to log gratitude");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
          <HeartHandshake className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Daily Gratitude Log</h1>
        <p className="text-slate-500">Reflecting on positive moments builds resilience. What are you thankful for today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Today's Reflections
            </h2>

            {hasLoggedToday ? (
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-800 mb-1">Awesome job!</h3>
                <p className="text-sm text-emerald-600">You've already logged your gratitude for today. Come back tomorrow to keep the streak alive!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">I am grateful for...</label>
                    <input
                      type="text"
                      value={items[index]}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      placeholder={`Reflection ${index + 1}`}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      maxLength={100}
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none flex justify-center items-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Gratitude"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* History Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" /> Past Entries
          </h2>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 border-dashed">
              <p className="text-slate-500 font-medium">Your gratitude journal is empty. Start by logging your first reflections today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-pink-200 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                  
                  <div className="text-sm font-bold text-pink-500 mb-4 tracking-wide uppercase">
                    {format(parseISO(entry.createdAt || entry.date), "EEEE, MMM d, yyyy")}
                  </div>
                  
                  <ul className="space-y-3">
                    {entry.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 font-medium leading-relaxed">{item}</span>
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

// Quick import patch
import { CheckCircle2 } from "lucide-react";

export default GratitudeLog;
