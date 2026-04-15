import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { timeIn, timeOut, getAttendanceSummary, approveOvertime, adjustAttendance, getAdminAttendance, getPendingOvertime } from '../controllers/attendance.controller.js';

const router = Router();

router.post('/time-in', timeIn);
router.patch('/time-out', timeOut);

// Lahat ng attendance routes ay kailangan ng login
router.use(protect);
router.get('/summary', restrictTo('ADMIN'), getAttendanceSummary);
router.patch('/approve-ot', protect, restrictTo('ADMIN'), approveOvertime);
router.patch('/correction', protect, restrictTo('ADMIN'), adjustAttendance);
router.get('/admin-logs', protect, restrictTo('ADMIN'), getAdminAttendance);
router.get('/pending-ot', protect, restrictTo('ADMIN'), getPendingOvertime);

export default router;