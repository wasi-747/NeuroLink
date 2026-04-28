import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  reactToPost,
  unreactToPost,
  getComments,
  addComment,
  reactToComment,
  reportPost
} from "../controllers/forum.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All forum routes are protected

router.route("/posts")
  .get(getPosts)
  .post(createPost);

router.route("/posts/:id")
  .get(getPost);

router.route("/posts/:id/react")
  .post(reactToPost)
  .delete(unreactToPost);

router.route("/posts/:id/comments")
  .get(getComments)
  .post(addComment);

router.route("/comments/:id/react")
  .post(reactToComment);

router.route("/posts/:id/report")
  .post(reportPost);

export default router;
