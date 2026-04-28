import Therapist from "../models/Therapist.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import asyncHandler from "../middleware/async.js";

// @desc    Get all verified therapists
// @route   GET /api/v1/therapists
// @access  Public
export const getTherapists = asyncHandler(async (req, res, next) => {
  const { search, location, specializations, minRating, maxPrice, sessionType } = req.query;

  let query = { isVerified: true, isActive: true };

  // Search by name or title (We need to populate User to search by name if not denormalized, but let's assume we search bio/title for now or join)
  // To keep it simple, we search bio, title, location, specializations
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } }
    ];
  }

  if (location && location !== "All") {
    query.location = { $regex: location, $options: "i" };
  }

  if (specializations) {
    // Expecting comma separated string from frontend
    const specsArray = specializations.split(",");
    query.specializations = { $in: specsArray };
  }

  if (sessionType && sessionType !== "All") {
    query.sessionTypes = sessionType;
  }

  if (maxPrice) {
    query.sessionFee = { $lte: Number(maxPrice) };
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  const therapists = await Therapist.find(query)
    .populate("userId", "name email")
    .sort({ rating: -1, reviewCount: -1 });

  res.status(200).json({
    success: true,
    count: therapists.length,
    data: therapists,
  });
});

// @desc    Get single therapist with reviews
// @route   GET /api/v1/therapists/:id
// @access  Public
export const getTherapist = asyncHandler(async (req, res, next) => {
  const therapist = await Therapist.findById(req.params.id).populate("userId", "name email");

  if (!therapist || !therapist.isActive) {
    return res.status(404).json({ success: false, error: "Therapist not found" });
  }

  // Fetch reviews
  const reviews = await Review.find({ targetId: therapist._id, targetType: "therapist" })
    .populate("reviewerId", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: { therapist, reviews },
  });
});

import crypto from "crypto";

// @desc    Create a booking request
// @route   POST /api/v1/therapists/:id/book
// @access  Private (Student only)
export const createBooking = asyncHandler(async (req, res, next) => {
  req.body.studentId = req.user.id;
  req.body.therapistId = req.params.id;

  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) {
    return res.status(404).json({ success: false, error: "Therapist not found" });
  }

  // Generate a meeting link if session format is Online
  if (req.body.sessionFormat === "Online") {
    req.body.meetingLink = crypto.randomBytes(8).toString('hex');
  }

  const booking = await Booking.create(req.body);

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Get logged in user's bookings (Student)
// @route   GET /api/v1/therapists/bookings/my-bookings
// @access  Private (Student)
export const getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ studentId: req.user.id })
    .populate({
      path: "therapistId",
      populate: { path: "userId", select: "name email" }
    })
    .sort({ preferredDate: 1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Leave a review for a therapist
// @route   POST /api/v1/therapists/:id/reviews
// @access  Private (Student with completed booking)
export const createReview = asyncHandler(async (req, res, next) => {
  req.body.targetId = req.params.id;
  req.body.targetType = "therapist";
  req.body.reviewerId = req.user.id;

  // Verify they have a completed booking
  const booking = await Booking.findOne({
    studentId: req.user.id,
    therapistId: req.params.id,
    status: "Completed"
  });

  if (!booking) {
    return res.status(403).json({ success: false, error: "You can only review after a completed session." });
  }

  // Check if already reviewed for this booking
  const existingReview = await Review.findOne({ bookingId: booking._id });
  if (existingReview) {
    return res.status(400).json({ success: false, error: "You have already reviewed this session." });
  }

  req.body.bookingId = booking._id;

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});
