import { Router } from 'express';
import { getPeriod, createPayrollPeriod, getPeriods } from '../controllers/payrollPeriodController.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
const router = Router();
// Payroll periods for Admins
router.get('/', protect, restrictTo('ADMIN'), getPeriods);
router.get('/:id', protect, restrictTo('ADMIN'), getPeriod);
router.post('/', protect, restrictTo('ADMIN'), createPayrollPeriod);
export default router;
//# sourceMappingURL=payrollPeriod.routes.js.map