import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getNotifications, readAllNotifications, readNotification } from '../controllers/notification.controller.js';
const router = Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', readNotification);
router.put('/read-all', readAllNotifications);
export default router;
//# sourceMappingURL=notification.routes.js.map