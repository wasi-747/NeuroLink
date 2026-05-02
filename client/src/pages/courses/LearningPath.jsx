import React, { useState, useEffect } from "react";
import { getLearningPath } from "../../api/learning";
import { Link } from "react-router-dom";

const LearningPath = () => {
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await getLearningPath();
        setPath(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load learning path.");
        setLoading(false);
      }
    };

    fetchPath();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-8">
        Loading your personalized learning path...
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Your Personalized Learning Path
      </h1>
      {path.length > 0 ? (
        <div className="space-y-4">
          {path.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg shadow-sm bg-white flex items-center"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {index + 1}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  {item.title}
                </h2>
                <p className="text-gray-600">{item.description}</p>
                <span className="text-sm text-gray-500 capitalize mt-1 inline-block">
                  Type: {item.type}
                </span>
                <div className="mt-2">
                  <Link
                    to={`/${item.type}s/${item.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View Content
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No learning path available at the moment.
        </p>
      )}
    </div>
  );
};

export default LearningPath;
