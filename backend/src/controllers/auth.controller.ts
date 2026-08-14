import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/password.util.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { recordAudit } from '../services/audit.service.js';

type AuthenticatedRequest = Request & { user: { id: number; email: string; role: string } };

const optionalString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const optionalId = (value: unknown) => value === undefined || value === null || value === '' ? undefined : Number(value);

/** Employee creation is intentionally an administrator-only route; public self-registration is not supported. */
export const register = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body;
  const uniqueValues = [body.email, body.employeeId, optionalString(body.tinNo), optionalString(body.sssNo), optionalString(body.philhealthNo), optionalString(body.pagibigNo)].filter(Boolean);
  const existingEmployee = await prisma.employee.findFirst({
    where: {
      OR: [
        { email: body.email },
        { employeeId: body.employeeId },
        ...(optionalString(body.tinNo) ? [{ tinNo: optionalString(body.tinNo)! }] : []),
        ...(optionalString(body.sssNo) ? [{ sssNo: optionalString(body.sssNo)! }] : []),
        ...(optionalString(body.philhealthNo) ? [{ philhealthNo: optionalString(body.philhealthNo)! }] : []),
        ...(optionalString(body.pagibigNo) ? [{ pagibigNo: optionalString(body.pagibigNo)! }] : []),
      ],
    },
  });
  if (existingEmployee) throw new AppError('An employee account or statutory ID is already registered.', 409);
  if (uniqueValues.length !== new Set(uniqueValues).size) throw new AppError('Statutory IDs must be unique for each employee.', 400);

  const birthDate = body.birthDate ? new Date(body.birthDate) : undefined;
  if (birthDate && Number.isNaN(birthDate.getTime())) throw new AppError('Birth date must be valid.', 400);

  const employee = await prisma.employee.create({
    data: {
      employeeId: body.employeeId.trim(),
      role: 'EMPLOYEE',
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      middleName: optionalString(body.middleName),
      extensionName: optionalString(body.extensionName),
      email: body.email.trim().toLowerCase(),
      password: await hashPassword(body.password),
      birthDate,
      gender: body.gender || undefined,
      civilStatus: body.civilStatus || undefined,
      contactNo: optionalString(body.contactNo),
      tinNo: optionalString(body.tinNo),
      sssNo: optionalString(body.sssNo),
      philhealthNo: optionalString(body.philhealthNo),
      pagibigNo: optionalString(body.pagibigNo),
      departmentId: optionalId(body.departmentId),
      positionId: optionalId(body.positionId),
      scheduleId: optionalId(body.scheduleId),
      status: body.status || 'PROBATIONARY',
      employmentType: body.employmentType || 'FULL_TIME',
      basicSalary: Number(body.basicSalary ?? 0),
      allowance: Number(body.allowance ?? 0),
      leaveCredits: Number(body.leaveCredits ?? 15),
      bankAccountNo: optionalString(body.bankAccountNo),
      bankName: optionalString(body.bankName),
      emergencyContact: optionalString(body.emergencyContact),
      emergencyName: optionalString(body.emergencyName),
      emergencyRelation: optionalString(body.emergencyRelation),
      managerId: optionalId(body.managerId),
      profileImage: optionalString(body.profileImage),
    },
  });
  await recordAudit({ actorId: req.user.id, action: 'EMPLOYEE_CREATED', entity: 'Employee', entityId: employee.id, metadata: { employeeId: employee.employeeId } });

  const { password: _password, ...safeEmployee } = employee;
  sendResponse(res, 201, safeEmployee, 'Employee created successfully.');
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const employee = await prisma.employee.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  if (employee.status === 'TERMINATED') {
    return res.status(403).json({ success: false, message: 'This account is no longer active.' });
  }

  const token = jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '1d' },
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
  sendResponse(res, 200, { id: employee.id, email: employee.email, role: employee.role, firstName: employee.firstName, lastName: employee.lastName }, 'Login successful.');
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  sendResponse(res, 200, null, 'Logged out successfully.');
});

export const getMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, employeeId: true, firstName: true, lastName: true, middleName: true, email: true, role: true,
      leaveCredits: true, status: true, department: { select: { name: true } }, position: { select: { title: true } },
      schedule: { select: { name: true, shiftStart: true, shiftEnd: true, gracePeriod: true } },
      basicSalary: true, allowance: true, address: true, birthDate: true, civilStatus: true, contactNo: true,
      dateHired: true, dateResigned: true, employmentType: true, extensionName: true, gender: true,
      pagibigNo: true, philhealthNo: true, sssNo: true, tinNo: true, createdAt: true,
      leaves: { where: { status: 'APPROVED' }, select: { totalDays: true } },
    },
  });
  if (!employee) throw new AppError('Employee not found.', 404);

  const used = employee.leaves.reduce((sum, leave) => sum + Number(leave.totalDays), 0);
  const available = Number(employee.leaveCredits);
  const { leaves, ...profile } = employee;
  sendResponse(res, 200, {
    ...profile,
    leaveSummary: { allocated: available + used, used, available },
  }, 'Profile retrieved.');
});