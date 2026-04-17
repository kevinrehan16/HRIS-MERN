import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getCorrectionRequests, createCorrectionRequest, approveCorrection, rejectCorrection } from '../controllers/attendanceCorrection.controller.js';

const router = Router();

router.use(protect);
// Employee can create correction request
router.post('/corrections', createCorrectionRequest);
router.get('/corrections', restrictTo('ADMIN'), getCorrectionRequests);
router.patch('/corrections/:id/approve', restrictTo('ADMIN'), approveCorrection);
router.patch('/corrections/:id/reject', restrictTo('ADMIN'), rejectCorrection);

export default router;