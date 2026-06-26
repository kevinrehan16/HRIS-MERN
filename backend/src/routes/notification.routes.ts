// src/routes/leave.routes.ts
import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getNotifications, readAllNotifications } from '@/controllers/notification.controller.js';

const router = Router();

router.use(protect); // Lahat dapat logged in

// ROUTES PARA SA ADMIN ONLY
router.get('/', protect, getNotifications);
router.put('/read-all', protect, readAllNotifications);

export default router;