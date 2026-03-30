import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/password.util.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';

export const register = catchAsync(async (req: Request, res: Response) => {
  // DITO: Wala na tayong manual 'if (!email)' etc. kasi hinarang na ni Zod sa Route level.
  const { employeeId, firstName, lastName, email, password } = req.body;

  // 1. Business Logic Check (Ito na lang ang matitira)
  const userExists = await prisma.employee.findUnique({ where: { email } });
  if (userExists) {
    return res.status(400).json({ success: false, message: "Email already taken" });
  }

  // 2. Process
  const hashedPassword = await hashPassword(password);
  const newEmployee = await prisma.employee.create({
    data: { employeeId, firstName, lastName, email, password: hashedPassword }
  });

  // 3. Success Response
  sendResponse(res, 201, { id: newEmployee.id, email: newEmployee.email }, "Employee Registered!");
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const employee = await prisma.employee.findUnique({ where: { email } });

  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '1d' }
  );

  // --- ETO ANG BAGO: HTTP-ONLY COOKIE ---
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax', // Proteksyon sa CSRF
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Huwag nang ibalik ang token sa JSON body para sa security
  sendResponse(res, 200, { 
    id: employee.id, 
    email: employee.email, 
    role: employee.role 
  }, "Login Successful!");
});