import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(import.meta.dirname, '../../uploads/documents');
    
    // Siguraduhing gawa ang folder para maiwasan ang crash
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { employeeId, docType } = req.params;
    // Format: emp_1_resume_171829382.pdf
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `emp_${employeeId}_${docType}_${uniqueSuffix}`);
  }
});

// Filter para siguraduhing PDF o Images lang ang tinatanggap (Enterprise Security)
const fileFilter = (req: any, file: Express.Ray, cb: any) => {
  const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, and JPG are allowed.'));
  }
};

export const uploadDocMiddleware = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Max Limit
});