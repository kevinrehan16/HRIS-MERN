import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';

export const getSchedule = catchAsync(async (req: Request, res: Response) => {
  const schedules = await prisma.schedule.findMany({
    select: {
      id: true,
      name: true,
      shiftStart: true,
      shiftEnd: true
    },
    orderBy: { id: 'asc' }
  });
  
  sendResponse(res, 200, schedules, "Fetch List of Schedule.");
});