import { Router } from 'express';
import { getPositions, createPosition } from '../controllers/position.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', protect, getPositions);
router.post('/', protect, createPosition);

export default router;