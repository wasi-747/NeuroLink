import express from "express";
import {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getReports,
  resolveReport,
  getPendingTherapists,
  verifyTherapist
} from "../controllers/admin.js";
import {
  getAdminCourses,
  createCourse,
  deleteCourse,
  getAdminArticles,
  createArticle,
  deleteArticle
} from "../controllers/adminContent.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply auth and admin check to all routes
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getDashboardStats);

router.route("/users")
  .get(getUsers);

router.patch("/users/:id/toggle-status", toggleUserStatus);

router.route("/reports")
  .get(getReports);

router.patch("/reports/:id", resolveReport);

router.get("/therapists/pending", getPendingTherapists);
router.patch("/therapists/:id/verify", verifyTherapist);

router.route("/courses")
  .get(getAdminCourses)
  .post(createCourse);

router.route("/courses/:id")
  .delete(deleteCourse);

router.route("/articles")
  .get(getAdminArticles)
  .post(createArticle);

router.route("/articles/:id")
  .delete(deleteArticle);

export default router;
