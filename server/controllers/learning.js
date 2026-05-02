import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";
import Course from "../models/Course.js";
import Article from "../models/Article.js";
import User from "../models/User.js";
import axios from "axios";

// @desc    Build knowledge graph
// @route   POST /api/v1/learning/build
// @access  Private/Admin
export const buildKnowledgeGraph = asyncHandler(async (req, res, next) => {
  const courses = await Course.find().select("id title description");
  const articles = await Article.find().select("id title description");

  const content = {
    courses: courses.map((c) => ({
      ...c._doc,
      id: c._id.toString(),
      type: "course",
    })),
    articles: articles.map((a) => ({
      ...a._doc,
      id: a._id.toString(),
      type: "article",
    })),
    resources: [],
  };

  try {
    await axios.post(
      `${process.env.ML_SERVICE_URL}/api/ml/learning/build-graph`,
      content,
    );
    res
      .status(200)
      .json({ success: true, data: "Knowledge graph build process started." });
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse("Could not build knowledge graph", 500));
  }
});

// @desc    Get personalized learning path
// @route   GET /api/v1/learning/path
// @access  Private
export const getLearningPath = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const requestData = {
    interests: user.interests || [],
    activity: [], // Can be populated with recent user activity
  };

  try {
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/api/ml/learning/recommend-path`,
      requestData,
    );
    res.status(200).json({ success: true, data: response.data.path });
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse("Could not retrieve learning path", 500));
  }
});
