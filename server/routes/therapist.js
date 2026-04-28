import express from "express";
import { getTherapists, getTherapist, createBooking, getMyBookings, createReview } from "../controllers/therapist.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.route("/").get(getTherapists);
router.route("/:id").get(getTherapist);

// Protected routes (Student)
router.route("/bookings/my-bookings").get(protect, getMyBookings);
router.route("/:id/book").post(protect, createBooking);
router.route("/:id/reviews").post(protect, createReview);

export default router;
