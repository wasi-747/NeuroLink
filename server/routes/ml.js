import express from "express";
import { getRecommendations, proxyChat } from "../controllers/ml.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/recommendations").get(protect, getRecommendations);
router.route("/chat").post(protect, proxyChat);

export default router;
