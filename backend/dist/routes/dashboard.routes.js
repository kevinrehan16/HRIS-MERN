import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getAdminDashboard, getEmployeeDashboard } from '../controllers/dashboard.controller.js';
const router = Router();
router.use(protect);
router.get('/admin', restrictTo('ADMIN'), getAdminDashboard);
router.get('/me', getEmployeeDashboard);
export default router;
//# sourceMappingURL=dashboard.routes.js.map