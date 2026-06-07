import React, { useState } from "react";
import { mlService } from "../services/mlService";
import { motion, AnimatePresence } from "framer-motion";

const FAQSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await mlService.searchFAQ(query);
      setResults(data.results);
      setExpandedId(data.results[0]?.id || null);
    } catch (error) {
      console.error("Failed to search FAQ:", error);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const truncate = (str, n) => {
    return str.length > n ? str.slice(0, n - 1) + "..." : str;
  };

  return (
    <div className="card-lift p-6 relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-mint to-brand-light rounded-t-3xl"></div>

      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="text-4xl">🔍</div>
        <div>
          <h2 className="text-lg font-extrabold text-ink">Mental Health FAQ</h2>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. anxiety treatment"
          className="input-field flex-1"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="btn-primary px-5 disabled:opacity-50"
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
            "Search"
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? (
            results.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: index * 0.05 }}
                className={`border-2 rounded-2xl overflow-hidden transition-all duration-200 ${expandedId === item.id ? "border-brand bg-brand-light/30" : "border-cream-dark hover:border-brand/30"}`}
              >
                <div
                  className="p-4 cursor-pointer flex justify-between items-start gap-4"
                  onClick={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                >
                  <h3 className="text-sm font-semibold leading-snug text-ink">
                    {item.question}
                  </h3>
                  <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cream-dark text-xs text-ink font-medium">
                    {item.relevance_score}
                  </span>
                </div>

                {expandedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 pb-4 text-sm text-muted whitespace-pre-wrap leading-relaxed"
                  >
                    <div className="h-px bg-cream-dark w-full mb-3"></div>
                    {item.answer.length > 300 ? (
                      <>
                        {truncate(item.answer, 300)}
                        <span className="text-brand font-medium ml-1 hover:underline cursor-pointer">
                          Read more
                        </span>
                      </>
                    ) : (
                      item.answer
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60"
            >
              <div className="text-4xl mb-3">📚</div>
              <p className="text-sm text-muted">
                Search the knowledge base for answers to common mental health
                questions.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FAQSearch;
