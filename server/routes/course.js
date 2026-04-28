import express from "express";
import {
  getCourses,
  getCourse,
  enrollCourse,
  getMyEnrollments,
  completeLesson,
  getEnrollmentStatus
} from "../controllers/course.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourse);

// Protected routes
router.use(protect);
router.get("/my/enrollments", getMyEnrollments);
router.get("/:id/enrollment", getEnrollmentStatus);
router.post("/:id/enroll", enrollCourse);
router.post("/:id/lessons/:lessonId/complete", completeLesson);

export default router;
