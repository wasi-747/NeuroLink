import express from 'express';
import { addMoodEntry, getMoodHistory } from '../controllers/mood.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, addMoodEntry).get(protect, getMoodHistory);

export default router;
