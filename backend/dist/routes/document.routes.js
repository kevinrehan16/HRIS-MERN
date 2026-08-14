import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { uploadEmployeeDocument, getEmployeeDocuments, downloadDocument, deleteDocument } from '../controllers/document.controller.js';
import { uploadDocMiddleware } from '../middlewares/document.middleware.js';
const router = Router();
router.use(protect);
router.post('/:employeeId/:docType', uploadDocMiddleware.single('documentFile'), // 'documentFile' ang gagamiting key sa FormData ng frontend
protect, restrictTo('ADMIN'), uploadEmployeeDocument);
router.get('/:employeeId', protect, restrictTo('ADMIN'), getEmployeeDocuments);
router.get('/:docId/download', protect, restrictTo('ADMIN'), downloadDocument);
router.delete('/:docId', protect, restrictTo('ADMIN'), deleteDocument);
export default router;
//# sourceMappingURL=document.routes.js.map