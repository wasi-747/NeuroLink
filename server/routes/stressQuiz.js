import express from 'express';
import {
  submitQuiz,
  getQuizHistory,
  getQuizQuestions,
} from '../controllers/stressQuiz.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/questions').get(getQuizQuestions);

router.use(protect);

router.route('/').get(getQuizHistory).post(submitQuiz);

export default router;
