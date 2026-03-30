import type { Request, Response } from 'express';
import { PayrollStatus } from '@prisma/client'; // Import Enum
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';

export const generatePayroll = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body;

  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  // --- 1. SAFETY CHECK: Bawal i-regenerate kung APPROVED na ---
  const existingApproved = await prisma.payroll.findFirst({
    where: {
      periodStart: startDate,
      periodEnd: endDate,
      status: PayrollStatus.APPROVED // Gamit ang Enum
    }
  });

  if (existingApproved) {
    throw new AppError('Payroll for this period is already APPROVED and cannot be modified.', 400);
  }

  const employees = await prisma.employee.findMany({
    include: {
      attendances: { where: { date: { gte: startDate, lte: endDate } } },
      leaves: { 
        where: { 
          status: 'APPROVED', 
          startDate: { lte: endDate }, 
          endDate: { gte: startDate } 
        } 
      }
    }
  });

  const payrolls = [];

  for (const emp of employees) {
    const monthlyBasic = emp.basicSalary || 0;
    const dailyRate = monthlyBasic / 22;
    const hourlyRate = dailyRate / 8;
    const semiMonthlyBasic = monthlyBasic / 2;

    // --- A. ABSENT LOGIC ---
    const daysPresent = emp.attendances.length;
    let paidLeaveDays = 0;
    emp.leaves.forEach(l => {
      const s = l.startDate < startDate ? startDate : l.startDate;
      const e = l.endDate > endDate ? endDate : l.endDate;
      const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      paidLeaveDays += diff;
    });

    const totalWorkingDaysInPeriod = 11; 
    const unpaidDays = totalWorkingDaysInPeriod - (daysPresent + paidLeaveDays);
    const finalUnpaidDays = unpaidDays > 0 ? unpaidDays : 0;
    const absentDeduction = finalUnpaidDays * dailyRate;

    // --- B. LATE LOGIC ---
    let totalLateMinutes = 0;
    emp.attendances.forEach(att => {
      if (att.timeIn) {
        const timeIn = new Date(att.timeIn);
        const hours = timeIn.getUTCHours();
        const minutes = timeIn.getUTCMinutes();
        const totalMinutesIn = (hours * 60) + minutes;
        const shiftStartMinutes = 8 * 60; 

        if (totalMinutesIn > shiftStartMinutes) {
          const lateMins = totalMinutesIn - shiftStartMinutes;
          totalLateMinutes += (lateMins > 480 ? 480 : lateMins);
        }
      }
    });
    const lateDeduction = (hourlyRate / 60) * totalLateMinutes;

    // --- C. OVERTIME LOGIC ---
    let totalOTMinutes = 0;
    emp.attendances.forEach(att => {
      if (att.timeOut) {
        const timeOut = new Date(att.timeOut);
        const hoursOut = timeOut.getUTCHours();
        const minutesOut = timeOut.getUTCMinutes();
        const totalMinutesOut = (hoursOut * 60) + minutesOut;
        const shiftEndMinutes = 17 * 60; 

        if (totalMinutesOut > (shiftEndMinutes + 30)) {
          totalOTMinutes += (totalMinutesOut - shiftEndMinutes);
        }
      }
    });
    const overtimePay = (hourlyRate * 1.25) * (totalOTMinutes / 60);

    // --- D. STATUTORY ---
    const sss = (monthlyBasic > 0 ? 500 : 0) / 2;
    const philhealth = (monthlyBasic * 0.025) / 2;
    const pagibig = 100 / 2;

    // --- E. FINAL NET PAY ---
    const totalDeductions = absentDeduction + lateDeduction + sss + philhealth + pagibig;
    let netPay = (semiMonthlyBasic + overtimePay) - totalDeductions;
    if (netPay < 0) netPay = 0;

    payrolls.push({
      employeeId: emp.id,
      periodStart: startDate,
      periodEnd: endDate,
      basicPay: semiMonthlyBasic,
      overtimePay: overtimePay,
      absentDeduction,
      lateDeduction,
      sss,
      philhealth,
      pagibig,
      netPay,
      status: PayrollStatus.PENDING // Gamit ang Enum
    });
  }

  // --- 2. IWAS DUPLICATE ---
  // Buburahin lang ang PENDING records para mapalitan ng bago.
  await prisma.payroll.deleteMany({ 
    where: { 
      periodStart: startDate, 
      periodEnd: endDate, 
      status: PayrollStatus.PENDING 
    } 
  });

  const result = await prisma.payroll.createMany({ data: payrolls });

  sendResponse(res, 201, result, "Payroll generated successfully.");
});

