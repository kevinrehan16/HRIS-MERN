import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { uploadEmployeeDocument, getEmployeeDocuments } from '../controllers/document.controller.js';
import { uploadDocMiddleware } from '../middlewares/document.middleware.js';

const router = Router();

// router.use(protect);

router.post(
  '/:employeeId/:docType', 
  uploadDocMiddleware.single('documentFile'), // 'documentFile' ang gagamiting key sa FormData ng frontend
  uploadEmployeeDocument
);

router.get('/:employeeId', getEmployeeDocuments);

export default router;