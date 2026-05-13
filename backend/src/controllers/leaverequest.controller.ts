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

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      leaveCredits: true,
      leaves: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!employee) throw new AppError("Employee not found", 404);

  sendResponse(res, 200, employee, "Your leave history retrieved.");
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
  // 1. Idagdag ang isHalfDay sa destructuring
  const { startDate, endDate, type, reason, isHalfDay } = req.body;
  const employeeId = req.user.id;

  const start = new Date(startDate);
  let end = new Date(endDate);
  let diffDays = 0;

  // 2. Half Day Logic
  if (isHalfDay) {
    diffDays = 0.5;
    end = start; // Sa half day, iisang araw lang ang start at end
  } else {
    diffDays = getDaysBetween(start, end);
  }

  // 3. Kunin ang Employee at ang lahat ng PENDING leaves niya
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      leaves: {
        where: { status: 'PENDING' },
        select: { totalDays: true }
      }
    }
  });

  if (!employee) throw new AppError("Employee not found", 404);

  // 4. Compute total PENDING days
  const pendingDays = employee.leaves.reduce((sum, leave) => {
    return sum + Number(leave.totalDays);
  }, 0);

  // 5. Check: (Pending + New Request) vs (Available Credits)
  const totalAttempted = pendingDays + diffDays;

  if (employee.leaveCredits < totalAttempted) {
    throw new AppError(
      `Insufficient credits. You have ${employee.leaveCredits} days left, but you already have ${pendingDays} days pending approval. This new request of ${diffDays} day(s) will exceed your limit.`,
      400
    );
  }

  // 6. Proceed to create
  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: start,
      endDate: end,
      type,
      reason,
      totalDays: diffDays,
      isHalfDay: isHalfDay || false
    }
  });

  sendResponse(res, 201, leave, `Leave request submitted for ${diffDays} day(s).`);
});

export const updateLeaveStatus = catchAsync(async (req: any, res: Response) => {
  const { id } = req.params;
  const { status, adminRemarks } = req.body;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: Number(id) },
    include: { employee: true }
  });

  if (!leave) throw new AppError("Leave request not found.", 404);

  // Huwag payagan ang modification kung tapos na (Cancelled/Rejected/Approved na dati pa)
  // Pero depende ito sa business logic mo kung pwede i-reverse ang Approved
  if (leave.status === 'CANCELLED') {
    throw new AppError("Cannot modify a cancelled request.", 400);
  }

  // 1. Gamitin ang totalDays na na-save noong applyLeave.
  // Siguraduhin na ang leave.totalDays ay Number (parseFloat kung galing sa Decimal field)
  const daysToAdjust = Number(leave.totalDays);

  const result = await prisma.$transaction(async (tx) => {
    
    // A. PENDING -> APPROVED (Deduct Credits)
    if (leave.status === 'PENDING' && status === 'APPROVED') {
      const emp = await tx.employee.findUnique({ where: { id: leave.employeeId } });
      
      if (!emp || emp.leaveCredits < daysToAdjust) {
        throw new AppError(
          `Insufficient credits. Employee has ${emp?.leaveCredits} but needs ${daysToAdjust}.`, 
          400
        );
      }

      await tx.employee.update({
        where: { id: leave.employeeId },
        data: { leaveCredits: { decrement: daysToAdjust } }
      });
    }

    // B. APPROVED -> REJECTED or CANCELLED (Refund Credits)
    // Kung dati nang approved at biglang binawi, ibabalik ang kinuha (0.5 o 1 o higit pa)
    if (leave.status === 'APPROVED' && (status === 'REJECTED' || status === 'CANCELLED')) {
      await tx.employee.update({
        where: { id: leave.employeeId },
        data: { leaveCredits: { increment: daysToAdjust } } 
      });
    }

    // C. I-update ang status ng request
    return await tx.leaveRequest.update({
      where: { id: Number(id) },
      data: { status, adminRemarks }
    });
  });

  sendResponse(
    res, 
    200, 
    result, 
    `Leave status updated to ${status}. ${daysToAdjust} day(s) ${status === 'APPROVED' ? 'deducted' : 'adjusted'}.`
  );
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