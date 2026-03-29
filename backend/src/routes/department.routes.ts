import { Router } from 'express';
import { createDepartment, getDepartments } from '../controllers/department.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Lahat ng routes dito ay dadaan muna sa 'protect' bouncer
router.post('/', protect, createDepartment);
router.get('/', protect, getDepartments);

export default router;