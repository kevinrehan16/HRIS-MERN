import { Router } from 'express';
import { generatePayroll, approvePayroll, markAsPaid, voidPayroll, getMyPayrolls, getPayrollSummary, getAllPayrolls } from '../controllers/payroll.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: POST /api/v1/payroll/generate
router.get('/my-payrolls', protect, getMyPayrolls);

// Only Admins can trigger this
router.get('/', protect, restrictTo('ADMIN'), getAllPayrolls);
router.post('/generate', protect, restrictTo('ADMIN'), generatePayroll);
router.patch('/approve', protect, restrictTo('ADMIN'), approvePayroll);
router.patch('/pay', protect, restrictTo('ADMIN'), markAsPaid);
router.patch('/void', protect, restrictTo('ADMIN'), voidPayroll);
// Dashboard summary for Admins
router.get('/summary', protect, restrictTo('ADMIN'), getPayrollSummary);

export default router;