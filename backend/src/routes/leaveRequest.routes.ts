// src/routes/leave.routes.ts
import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import{ applyLeave, getMyLeaves, getAllLeaveRequests, updateLeaveStatus, cancelMyLeave } from '../controllers/leaverequest.controller.js';

const router = Router();

router.use(protect); // Lahat dapat logged in

// ROUTES PARA SA EMPLOYEE
router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.patch('/:id/cancel', cancelMyLeave); // CANCEL leave request by employee...

// ROUTES PARA SA ADMIN ONLY
router.get('/all-requests', restrictTo('ADMIN'), getAllLeaveRequests);
router.patch('/:id/status', restrictTo('ADMIN'), updateLeaveStatus);

export default router;