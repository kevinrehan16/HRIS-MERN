import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';

const getDaysBetween = (start: Date, end: Date) => {
  // Gamitin ang UTC methods para hindi ma-shift ang petsa dahil sa timezone
  const s = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const e = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  
  const diffTime = e - s;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// 1. Para sa Regular Employee: Makikita lang nila ang sarili nilang requests
export const getMyLeaves = catchAsync(async (req: any, res: Response) => {
  const employeeId = req.user.id;

  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' } // Pinakabago ang mauuna
  });

  sendResponse(res, 200, leaves, "Your leave history retrieved.");
});

// 2. Para sa Admin: Makikita ang LAHAT ng requests sa kumpanya
export const getAllLeaveRequests = catchAsync(async (req: any, res: Response) => {
  // Pwede tayong mag-filter (e.g., kunin lang lahat ng PENDING)
  const { status } = req.query;

  const leaves = await prisma.leaveRequest.findMany({
    where: status ? { status: status as any } : {
      status: 'PENDING'
    }, // Optional filter
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          employeeId: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  sendResponse(res, 200, leaves, "All leave requests retrieved for Admin.");
});

export const applyLeave = catchAsync(async (req: any, res: Response) => {
  const { startDate, endDate, type, reason } = req.body;
  const employeeId = req.user.id;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = getDaysBetween(start, end);

  // 1. Kunin ang Employee at ang lahat ng PENDING leaves niya
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      leaves: {
        where: { status: 'PENDING' }
      }
    }
  });

  if (!employee) throw new AppError("Employee not found", 404);

  // 2. Compute total PENDING days
  const pendingDays = employee.leaves.reduce((sum, leave) => {
    return sum + getDaysBetween(leave.startDate, leave.endDate);
  }, 0);

  // 3. Check: (Pending + New Request) vs (Available Credits)
  const totalAttempted = pendingDays + diffDays;

  if (employee.leaveCredits < totalAttempted) {
    throw new AppError(
      `Insufficient credits. You have ${employee.leaveCredits} days, but you already have 
      ${pendingDays} days pending approval. This new request of ${diffDays} day(s) will exceed your 
      limit.`,
      400
    );
  }

  // 4. Proceed to create
  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: start,
      endDate: end,
      type,
      reason,
    }
  });

  sendResponse(res, 201, leave, "Leave request submitted.");
});

export const updateLeaveStatus = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;
  const { status, adminRemarks } = req.body;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: Number(id) },
    include: { employee: true }
  });

  if (!leave) throw new AppError("Leave request not found.", 404);

  if (leave.status === 'CANCELLED') {
    throw new AppError("Cannot modify a cancelled request.", 400);
  }

  // 1. GUMAMIT NG ISANG CALCULATION LANG PARA SA LAHAT (UTC)
  const s = Date.UTC(leave.startDate.getUTCFullYear(), leave.startDate.getUTCMonth(), leave.startDate.getUTCDate());
  const e = Date.UTC(leave.endDate.getUTCFullYear(), leave.endDate.getUTCMonth(), leave.endDate.getUTCDate());
  const exactDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;

  const result = await prisma.$transaction(async (tx) => {
    
    // A. PENDING -> APPROVED (Deduct)
    if (leave.status === 'PENDING' && status === 'APPROVED') {
      // Re-fetch employee credits inside transaction for accuracy
      const emp = await tx.employee.findUnique({ where: { id: leave.employeeId } });
      
      if (!emp || emp.leaveCredits < exactDays) {
        throw new AppError(`Cannot approve. Employee only has ${emp?.leaveCredits} credits but needs ${exactDays}.`, 400);
      }

      await tx.employee.update({
        where: { id: leave.employeeId },
        data: { leaveCredits: { decrement: exactDays } }
      });
    }

    // B. APPROVED -> REJECTED or CANCELLED (Refund)
    // Gamitin din ang exactDays dito para fair ang refund
    if (leave.status === 'APPROVED' && (status === 'REJECTED' || status === 'CANCELLED')) {
      await tx.employee.update({
        where: { id: leave.employeeId },
        data: { leaveCredits: { increment: exactDays } } 
      });
    }

    return await tx.leaveRequest.update({
      where: { id: Number(id) },
      data: { status, adminRemarks }
    });
  });

  // TODO: Dito pwedeng mag-send ng Email notification sa employee!

  sendResponse(res, 200, result, `Leave status updated to ${status}. ${exactDays} day(s) adjusted.`);
});

export const cancelMyLeave = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;
  const employeeId = req.user.id;

  // 1. Hanapin ang leave at siguraduhin na sa KANYA ito (Security Check)
  const leave = await prisma.leaveRequest.findFirst({
    where: { 
      id: Number(id),
      employeeId: employeeId // <--- Importante: Bawal i-cancel ang leave ng iba
    }
  });

  if (!leave) throw new AppError("Leave request not found or not yours.", 404);
  if (leave.status === 'CANCELLED') throw new AppError("Already cancelled.", 400);
  if (leave.status === 'REJECTED') throw new AppError("Cannot cancel a rejected request.", 400);

  // 2. TRANSACTION: Para sa Refund
  const result = await prisma.$transaction(async (tx) => {
    // REFUND LOGIC: Kung APPROVED na siya bago i-cancel, ibalik ang credits
    if (leave.status === 'APPROVED') {
      const diffTime = Math.abs(leave.endDate.getTime() - leave.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await tx.employee.update({
        where: { id: employeeId },
        data: { leaveCredits: { increment: diffDays } }
      });
    }

    // Update status to CANCELLED
    return await tx.leaveRequest.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED' }
    });
  });

  sendResponse(res, 200, result, "Leave request cancelled. Credits refunded if applicable.");
});