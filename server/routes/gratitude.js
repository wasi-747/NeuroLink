import express from 'express';
import {
  addGratitudeEntry,
  getGratitudeEntries,
  deleteGratitudeEntry,
} from '../controllers/gratitude.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getGratitudeEntries).post(addGratitudeEntry);

router.route('/:id').delete(deleteGratitudeEntry);

export default router;
