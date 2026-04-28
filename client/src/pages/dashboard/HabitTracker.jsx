import React, { useState, useEffect } from "react";
import { getHabits, createHabit, getLogs, logHabit, deleteHabit } from "../../api/habit";
import { toast } from "react-hot-toast";
import { TrendingUp, Plus, Loader2, CheckCircle2, Circle, Flame, Calendar as CalendarIcon, Target, X, Trash2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import * as Icons from "lucide-react";

const AVAILABLE_ICONS = [
  "Moon", "Dumbbell", "Brain", "Book", "SmartphoneOff",
  "Droplets", "Sun", "HeartPulse", "Coffee", "Briefcase", "Music", "Star"
];

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Star");
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchData = async () => {
    try {
      const [habitsRes, logsRes] = await Promise.all([
        getHabits(),
        getLogs(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'))
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
      await createHabit({ name: newHabitName, icon: selectedIcon });
      toast.success("Habit added!");
      setNewHabitName("");
      setIsAdding(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add habit");
    }
  };

  const handleToggleLog = async (habitId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = logs.find(l => l.habit === habitId && format(parseISO(l.date), 'yyyy-MM-dd') === dateStr);
    const isCompleted = existingLog ? !existingLog.completed : true;

    // Optimistic UI update
    const newLogs = [...logs];
    if (existingLog) {
      existingLog.completed = isCompleted;
      setLogs([...newLogs]);
    } else {
      setLogs([...newLogs, { habit: habitId, date: dateStr, completed: isCompleted }]);
    }

    try {
      await logHabit(habitId, { date: dateStr, completed: isCompleted });
    } catch (err) {
      toast.error("Failed to update habit log");
      fetchData(); // Revert on failure
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Delete this habit forever?")) return;
    try {
      await deleteHabit(id);
      toast.success("Habit deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete habit");
    }
  };

  const calculateCompletion = (habitId) => {
    const habitLogs = logs.filter(l => l.habit === habitId && l.completed);
    return Math.round((habitLogs.length / 7) * 100);
  };

  const calculateStreak = (habitId) => {
    const habitLogs = logs.filter(l => l.habit === habitId && l.completed).map(l => format(parseISO(l.date), 'yyyy-MM-dd'));
    let streak = 0;
    const todayStr = format(today, 'yyyy-MM-dd');
    if (habitLogs.includes(todayStr)) streak++;
    return streak; // Simplified streak for UI
  };

  const RenderIcon = ({ name, className }) => {
    const IconComponent = Icons[name] || Icons.Star;
    return <IconComponent className={className} />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading habits...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
            <TrendingUp className="text-purple-500" />
            Habit Tracker
          </h1>
          <p className="text-slate-500">Build consistency step-by-step. Track your daily routines for the current week.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? "Cancel" : "Add Custom Habit"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm mb-8 animate-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10" />
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" /> Create New Habit
          </h3>
          <form onSubmit={handleAddHabit} className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Drink 2L Water"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                required
              />
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {AVAILABLE_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 rounded-lg transition-colors ${selectedIcon === icon ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 ring-inset' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    <RenderIcon name={icon} className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors shrink-0">
              Save Habit
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header Row: Days of Week */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] bg-slate-50/80 border-b border-slate-100 p-4 gap-4 sticky top-0 z-10">
          <div className="font-semibold text-slate-600 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-400" /> Current Week
          </div>
          <div className="hidden md:grid grid-cols-7 gap-2 items-center text-center">
            {weekDays.map(date => (
              <div key={date.toISOString()} className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">{format(date, 'EEE')}</span>
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mt-1 ${isSameDay(date, today) ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700'}`}>
                  {format(date, 'd')}
                </span>
              </div>
            ))}
          </div>
          <div className="hidden md:block text-right font-semibold text-slate-600 pr-4">Progress</div>
        </div>

        {/* Habit List */}
        <div className="divide-y divide-slate-100">
          {habits.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              You aren't tracking any habits yet. Start by adding one above!
            </div>
          ) : (
            habits.map((habit) => {
              const completion = calculateCompletion(habit._id);
              const streak = calculateStreak(habit._id);
              
              return (
                <div key={habit._id} className="p-4 grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] gap-4 items-center group hover:bg-slate-50/50 transition-colors">
                  {/* Habit Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                      <RenderIcon name={habit.icon} className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate pr-2">{habit.name}</h4>
                      <div className="flex items-center gap-1 text-xs font-medium text-orange-500 mt-0.5">
                        <Flame className="w-3.5 h-3.5" /> {streak} day streak
                      </div>
                    </div>
                    {!habit.isDefault && (
                      <button onClick={() => handleDeleteHabit(habit._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Days Label (Visible only on mobile) */}
                  <div className="md:hidden flex justify-between px-2 mb-2">
                    {weekDays.map(date => (
                      <span key={`m-${date.toISOString()}`} className={`text-[10px] font-bold uppercase ${isSameDay(date, today) ? 'text-purple-600' : 'text-slate-400'}`}>
                        {format(date, 'EE')}
                      </span>
                    ))}
                  </div>

                  {/* Checkbox Strip */}
                  <div className="flex justify-between md:grid md:grid-cols-7 gap-2 px-2 md:px-0">
                    {weekDays.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const log = logs.find(l => l.habit === habit._id && format(parseISO(l.date), 'yyyy-MM-dd') === dateStr);
                      const isCompleted = log?.completed;
                      const isFuture = date > today;
                      
                      return (
                        <div key={dateStr} className="flex justify-center">
                          <button
                            disabled={isFuture}
                            onClick={() => handleToggleLog(habit._id, date)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              isFuture ? 'opacity-30 cursor-not-allowed bg-slate-100' :
                              isCompleted 
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-110' 
                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" strokeWidth={2.5} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Stats */}
                  <div className="hidden md:flex flex-col items-end justify-center pr-4">
                    <span className="text-lg font-bold text-slate-800">{completion}%</span>
                    <div className="w-full max-w-[80px] bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
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
