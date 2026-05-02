import express from "express";
import {
  buildKnowledgeGraph,
  getLearningPath,
} from "../controllers/learning.js";

const router = express.Router();

import { protect, authorize } from "../middleware/auth.js";

router.route("/build").post(protect, authorize("admin"), buildKnowledgeGraph);
router.route("/path").get(protect, getLearningPath);

export default router;
