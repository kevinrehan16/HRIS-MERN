import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { getPeriodById, createPeriod, getAllPeriods } from '../services/payrollPeriod.service.js';

export const getPeriod = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getPeriodById(Number(id));

  if (!result) {
    return res.status(404).json({ success: false, message: "Period not found" });
  }

  sendResponse(res, 200, result, "Fetched payroll period status");
});

export const createPayrollPeriod = catchAsync(async (req: Request, res: Response) => {
  const { periodName, startDate, endDate, payoutDate, payrollType } = req.body;

  const result = await createPeriod({
    periodName,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    payoutDate: new Date(payoutDate),
    payrollType
  });

  sendResponse(res, 201, result, "Payroll Period created successfully");
});

export const getPeriods = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllPeriods();
  sendResponse(res, 200, result, "Fetched all payroll periods");
});