import asyncHandler from "../middleware/async.js";
import User from "../models/User.js";
import ForumPost from "../models/ForumPost.js";
import Report from "../models/Report.js";
import Therapist from "../models/Therapist.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Article from "../models/Article.js";

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  // 1. Total Users
  const totalUsers = await User.countDocuments();
  
  // 2. Active Today (Using a simple 24h window for created/updated. In reality, would track lastLogin)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeToday = await User.countDocuments({ updatedAt: { $gte: oneDayAgo } });
  
  // 3. New This Week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
  
  // 4. Forum Posts Today
  const forumPostsToday = await ForumPost.countDocuments({ createdAt: { $gte: oneDayAgo } });
  
  // 5. Pending Therapist Approvals
  const pendingTherapists = await Therapist.countDocuments({ isVerified: false });
  
  // 6. Pending Reports
  const pendingReports = await Report.countDocuments({ status: "pending" });
  
  // 7. Total Enrollments
  const totalEnrollments = await Enrollment.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeToday,
      newThisWeek,
      forumPostsToday,
      pendingTherapists,
      pendingReports,
      totalEnrollments
    }
  });
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Toggle user active status
// @route   PATCH /api/v1/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Prevent deactivating oneself
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({ success: false, error: "You cannot deactivate your own account" });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get all pending reports
// @route   GET /api/v1/admin/reports
// @access  Private/Admin
export const getReports = asyncHandler(async (req, res, next) => {
  const reports = await Report.find({ status: "pending" })
    .populate("reportedBy", "name email anonymousAlias")
    .populate("contentId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports
  });
});

// @desc    Resolve a report
// @route   PATCH /api/v1/admin/reports/:id
// @access  Private/Admin
export const resolveReport = asyncHandler(async (req, res, next) => {
  const { action } = req.body; // none, removed, warned
  
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: "Report not found" });
  }

  report.status = "resolved";
  report.resolvedBy = req.user.id;
  report.resolvedAt = Date.now();
  report.action = action;
  
  await report.save();

  // If action is removed, actually hide the post/comment
  if (action === "removed") {
    if (report.contentType === "post") {
      const post = await ForumPost.findById(report.contentId);
      if (post) {
        post.isHidden = true;
        await post.save();
      }
    }
    // Also handle comment hiding here if needed
  }

  res.status(200).json({
    success: true,
    data: report
  });
});

// @desc    Get pending therapists
// @route   GET /api/v1/admin/therapists/pending
// @access  Private/Admin
export const getPendingTherapists = asyncHandler(async (req, res, next) => {
  const therapists = await Therapist.find({ isVerified: false })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: therapists.length,
    data: therapists
  });
});

// @desc    Verify therapist
// @route   PATCH /api/v1/admin/therapists/:id/verify
// @access  Private/Admin
export const verifyTherapist = asyncHandler(async (req, res, next) => {
  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) {
    return res.status(404).json({ success: false, error: "Therapist not found" });
  }

  therapist.isVerified = true;
  await therapist.save();

  res.status(200).json({
    success: true,
    data: therapist
  });
});
