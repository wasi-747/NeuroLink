import express from "express";
import {
  getWellnessReports,
  getWellnessReport,
  generateManualReport,
} from "../controllers/wellnessReport.js";

const router = express.Router();

import { protect } from "../middleware/auth.js";

router.use(protect);

router.route("/").get(getWellnessReports);

router.route("/generate").post(generateManualReport);

router.route("/:id").get(getWellnessReport);

export default router;
