import type { Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';

/** Company leave-balance report. `leaveCredits` is the available balance; allocated is derived for a truthful report. */
export const getLeaveSummary = catchAsync(async (_req, res: Response) => {
  const employees = await prisma.employee.findMany({
    where: { status: { not: 'TERMINATED' } },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      leaveCredits: true,
      leaves: {
        where: { status: { in: ['APPROVED', 'PENDING'] } },
        select: { totalDays: true, type: true, status: true, startDate: true },
      },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  const summary = employees.map((employee) => {
    const approved = employee.leaves.filter((leave) => leave.status === 'APPROVED');
    const pending = employee.leaves.filter((leave) => leave.status === 'PENDING');
    const usedVL = approved.filter((leave) => leave.type === 'VACATION').reduce((sum, leave) => sum + Number(leave.totalDays), 0);
    const usedSL = approved.filter((leave) => leave.type === 'SICK').reduce((sum, leave) => sum + Number(leave.totalDays), 0);
    const usedTotal = approved.reduce((sum, leave) => sum + Number(leave.totalDays), 0);
    const pendingDays = pending.reduce((sum, leave) => sum + Number(leave.totalDays), 0);
    const available = Number(employee.leaveCredits);

    return {
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      allocated: available + usedTotal,
      usedVL,
      usedSL,
      usedTotal,
      pendingDays,
      available,
      lastLeaveDate: approved.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0]?.startDate ?? null,
    };
  });

  sendResponse(res, 200, summary, 'Leave balance report retrieved.');
});