import express from "express";
import { getArticles, getArticle } from "../controllers/resource.js";

const router = express.Router();

router.route("/articles").get(getArticles);
router.route("/articles/:id").get(getArticle);

export default router;
