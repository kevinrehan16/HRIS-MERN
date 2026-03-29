import { Router } from 'express';
import { generatePayroll } from '../controllers/payroll.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: POST /api/v1/payroll/generate
// Only Admins can trigger this
router.post('/generate', protect, restrictTo('ADMIN'), generatePayroll);

export default router;