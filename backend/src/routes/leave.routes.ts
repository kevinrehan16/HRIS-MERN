// src/routes/leave.routes.ts
import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getLeaveSummary } from '../controllers/leave.controller.js'

const router = Router();

router.use(protect); // Lahat dapat logged in

// ROUTES PARA SA ADMIN ONLY
router.get('/', restrictTo('ADMIN'), getLeaveSummary);

export default router;