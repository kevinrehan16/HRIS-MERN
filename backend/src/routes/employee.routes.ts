import { Router } from 'express';
import { prisma } from '../config/db.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { sendResponse } from '../utils/sendResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { getAllEmployees, updateEmployeeProfile, deleteEmployee, enrollFace, getEmployeesWithFace } from '../controllers/employee.controller.js';

const router = Router();
router.get('/with-face', getEmployeesWithFace);

router.use(protect);
// Ang 'protect' middleware ang bouncer dito
router.get('/profile', protect, catchAsync(async (req: any, res) => {
  // PUMUNTA SA DATABASE PARA SA PINAKABAGONG DATA
  const user = await prisma.employee.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      leaveCredits: true, // Ito ang pinaka-importante!
      role: true,
      department: { select: { name: true } },
      position: { select: { title: true } }
    }
  });

  sendResponse(res, 200, user, "Profile fetched from DB.");
}));

router.get('/', restrictTo('ADMIN'), getAllEmployees);
router.patch('/:id', restrictTo('ADMIN'), updateEmployeeProfile);
router.delete('/:id', restrictTo('ADMIN'), deleteEmployee);
router.put('/enroll-face/:id', restrictTo('ADMIN'), enrollFace);

export default router;