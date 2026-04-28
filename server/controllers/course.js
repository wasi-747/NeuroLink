import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import asyncHandler from "../middleware/async.js";

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res, next) => {
  const { category, level, search, minRating } = req.query;

  let query = { isPublished: true };

  if (category && category !== "All") {
    query.category = category;
  }
  if (level && level !== "All") {
    query.level = level;
  }
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const courses = await Course.find(query).select("-modules.lessons.videoUrl -modules.lessons.content");

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc    Get single course details
// @route   GET /api/v1/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course || !course.isPublished) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  let courseObj = course.toObject();

  // Strip non-preview video URLs/content
  courseObj.modules = courseObj.modules.map(mod => {
    mod.lessons = mod.lessons.map(lesson => {
      if (!lesson.isPreview) {
        delete lesson.videoUrl;
        delete lesson.content;
      }
      return lesson;
    });
    return mod;
  });

  res.status(200).json({
    success: true,
    data: courseObj,
  });
});

// @desc    Check enrollment status
// @route   GET /api/v1/courses/:id/enrollment
// @access  Private
export const getEnrollmentStatus = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: req.params.id });
  
  if (!enrollment) {
    return res.status(200).json({ success: true, isEnrolled: false });
  }

  // If enrolled, we can send back the full course modules (with videos)
  const course = await Course.findById(req.params.id);
  res.status(200).json({ success: true, isEnrolled: true, enrollment, fullModules: course.modules });
});

// @desc    Enroll in a course (Mock Payment)
// @route   POST /api/v1/courses/:id/enroll
// @access  Private
export const enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course || !course.isPublished) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  const existingEnrollment = await Enrollment.findOne({ userId: req.user.id, courseId: course._id });
  if (existingEnrollment) {
    return res.status(400).json({ success: false, error: "You are already enrolled in this course" });
  }

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    courseId: course._id,
  });

  // Increment course enrollment count
  course.enrollmentCount += 1;
  await course.save();

  res.status(201).json({
    success: true,
    data: enrollment,
  });
});

// @desc    Get user's enrolled courses
// @route   GET /api/v1/courses/my/enrollments
// @access  Private
export const getMyEnrollments = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({ userId: req.user.id })
    .populate("courseId", "title thumbnailGradient duration lessonCount level modules")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// @desc    Mark lesson as complete
// @route   POST /api/v1/courses/:id/lessons/:lessonId/complete
// @access  Private
export const completeLesson = asyncHandler(async (req, res, next) => {
  const { id, lessonId } = req.params;

  const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId: id });
  if (!enrollment) {
    return res.status(403).json({ success: false, error: "Not enrolled in this course" });
  }

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }

  // Check if all lessons are complete
  const course = await Course.findById(id);
  const totalLessons = course.lessonCount;
  
  if (enrollment.completedLessons.length >= totalLessons && !enrollment.completedAt) {
    enrollment.completedAt = Date.now();
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});
