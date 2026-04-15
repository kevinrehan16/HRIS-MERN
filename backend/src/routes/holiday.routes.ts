import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { addHoliday } from '../controllers/holiday.controller.js';

const router = Router();
// Lahat ng attendance routes ay kailangan ng login
router.use(protect);
router.post('/', restrictTo('ADMIN'), addHoliday);

export default router;