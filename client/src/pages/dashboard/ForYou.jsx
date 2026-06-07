import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

const ForYou = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ml/recommendations");
      setRecommendations(res.data.data);
      setError(null);
    } catch (err) {
      setError("Could not fetch recommendations. Please try again later.");
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[20vh]">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin mb-4" />
        <p className="text-muted font-bold animate-pulse">
          Finding recommendations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-coral/10 p-4 rounded-3xl border-2 border-coral/20 text-center text-coral font-bold text-sm">
        {error}
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const { topIssue, recommendations: recs, message } = recommendations;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={handleRefresh}
          className="text-sm font-bold text-brand hover:text-brand-dark flex items-center gap-2 px-4 py-2 bg-brand-light rounded-2xl transition-colors"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Refresh Ideas
        </button>
      </div>

      {message && (
        <div className="bg-white border-2 border-cream-dark p-4 rounded-2xl shadow-sm text-sm font-bold text-ink">
          💡 {message}
        </div>
      )}

      {recs.articles && recs.articles.length > 0 && (
        <section>
          <h3 className="text-xl font-extrabold text-ink mb-5">
            📚 Suggested Articles
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recs.articles.map((article) => (
              <Link
                key={article._id}
                to={`/resources?tab=articles`}
                className="bg-white rounded-3xl overflow-hidden border-2 border-cream-dark hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 shadow-[4px_4px_0px_0px_#F9E4CC] hover:shadow-[6px_6px_0px_0px_#E8D0B0] flex flex-col h-full group"
              >
                <div className="h-32 bg-gradient-to-br from-brand-light to-mint/20 relative">
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-ink border border-white/50 shadow-sm">
                    ⏱️ 5 min read
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-extrabold text-ink mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-sm font-medium text-muted line-clamp-2 mt-auto">
                    {(article.summary || article.content || "").substring(
                      0,
                      100,
                    )}
                    ...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recs.courses && recs.courses.length > 0 && (
        <section>
          <h3 className="text-xl font-extrabold text-ink mb-5">
            🎓 Helpful Courses
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recs.courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="bg-white rounded-3xl overflow-hidden border-2 border-cream-dark hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 shadow-[4px_4px_0px_0px_#F9E4CC] hover:shadow-[6px_6px_0px_0px_#E8D0B0] flex flex-col h-full group"
              >
                <div className="p-5 flex gap-4 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-sky/10 flex items-center justify-center text-3xl shrink-0">
                    {course.title.includes("Anxiety") ? "🌊" : "🧠"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-ink mb-1 group-hover:text-brand transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-sm font-medium text-muted line-clamp-2">
                      {course.description.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recs.tools && recs.tools.length > 0 && (
        <section>
          <h3 className="text-xl font-extrabold text-ink mb-5">
            🛠️ Wellness Tools
          </h3>
          <div className="flex flex-wrap gap-3">
            {recs.tools.map((tool) => (
              <Link
                key={tool}
                to={`/resources?tab=tools`}
                className="px-4 py-2 text-sm font-bold text-brand bg-brand-light rounded-2xl hover:bg-brand hover:text-white transition-colors border-2 border-brand/30"
              >
                {tool}
              </Link>
            ))}
          </div>
        </section>
      )}

      {recs.therapistSpecializations &&
        recs.therapistSpecializations.length > 0 && (
          <section className="bg-gradient-to-r from-sky/10 to-brand-light/30 rounded-3xl p-6 md:p-8 border-2 border-sky/20">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="text-5xl shrink-0">🧑‍⚕️</div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-ink mb-2">
                  Find a Therapist
                </h3>
                <p className="text-sm font-medium text-muted mb-4">
                  Consider talking to a professional who specializes in:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {recs.therapistSpecializations.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 text-xs font-bold text-ink bg-white rounded-full border border-cream-dark shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/therapists?spec=${recs.therapistSpecializations.join(",")}`}
                  className="inline-block"
                >
                  <button className="bg-brand text-white font-bold py-2.5 px-6 rounded-2xl hover:bg-brand-dark hover:scale-105 active:scale-95 transition-all duration-150 shadow-[3px_3px_0px_0px_#5B21B6] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">
                    Find a matching therapist
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}
    </div>
  );
};

export default ForYou;
