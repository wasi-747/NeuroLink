// Append to existing server/controllers/admin.js
import Course from "../models/Course.js";
import Article from "../models/Article.js";
import asyncHandler from "../middleware/async.js";

// @desc    Get all courses (Admin)
// @route   GET /api/v1/admin/courses
// @access  Private/Admin
export const getAdminCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: courses });
});

// @desc    Create course (Simplified Admin)
// @route   POST /api/v1/admin/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res, next) => {
  // Add a default module structure if not provided
  const courseData = {
    ...req.body,
    modules: req.body.modules || [{
      title: "Module 1: Introduction",
      order: 1,
      lessons: []
    }]
  };
  const course = await Course.create(courseData);
  res.status(201).json({ success: true, data: course });
});

// @desc    Delete course
// @route   DELETE /api/v1/admin/courses/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, error: "Course not found" });
  await course.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all articles (Admin)
// @route   GET /api/v1/admin/articles
// @access  Private/Admin
export const getAdminArticles = asyncHandler(async (req, res, next) => {
  const articles = await Article.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: articles });
});

// @desc    Create article
// @route   POST /api/v1/admin/articles
// @access  Private/Admin
export const createArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.create(req.body);
  res.status(201).json({ success: true, data: article });
});

// @desc    Delete article
// @route   DELETE /api/v1/admin/articles/:id
// @access  Private/Admin
export const deleteArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ success: false, error: "Article not found" });
  await article.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
