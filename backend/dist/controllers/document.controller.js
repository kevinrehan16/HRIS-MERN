import prisma from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { encrypt, decrypt } from '../utils/crypto.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VALID_DOC_TYPES = ['ECV', 'ENBI', 'EPSA', 'ETIN', 'ESSS', 'EPBG', 'EPHL'];
// Helper para sa file cleanup
const deleteFile = (filePath) => {
    if (!filePath)
        return;
    // 1. Alisin ang leading slash (/) kung meron man
    // Ito ang nagiging sanhi kung bakit hindi ito mahanap sa loob ng project
    const cleanPath = filePath.startsWith('/') || filePath.startsWith('\\')
        ? filePath.slice(1)
        : filePath;
    // 2. Gamitin ang path.resolve para mas sigurado ang absolute path
    const fullPath = path.resolve(__dirname, '../../', cleanPath);
    console.log("DEBUG - Looking for file at:", fullPath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log("Successfully deleted!");
    }
    else {
        console.warn("WARNING: Still not found. Checked at:", fullPath);
    }
};
export const deleteDocument = async (req, res) => {
    try {
        const { docId } = req.params;
        // Safety check: Convert to number and check if valid
        const numericId = Number(docId);
        if (isNaN(numericId)) {
            return res.status(400).json({ success: false, message: "Invalid Document ID" });
        }
        // 1. Hanapin ang document record
        const doc = await prisma.document.findUnique({ where: { id: numericId } });
        if (!doc)
            return res.status(404).json({ success: false, message: "Doc not found" });
        // 2. Burahin ang file sa disk
        deleteFile(doc.filePath);
        // 3. Burahin ang record sa DB
        await prisma.document.delete({ where: { id: numericId } });
        return res.status(200).json({ success: true, message: "Deleted successfully" });
    }
    catch (error) {
        console.error("Delete Error:", error); // Importante ito para sa debugging
        return res.status(500).json({ success: false, message: "Error deleting file" });
    }
};
export const uploadEmployeeDocument = async (req, res) => {
    const { employeeId, docType } = req.params;
    const file = req.file;
    if (!file)
        return res.status(400).json({ success: false, message: "No file uploaded." });
    try {
        // 1. Basahin ang file na galing sa multer
        const fileBuffer = fs.readFileSync(file.path);
        // 2. I-encrypt
        const { encrypted, iv, authTag } = encrypt(fileBuffer);
        // 3. I-save ang encrypted file (overwrite ang original na file sa disk)
        fs.writeFileSync(req.file.path, encrypted);
        // 1. Validation
        if (!VALID_DOC_TYPES.includes(docType)) {
            deleteFile(file.path);
            return res.status(400).json({ success: false, message: `Invalid doc type.` });
        }
        const employee = await prisma.employee.findUnique({ where: { id: Number(employeeId) } });
        if (!employee) {
            deleteFile(file.path);
            return res.status(404).json({ success: false, message: "Employee not found." });
        }
        // 2. Cleanup old file if exists
        const existingDoc = await prisma.document.findUnique({
            where: { employeeId_documentType: { employeeId: Number(employeeId), documentType: docType } }
        });
        if (existingDoc?.filePath) {
            deleteFile(existingDoc.filePath);
        }
        // 3. Upsert DB
        const savedDocument = await prisma.document.upsert({
            where: { employeeId_documentType: { employeeId: Number(employeeId), documentType: docType } },
            update: {
                fileName: file.originalname,
                filePath: `/uploads/documents/${file.filename}`,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            },
            create: {
                employeeId: Number(employeeId),
                documentType: docType,
                fileName: file.originalname,
                filePath: `/uploads/documents/${file.filename}`,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            }
        });
        return res.status(200).json({ success: true, message: "Uploaded successfully.", data: savedDocument });
    }
    catch (error) {
        deleteFile(file.path);
        console.error("Upload Error: ", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
export const getEmployeeDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { employeeId: Number(req.params.employeeId) },
            select: {
                id: true,
                documentType: true,
                fileName: true,
                fileSize: true,
                updatedAt: true
                // iv at authTag ay hindi kasama dito
            }
        });
        return res.status(200).json({ success: true, data: documents });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching documents" });
    }
};
export const downloadDocument = async (req, res) => {
    console.log("DEBUG - req.params:", req.params);
    try {
        const { docId } = req.params;
        // 1. Hanapin ang file record sa DB
        const doc = await prisma.document.findUnique({ where: { id: Number(docId) } });
        if (!doc || !doc.iv || !doc.authTag) {
            return res.status(404).json({ success: false, message: "File not found or not encrypted." });
        }
        // 2. Basahin ang encrypted file mula sa disk
        const fullPath = path.join(__dirname, '../../', doc.filePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ success: false, message: "Physical file missing." });
        }
        const encryptedBuffer = fs.readFileSync(fullPath);
        // 3. I-decrypt
        // Convert hex string sa Buffer dahil buffer ang kailangan ng decrypt function
        const decryptedBuffer = decrypt(encryptedBuffer, Buffer.from(doc.iv, 'hex'), Buffer.from(doc.authTag, 'hex'));
        // 4. Ipadala sa user
        res.setHeader('Content-Type', 'application/octet-stream'); // O 'application/pdf'
        res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
        return res.send(decryptedBuffer);
    }
    catch (error) {
        console.error("Decryption Error:", error);
        return res.status(500).json({ success: false, message: "Failed to decrypt file." });
    }
};
//# sourceMappingURL=document.controller.js.map