// --- 3. NEW: APPROVE PAYROLL FUNCTION ---
export const approvePayroll = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body;

  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  // 1. I-update ang status
  const updated = await prisma.payroll.updateMany({
    where: {
      periodStart: startDate,
      periodEnd: endDate,
      status: PayrollStatus.PENDING
    },
    data: {
      status: PayrollStatus.APPROVED
    }
  });

  if (updated.count === 0) {
    throw new AppError('No pending payroll records found to approve for this period.', 404);
  }

  // 2. DITO NA NATIN KUKUNIN YUNG ACTUAL DATA PARA LUMABAS SA INSOMNIA
  const approvedRecords = await prisma.payroll.findMany({
    where: {
      periodStart: startDate,
      periodEnd: endDate,
      status: PayrollStatus.APPROVED // Siguradong APPROVED ang kukunin natin
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // 3. I-return ang array sa response
  sendResponse(res, 200, approvedRecords, `Successfully approved ${updated.count} payroll records.`);
});

export const markAsPaid = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body;

  // 1. Gawin nating 00:00:00.000 ang Start Date
  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);

  // 2. Gawin nating 23:59:59.999 ang End Date para mag-match sa DB record mo
  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  const updated = await prisma.payroll.updateMany({
    where: {
      periodStart: startDate,
      periodEnd: endDate,
      status: PayrollStatus.APPROVED
    },
    data: {
      status: PayrollStatus.PAID
    }
  });

  if (updated.count === 0) {
    throw new AppError('No APPROVED payroll records found. Please check if they are already PAID or dates are correct.', 404);
  }

  // --- OPTIONAL: GET UPDATED RECORDS FOR INSOMNIA RESPONSE ---
  const results = await prisma.payroll.findMany({
    where: { periodStart: startDate, periodEnd: endDate }
  });

  sendResponse(res, 200, results, `Successfully marked ${updated.count} payrolls as PAID.`);
});

export const voidPayroll = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body;

  // 1. Normalize dates gaya ng ginawa sa Pay at Generate
  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  // 2. I-update ang lahat ng APPROVED o PAID records para maging VOID
  const updated = await prisma.payroll.updateMany({
    where: {
      periodStart: startDate,
      periodEnd: endDate,
      status: { in: [PayrollStatus.APPROVED, PayrollStatus.PAID] } 
    },
    data: {
      status: PayrollStatus.VOID
    }
  });

  if (updated.count === 0) {
    throw new AppError('No APPROVED or PAID payroll records found to VOID for this period.', 404);
  }

  // 3. Optional: Kunin ang listahan para makita sa Insomnia ang pagbabago
  const voidedRecords = await prisma.payroll.findMany({
    where: { periodStart: startDate, periodEnd: endDate }
  });

  sendResponse(res, 200, voidedRecords, `Successfully VOIDED ${updated.count} payroll records.`);
});

export const getMyPayrolls = catchAsync(async (req: AuthRequest, res: Response) => {
  // 1. Kuhanin ang ID mula sa token (salamat sa protect middleware)
  const loggedInEmployeeId = req.user?.id;

  // 2. Query sa DB
  const payrolls = await prisma.payroll.findMany({
    where: {
      employeeId: loggedInEmployeeId,
      status: { 
        in: [PayrollStatus.APPROVED, PayrollStatus.PAID] 
      }
    },
    orderBy: {
      periodStart: 'desc'
    },
    // Isama ang details ng position para maganda sa Payslip UI
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          position: { select: { title: true } }
        }
      }
    }
  });

  sendResponse(res, 200, payrolls, "Your payroll history retrieved successfully.");
});

export const getPayrollSummary = catchAsync(async (req: Request, res: Response) => {
  // Grupu-grupuhin natin ang payroll records per period
  const summary = await prisma.payroll.groupBy({
    by: ['periodStart', 'periodEnd', 'status'],
    _count: {
      employeeId: true // Ilang employees ang kasama sa cut-off
    },
    _sum: {
      netPay: true,
      overtimePay: true,
      absentDeduction: true
    },
    orderBy: {
      periodStart: 'desc'
    }
  });

  sendResponse(res, 200, summary, "Payroll periods summary retrieved.");
});