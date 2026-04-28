import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  getHabitLogs,
} from '../controllers/habit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getHabits).post(createHabit);

router.route('/logs').get(getHabitLogs);

router.route('/:id').put(updateHabit).delete(deleteHabit);

router.route('/:id/log').post(logHabit);

export default router;
