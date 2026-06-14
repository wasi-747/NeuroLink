import React, { useState } from "react";
import { mlService } from "../services/mlService";
import { motion } from "framer-motion";

const SentimentJournal = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (text.trim().length <= 10) return;
    setLoading(true);
    try {
      const data = await mlService.analyzeSentiment(text);
      setResult(data);
    } catch (error) {
      console.error("Failed to analyze sentiment:", error);
    }
    setLoading(false);
  };

  const getBadgeStyle = (sentiment) => {
    if (sentiment === "NEUTRAL") return "bg-sky/10 text-sky-600 border-sky/20";
    if (sentiment === "NEGATIVE")
      return "bg-golden/10 text-golden border-golden/20";
    if (sentiment === "CRISIS")
      return "bg-coral/10 text-coral border-coral/20 animate-pulse-soft";
    return "bg-cream-dark text-ink border-cream-dark";
  };

  const getBadgeLabel = (sentiment) => {
    if (sentiment === "NEUTRAL") return "😊 All Good!";
    if (sentiment === "NEGATIVE") return "😔 Feeling Low";
    if (sentiment === "CRISIS") return "🆘 Reach Out Now";
    return sentiment;
  };

  return (
    <div className="card-lift p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-golden to-coral rounded-t-3xl"></div>

      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="text-4xl">✍️</div>
        <div>
          <h2 className="text-lg font-extrabold text-ink">
            Journal & Sentiment Analysis
          </h2>
          <p className="text-sm text-muted">
            Write freely — our AI reads between the lines
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling today?"
          className="input-field w-full flex-1 min-h-30 resize-none"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || text.trim().length <= 10}
          className="btn-primary w-full disabled:opacity-50"
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
            "Analyze"
          )}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-cream-dark"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`px-4 py-2 rounded-full font-medium border ${getBadgeStyle(result.sentiment)}`}
            >
              {getBadgeLabel(result.sentiment)}
            </div>
            <div className="text-sm font-medium text-gray-500">
              {Math.round(result.confidence * 100)}% Confident
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="w-full bg-cream-dark rounded-full h-2 mb-6">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.round(result.confidence * 100)}%` }}
            />
          </div>

          {result.requires_crisis_support && (
            <div className="mt-4 text-left text-sm font-bold text-coral bg-coral/10 p-4 rounded-2xl border-2 border-coral/20 flex gap-3 items-start">
              <span className="text-xl mt-0.5">⚠️</span>
              <div>
                <strong className="block mb-1">You're not alone.</strong>
                Please reach out to a counselor or call a mental health helpline
                immediately.
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SentimentJournal;
