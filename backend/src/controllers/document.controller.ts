import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_DOC_TYPES = ['ECV', 'ENBI', 'EPSA', 'ETIN', 'ESSS', 'EPBG', 'EPHL'];

export const uploadEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const { employeeId, docType } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    if (!VALID_DOC_TYPES.includes(docType)) {
      fs.unlinkSync(file.path); 
      return res.status(400).json({ success: false, message: `Invalid document type: ${docType}` });
    }

    const employeeExists = await prisma.employee.findUnique({
      where: { id: Number(employeeId) }
    });

    if (!employeeExists) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    const relativeFilePath = `/uploads/documents/${file.filename}`;
    const fileSizeFriendly = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    // 4. ENTERPRISE HYGIENE: Use the correct compound key for 1-to-Many rows
    const existingDocRecord = await prisma.document.findUnique({
      where: {
        employeeId_documentType: {
          employeeId: Number(employeeId),
          documentType: docType,
        },
      },
    });

    // Delete the old physical file if replacing it
    if (existingDocRecord && existingDocRecord.filePath) {
      const fullOldPath = path.join(__dirname, '../../', existingDocRecord.filePath);
      if (fs.existsSync(fullOldPath)) {
        fs.unlinkSync(fullOldPath); 
      }
    }

    // 5. DB UPSERT: Correctly mapping to your schema's columns
    const savedDocument = await prisma.document.upsert({
      where: {
        employeeId_documentType: {
          employeeId: Number(employeeId),
          documentType: docType,
        },
      },
      update: {
        fileName: file.originalname,
        filePath: relativeFilePath,
        fileSize: fileSizeFriendly,
        // status: 'UPLOADED' // Un-comment this if your Prisma schema requires a status update
      },
      create: {
        employeeId: Number(employeeId),
        documentType: docType,
        fileName: file.originalname,
        filePath: relativeFilePath,
        fileSize: fileSizeFriendly,
        // status: 'UPLOADED' // Un-comment this if your Prisma schema requires a status
      }
    });

    return res.status(200).json({
      success: true,
      message: `${docType.toUpperCase()} uploaded successfully.`,
      data: savedDocument
    });

  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Document Upload Error: ", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getEmployeeDocuments = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const documents = await prisma.document.findMany({
      where: { employeeId: Number(employeeId) }
    });
    
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching docs" });
  }
};