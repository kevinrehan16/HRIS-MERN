import { Router } from 'express';
import { getSchedule } from '../controllers/schedule.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', protect, getSchedule);

export default router;