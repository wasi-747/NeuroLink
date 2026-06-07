import React, { useState } from "react";
import { mlService } from "../services/mlService";
import { motion } from "framer-motion";

const MoodCheckIn = () => {
  const [form, setForm] = useState({
    gender: "Male",
    age: "",
    yearOfStudy: "1",
    cgpa: "",
    maritalStatus: "No",
    hasDepression: false,
    hasAnxiety: false,
    hasPanic: false,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await mlService.predictMood(form);
      setResult(data);
    } catch (error) {
      console.error("Failed to predict mood:", error);
    }
    setLoading(false);
  };

  const getResultDetails = (score) => {
    if (score >= 4.5)
      return {
        text: "🌟 Excellent!",
        color: "text-golden bg-golden/10 border-golden/20",
      };
    if (score >= 3.5)
      return {
        text: "😊 Good!",
        color: "text-emerald-600 bg-mint/10 border-mint/20",
      };
    if (score >= 2.5)
      return {
        text: "😐 Neutral",
        color: "text-sky-600 bg-sky/10 border-sky/20",
      };
    if (score >= 1.5)
      return {
        text: "😔 Low",
        color: "text-red-500 bg-coral/10 border-coral/20",
      };
    return {
      text: "💙 Very Low",
      color: "text-brand bg-brand-light border-brand/20",
    };
  };

  return (
    <div className="card-lift p-6 relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-brand to-golden rounded-t-3xl"></div>

      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="text-4xl">🎭</div>
        <div>
          <h2 className="text-lg font-extrabold text-ink">
            Daily Mood Check-In
          </h2>
          <p className="text-sm text-muted">
            Tell me how you're feeling and I'll predict your mood score
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wide">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wide">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wide">
              Year of Study
            </label>
            <select
              name="yearOfStudy"
              value={form.yearOfStudy}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wide">
              CGPA (0.0-4.0)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              name="cgpa"
              value={form.cgpa}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wide">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
            className="input-field w-full"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className="space-y-2 pt-2 border-t border-cream-dark">
          <label className="flex items-center gap-2 text-sm font-bold text-ink cursor-pointer">
            <input
              type="checkbox"
              name="hasDepression"
              checked={form.hasDepression}
              onChange={handleChange}
              className="rounded text-brand focus:ring-brand w-4 h-4"
            />
            Experiencing Depression
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink cursor-pointer">
            <input
              type="checkbox"
              name="hasAnxiety"
              checked={form.hasAnxiety}
              onChange={handleChange}
              className="rounded text-brand focus:ring-brand w-4 h-4"
            />
            Experiencing Anxiety
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink cursor-pointer">
            <input
              type="checkbox"
              name="hasPanic"
              checked={form.hasPanic}
              onChange={handleChange}
              className="rounded text-brand focus:ring-brand w-4 h-4"
            />
            Experiencing Panic Attacks
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-4 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-1">
              <div
                className="w-2 h-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          ) : (
            "Predict My Mood"
          )}
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-cream-dark flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`text-2xl font-extrabold px-6 py-3 rounded-2xl border-2 mb-3 text-center ${getResultDetails(result.mood_score).color}`}
          >
            {getResultDetails(result.mood_score).text}
            <div className="text-sm font-bold opacity-70 mt-1">
              Score: {result.mood_score.toFixed(1)} / 5.0
            </div>
          </motion.div>

          {result.mood_score < 2.5 && (
            <div className="mt-2 text-center text-sm font-bold text-brand bg-brand-light px-4 py-3 rounded-2xl border-2 border-brand/20">
              Consider speaking to a counselor 💙
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MoodCheckIn;
