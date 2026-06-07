import React, { useState } from "react";
import { mlService } from "../services/mlService";

const SleepTracker = () => {
  const [form, setForm] = useState({
    sleepHours: "",
    stressLevel: 5,
    sleepQuality: 5,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("articles");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sleepHours) return;
    setLoading(true);
    try {
      const data = await mlService.getSleepInsights(form);
      setResult(data);
      setActiveTab("articles");
    } catch (error) {
      console.error("Failed to get sleep insights:", error);
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-600 border-green-500 bg-green-50";
    if (score >= 40) return "text-yellow-600 border-yellow-500 bg-yellow-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const formatIssue = (issue) => {
    return issue
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span>🌙</span> Sleep & Stress Tracker
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        <div>
          <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wide">
            Sleep Hours (last night)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="12"
            name="sleepHours"
            value={form.sleepHours}
            onChange={handleChange}
            required
            className="w-full bg-white border-2 border-cream-dark rounded-2xl px-4 py-2 text-sm font-medium text-ink focus:border-brand focus:outline-none focus:ring-0 transition-colors duration-150"
            placeholder="e.g. 6.5"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-muted uppercase tracking-wide">
              Stress Level
            </label>
            <span className="text-xs font-bold text-brand bg-brand-light px-2 py-0.5 rounded-full">
              {form.stressLevel} / 8
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            name="stressLevel"
            value={form.stressLevel}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-muted uppercase tracking-wide">
              Sleep Quality
            </label>
            <span className="text-xs font-bold text-brand bg-brand-light px-2 py-0.5 rounded-full">
              {form.sleepQuality} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            name="sleepQuality"
            value={form.sleepQuality}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.sleepHours}
          className="w-full bg-brand text-white font-bold py-2.5 px-4 rounded-2xl hover:bg-brand-dark hover:scale-105 active:scale-95 transition-all duration-150 shadow-[3px_3px_0px_0px_#5B21B6] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-50 mt-4"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          ) : "Get Insights"}
        </button>
      </form>

      {result && (
        <div className="mt-8 pt-6 border-t border-cream-dark animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-3 shadow-inner ${getScoreColor(result.sleep_score)}`}
            >
              <div className="text-center">
                <span className="text-3xl font-bold">
                  {Math.round(result.sleep_score)}
                </span>
                <span className="text-xs block opacity-70">/ 100</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {result.issues_detected.map((issue) => (
                <span
                  key={issue}
                  className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100 flex items-center gap-1"
                >
                  ⚠️ {formatIssue(issue)}
                </span>
              ))}
              {result.issues_detected.length === 0 && (
                <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100 flex items-center gap-1">
                  ✨ Excellent Sleep Health
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex border-b border-gray-200 mb-4">
              {["articles", "courses", "tools", "habits"].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {result.recommendations[activeTab]?.length > 0 ? (
                result.recommendations[activeTab].map((item) => (
                  <span
                    key={item}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <div className="text-sm text-gray-400 italic py-2 text-center w-full">
                  No specific {activeTab} recommended at this time.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepTracker;
