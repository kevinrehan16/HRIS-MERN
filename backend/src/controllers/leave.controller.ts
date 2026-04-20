import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';

export const getLeaveSummary = catchAsync(async (req, res) => {
  // 1. Fetch employees gamit ang tamang relation name (leaves)
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      leaveCredits: true, // Ito yung default(15) mo
      
      leaves: {
        where: {
          status: { in: ['APPROVED', 'PENDING'] }
        },
        select: {
          startDate: true,
          endDate: true,
          type: true,
          status: true,
        },
      },
    },
  });

  // 2. Map at Calculate
  const leaveSummary = employees.map((emp) => {
    let usedVL = 0;
    let usedSL = 0;
    let pendingCount = 0;

    emp.leaves.forEach((leave) => {
      // Gagamitin natin yung business days logic (no Sat/Sun)
      const days = calculateBusinessDays(new Date(leave.startDate), new Date(leave.endDate));

      if (leave.status === 'PENDING') {
        pendingCount++;
      }

      if (leave.status === 'APPROVED') {
        const days = calculateBusinessDays(new Date(leave.startDate), new Date(leave.endDate));
        if (leave.type === 'VACATION') usedVL += days;
        if (leave.type === 'SICK') usedSL += days;
      }
      
    });

    const totalUsed = usedVL + usedSL;
    const totalAllocated = emp.leaveCredits; // 15 base sa schema mo

    return {
      id: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      totalVL: totalAllocated, // Kung shared ang credits, 15 ang basehan ng dalawa
      totalSL: totalAllocated,
      usedVL,
      usedSL,
      usedTotal: totalUsed,
      pendingCount,
      remainingTotal: totalAllocated - totalUsed, // Ang tunay na natitirang credits
      lastLeaveDate: emp.leaves.length > 0 
        ? emp.leaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0].startDate 
        : null
    };
  });

  sendResponse(res, 200, leaveSummary, "Leave history retrieved.");
});

// Helper function (Business Days)
function calculateBusinessDays(start: Date, end: Date): number {
  let count = 0;
  let cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}