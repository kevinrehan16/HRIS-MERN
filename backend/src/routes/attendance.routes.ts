import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as AttendanceController from '../controllers/attendance.controller.js';

const router = Router();

// Lahat ng attendance routes ay kailangan ng login
router.use(protect);

router.post('/time-in', AttendanceController.timeIn);
router.patch('/time-out', AttendanceController.timeOut);
router.get('/summary', restrictTo('ADMIN'), AttendanceController.getAttendanceSummary);

export default router;