import type { Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { calculateLeaveDays, parseDateOnly } from '../utils/leave.util.js';
import { sendNotification } from '../services/notification.service.js';
import { recordAudit } from '../services/audit.service.js';

type AuthenticatedRequest = { user: { id: number; role: string }; body: any; params: any; query: any };

const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
const leaveTypes = ['SICK', 'VACATION', 'EMERGENCY', 'MATERNITY', 'PATERNITY'] as const;

const toAppError = (error: unknown) => new AppError(
  error instanceof Error ? error.message : 'Unable to calculate leave duration.',
  400,
);

const getLeaveCalendar = async (employeeId: number, startDate: Date, endDate: Date) => {
  const [employee, holidays] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: employeeId },
      include: { schedule: { select: { restDays: true } } },
    }),
    prisma.holiday.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { date: true },
    }),
  ]);

  if (!employee) throw new AppError('Employee not found.', 404);
  if (!employee.schedule) throw new AppError('A work schedule must be assigned before filing leave.', 400);
  return { employee, holidays };
};

// Employee: retrieve only their own leave history and available balance.
export const getMyLeaves = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.user.id },
    select: {
      leaveCredits: true,
      leaves: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!employee) throw new AppError('Employee not found.', 404);
  sendResponse(res, 200, employee, 'Your leave history retrieved.');
});

// Admin: searchable request queue. Omit status or use ALL to see the full history.
export const getAllLeaveRequests = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (status !== 'ALL' && !leaveStatuses.includes(status as typeof leaveStatuses[number])) {
    throw new AppError('Invalid leave status filter.', 400);
  }

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      ...(status === 'ALL' ? {} : { status: status as any }),
      ...(search ? {
        employee: {
          is: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { employeeId: { contains: search } },
            ],
          },
        },
      } : {}),
    },
    include: {
      employee: { select: { firstName: true, lastName: true, email: true, employeeId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendResponse(res, 200, leaves, 'Leave requests retrieved.');
});

export const applyLeave = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate: rawStartDate, endDate: rawEndDate, type, reason, isHalfDay = false } = req.body;
  if (!rawStartDate || !rawEndDate || !leaveTypes.includes(type)) {
    throw new AppError('Start date, end date, and a valid leave type are required.', 400);
  }
  if (typeof reason !== 'string' || reason.trim().length < 3) {
    throw new AppError('Please provide a reason with at least 3 characters.', 400);
  }

  let startDate: Date;
  let endDate: Date;
  try {
    startDate = parseDateOnly(rawStartDate, 'Start date');
    endDate = parseDateOnly(rawEndDate, 'End date');
  } catch (error) {
    throw toAppError(error);
  }

  const { employee, holidays } = await getLeaveCalendar(req.user.id, startDate, endDate);
  let totalDays: number;
  try {
    totalDays = calculateLeaveDays({
      startDate,
      endDate,
      isHalfDay: Boolean(isHalfDay),
      restDays: employee.schedule!.restDays,
      holidayDates: holidays.map((holiday) => holiday.date),
    });
  } catch (error) {
    throw toAppError(error);
  }

  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      employeeId: req.user.id,
      status: { in: ['PENDING', 'APPROVED'] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  if (overlapping) throw new AppError('This request overlaps an existing pending or approved leave request.', 409);

  const pending = await prisma.leaveRequest.aggregate({
    where: { employeeId: req.user.id, status: 'PENDING' },
    _sum: { totalDays: true },
  });
  const reservedCredits = Number(pending._sum.totalDays ?? 0);
  if (Number(employee.leaveCredits) < reservedCredits + totalDays) {
    throw new AppError('Insufficient leave credits after pending requests are reserved.', 400);
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: req.user.id,
      startDate,
      endDate,
      type,
      reason: reason.trim(),
      totalDays,
      isHalfDay: Boolean(isHalfDay),
    },
  });
  await recordAudit({
    actorId: req.user.id,
    action: 'LEAVE_REQUESTED',
    entity: 'LeaveRequest',
    entityId: leave.id,
    metadata: { type, totalDays, startDate: startDate.toISOString().slice(0, 10), endDate: endDate.toISOString().slice(0, 10) },
  });

  sendResponse(res, 201, leave, `Leave request submitted for ${totalDays} day(s).`);
});

export const updateLeaveStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const leaveId = Number(req.params.id);
  const { status, adminRemarks } = req.body;
  if (!Number.isInteger(leaveId) || !['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError('Only PENDING requests can be approved or rejected.', 400);
  }
  if (status === 'REJECTED' && (!adminRemarks || String(adminRemarks).trim().length < 3)) {
    throw new AppError('A rejection reason of at least 3 characters is required.', 400);
  }

  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
  if (!leave) throw new AppError('Leave request not found.', 404);
  if (leave.status !== 'PENDING') throw new AppError('Only pending leave requests can be decided.', 409);

  const updated = await prisma.$transaction(async (tx) => {
    if (status === 'APPROVED') {
      const employee = await tx.employee.findUnique({ where: { id: leave.employeeId }, select: { leaveCredits: true } });
      if (!employee || Number(employee.leaveCredits) < Number(leave.totalDays)) {
        throw new AppError('The employee no longer has enough leave credits to approve this request.', 409);
      }
      await tx.employee.update({
        where: { id: leave.employeeId },
        data: { leaveCredits: { decrement: Number(leave.totalDays) } },
      });
    }

    const decision = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status, adminRemarks: adminRemarks?.trim() || null },
    });
    await tx.auditLog.create({
      data: {
        actorId: req.user.id,
        action: status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        entity: 'LeaveRequest',
        entityId: String(leaveId),
        metadata: JSON.stringify({ employeeId: leave.employeeId, totalDays: Number(leave.totalDays) }),
      },
    });
    return decision;
  });

  await sendNotification(
    leave.employeeId,
    status === 'APPROVED' ? 'Leave request approved' : 'Leave request rejected',
    status === 'APPROVED'
      ? `Your ${Number(leave.totalDays)}-day leave request was approved.`
      : `Your leave request was rejected. ${String(adminRemarks).trim()}`,
  );
  sendResponse(res, 200, updated, `Leave request ${status.toLowerCase()}.`);
});

export const cancelMyLeave = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const leaveId = Number(req.params.id);
  const leave = await prisma.leaveRequest.findFirst({ where: { id: leaveId, employeeId: req.user.id } });
  if (!leave) throw new AppError('Leave request not found or not yours.', 404);
  if (!['PENDING', 'APPROVED'].includes(leave.status)) {
    throw new AppError('Only pending or approved leave requests can be cancelled.', 409);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (leave.status === 'APPROVED' && leave.startDate < today) {
    throw new AppError('Approved leave cannot be cancelled after it has started.', 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    if (leave.status === 'APPROVED') {
      await tx.employee.update({
        where: { id: req.user.id },
        data: { leaveCredits: { increment: Number(leave.totalDays) } },
      });
    }
    const cancelled = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' },
    });
    await tx.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'LEAVE_CANCELLED',
        entity: 'LeaveRequest',
        entityId: String(leaveId),
        metadata: JSON.stringify({ totalDays: Number(leave.totalDays), wasApproved: leave.status === 'APPROVED' }),
      },
    });
    return cancelled;
  });

  sendResponse(res, 200, result, 'Leave request cancelled. Credits were restored when applicable.');
});