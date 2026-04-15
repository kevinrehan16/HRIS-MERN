import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from '../utils/sendResponse.js';

export const addHoliday = catchAsync(async (req: Request, res: Response) => {
  const { date, name, type } = req.body; 
  // Expect date format: "YYYY-MM-DD"

  const newHoliday = await prisma.holiday.create({
    data: {
      date: new Date(`${date}T00:00:00.000Z`),
      name,
      type
    }
  });

  sendResponse(res, 201, newHoliday, 'Holiday added successfully');
});