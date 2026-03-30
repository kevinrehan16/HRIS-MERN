import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { timeIn, timeOut, getAttendanceSummary } from '../controllers/attendance.controller.js';

const router = Router();

// Lahat ng attendance routes ay kailangan ng login
router.use(protect);

router.post('/time-in', timeIn);
router.patch('/time-out', timeOut);
router.get('/summary', restrictTo('ADMIN'), getAttendanceSummary);

export default router;