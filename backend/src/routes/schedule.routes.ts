import { Router } from 'express';
import { getSchedule, createNewSchedule } from '../controllers/schedule.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', protect, getSchedule);
router.post('/', protect, createNewSchedule);

export default router;