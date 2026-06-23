import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/password.util.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';

export const register = catchAsync(async (req: Request, res: Response) => {
  // 1. Destructuring: Kunin lahat ng fields na na-validate na ng Zod
  const { 
    employeeId, role, firstName, lastName, middleName, extensionName,
    email, password, birthDate, gender, civilStatus, contactNo,
    tinNo, sssNo, philhealthNo, pagibigNo,
    departmentId, positionId, scheduleId,
    status, employmentType, basicSalary, allowance, leaveCredits,
    bankAccountNo, bankName,
    emergencyContact, emergencyName, emergencyRelation,
    managerId, profileImage
  } = req.body;

  // 2. Uniqueness Checks (Dahil @unique ang mga ito sa DB)
  const existingEmployee = await prisma.employee.findFirst({
    where: {
      OR: [
        { email },
        { employeeId },
        { tinNo: tinNo || undefined }, // Check lang kung may laman
        { sssNo: sssNo || undefined }
      ]
    }
  });

  if (existingEmployee) {
    let field = "Employee";
    if (existingEmployee.email === email) field = "Email";
    if (existingEmployee.employeeId === employeeId) field = "Employee ID";
    
    sendResponse(res, 400, "", `${field} is already registered.`);
  }

  // 3. Password Hashing
  const hashedPassword = await hashPassword(password);

  // 4. Create Record
  const newEmployee = await prisma.employee.create({
    data: {
      employeeId,
      role: role || 'EMPLOYEE',
      firstName,
      lastName,
      middleName,
      extensionName,
      email,
      password: hashedPassword,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      civilStatus,
      contactNo,
      tinNo,
      sssNo,
      philhealthNo,
      pagibigNo,
      departmentId,
      positionId,
      scheduleId,
      status: status || 'ACTIVE',
      employmentType,
      basicSalary,
      allowance,
      leaveCredits,
      bankAccountNo,
      bankName,
      emergencyContact,
      emergencyName,
      emergencyRelation,
      managerId,
      profileImage
    }
  });

  // 5. Response (Clean: No password included)
  const { password: _, ...safeData } = newEmployee;
  
  sendResponse(res, 201, safeData, "Employee created successfully!");
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const employee = await prisma.employee.findUnique({ where: { email } });

  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: employee.id, 
      email: employee.email, 
      role: employee.role, 
      firstName: employee.firstName,
      lastName: employee.lastName
    },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '1d' }
  );

  // --- ETO ANG BAGO: HTTP-ONLY COOKIE ---
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax', // Proteksyon sa CSRF
    maxAge: 24 * 60 * 60 * 1000, // 1 day tatagal ang token sa cookie browser. kaya auto login w/in that 1 day
  });

  // Huwag nang ibalik ang token sa JSON body para sa security
  sendResponse(res, 200, { 
    id: employee.id, 
    email: employee.email, 
    role: employee.role 
  }, "Login Successful!");
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  // Buburahin natin ang cookie sa pamamagitan ng pag-set ng expiry date sa nakaraan (Past Date)
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // January 1, 1970 (Burado agad!)
    sameSite: 'lax',      // Siguraduhin na match ito sa login settings mo
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.employee.findUnique({
    where: { id: req.user.id },
    select: {
      // ... lahat ng basic fields mo
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      middleName: true,
      email: true,
      leaveCredits: true,
      status: true,

      // PALITAN ITO: Mula leaveRequests -> leaves
      leaves: {
        where: { status: 'APPROVED' },
        select: {
          startDate: true,
          endDate: true,
        },
      },

      department: { select: { name: true } },
      position: { select: { title: true } },
      schedule: {
        select: {
          name: true,
          shiftStart: true,
          shiftEnd: true,
          gracePeriod: true
        }
      },
      // ... isama mo pa yung ibang fields (basicSalary, etc.)
      basicSalary: true,
      allowance: true,
      address: true,
      birthDate: true,
      civilStatus: true,
      contactNo: true,
      dateHired: true,
      dateResigned: true,
      employmentType: true,
      extensionName: true,
      gender: true,
      pagibigNo: true,
      philhealthNo: true,
      sssNo: true,
      tinNo: true,
      createdAt: true
    }
  });

  if (!user) {
    return sendResponse(res, 404, null, "Employee not found.");
  }

  // --- CALCULATION LOGIC (Gamit na ang 'leaves') ---
  const usedCredits = (user.leaves || []).reduce((total: number, request: any) => {
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return total + diffDays;
  }, 0);

  const total = user.leaveCredits || 0;
  const left = total - usedCredits;

  const profileData = {
    ...user,
    leaveSummary: {
      total: total,
      used: usedCredits,
      left: left
    }
  };

  // Linisin ang response
  delete (profileData as any).leaves;

  sendResponse(res, 200, profileData, "Fetch my profile informations.");
});