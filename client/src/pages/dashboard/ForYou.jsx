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
      <div className="p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Recommended For You
        </h2>
        <p className="text-sm text-gray-500">Based on your last 14 days</p>
        <div className="mt-4 text-center">Loading recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          Recommended For You
        </h2>
        <p className="text-sm text-gray-500">Based on your last 14 days</p>
        <div className="mt-4 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const { topIssue, recommendations: recs, message } = recommendations;

  return (
    <div className="p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended For You
          </h2>
          <p className="text-sm text-gray-500">Based on your last 14 days</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
        >
          <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>

      <div className="p-4 mt-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-800">{message}</p>
      </div>

      {recs.articles && recs.articles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Suggested Articles
          </h3>
          <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2 lg:grid-cols-3">
            {recs.articles.map((article) => (
              <div
                key={article._id}
                className="p-4 transition-shadow border rounded-lg hover:shadow-md"
              >
                <Link
                  to={`/resources/articles/${article._id}`}
                  className="font-semibold text-purple-700 hover:underline"
                >
                  {article.title}
                </Link>
                <p className="mt-1 text-sm text-gray-600">
                  {(article.summary || article.content || "").substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recs.courses && recs.courses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Helpful Courses
          </h3>
          <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
            {recs.courses.map((course) => (
              <div
                key={course._id}
                className="p-4 transition-shadow border rounded-lg hover:shadow-md"
              >
                <Link
                  to={`/courses/${course._id}`}
                  className="font-semibold text-purple-700 hover:underline"
                >
                  {course.title}
                </Link>
                <p className="mt-1 text-sm text-gray-600">
                  {course.description.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recs.tools && recs.tools.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Wellness Tools
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {recs.tools.map((tool) => (
              <Link
                key={tool}
                to={`/resources/tools/${tool.toLowerCase().replace(/ /g, "-")}`}
                className="px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full hover:bg-purple-200"
              >
                {tool}
              </Link>
            ))}
          </div>
        </div>
      )}

      {recs.therapistSpecializations &&
        recs.therapistSpecializations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Find a Therapist
            </h3>
            <p className="text-sm text-gray-600">
              Consider talking to a professional who specializes in:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {recs.therapistSpecializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 text-sm text-indigo-800 bg-indigo-100 rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
            <Link
              to={`/therapists?spec=${recs.therapistSpecializations.join(",")}`}
            >
              <button className="w-full px-4 py-2 mt-4 font-semibold text-white bg-purple-600 rounded-lg md:w-auto hover:bg-purple-700">
                Find a matching therapist
              </button>
            </Link>
          </div>
        )}
    </div>
  );
};

export default ForYou;
