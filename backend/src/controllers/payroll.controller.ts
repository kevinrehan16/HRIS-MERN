import type { Request, Response } from 'express';
import { PayrollStatus } from '@prisma/client'; // Import Enum
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from '../services/statutory.service.js';

// Helper function para sa Night Diff (10PM - 6AM)
const getNightDiffMinutes = (timeIn: Date, timeOut: Date): number => {
  let nightMins = 0;
  let current = new Date(timeIn);
  const end = new Date(timeOut);

  while (current < end) {
    const hour = current.getHours();
    if (hour >= 22 || hour < 6) {
      nightMins++;
    }
    current.setMinutes(current.getMinutes() + 1);
  }
  return nightMins;
};

export const generatePayroll = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd, extraBonusMonths = 0 } = req.body; // Pwedeng ipasa kung may 14th-16th month

  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  // 1. SAFETY CHECK
  const existingApproved = await prisma.payroll.findFirst({
    where: { periodStart: startDate, periodEnd: endDate, status: PayrollStatus.APPROVED }
  });
  if (existingApproved) throw new AppError('Payroll period already APPROVED.', 400);

  // 2. FETCH EMPLOYEES
  const employees = await prisma.employee.findMany({
    include: {
      attendances: { where: { date: { gte: startDate, lte: endDate } } },
      leaves: { where: { status: 'APPROVED', startDate: { lte: endDate }, endDate: { gte: startDate } } }
    }
  });

  const payrolls = [];

  for (const emp of employees) {
    const monthlyBasic = emp.basicSalary || 0;
    const dailyRate = monthlyBasic / 22; 
    const hourlyRate = dailyRate / 8;
    const semiMonthlyBasic = monthlyBasic / 2;

    // A. STATUTORY (Semi-monthly)
    const sss = calculateSSS(monthlyBasic) / 2;
    const philhealth = calculatePhilHealth(monthlyBasic) / 2;
    const pagibig = calculatePagIBIG(monthlyBasic) / 2;

    // B. ATTENDANCE & NIGHT DIFF
    let totalLateMins = 0, totalUndertimeMins = 0, totalRegularOTMins = 0, totalRestDayMins = 0;
    let totalNightDiffMins = 0, daysPresent = 0;

    emp.attendances.forEach(att => {
      daysPresent++;
      totalLateMins += att.lateMinutes || 0;
      totalUndertimeMins += att.undertimeMinutes || 0;

      // Night Diff Calculation (10PM - 6AM)
      if (att.timeIn && att.timeOut) {
        totalNightDiffMins += getNightDiffMinutes(new Date(att.timeIn), new Date(att.timeOut));
      }

      if (att.status === 'REST_DAY_WORK') {
        const stayMins = att.timeIn && att.timeOut 
          ? Math.floor((new Date(att.timeOut).getTime() - new Date(att.timeIn).getTime()) / 60000) 
          : 0;
        totalRestDayMins += stayMins;
      } else {
        totalRegularOTMins += att.overtimeMinutes || 0;
      }
    });

    // C. LEAVES & ABSENCES
    let paidLeaveDays = 0;
    emp.leaves.forEach(l => {
      const s = l.startDate < startDate ? startDate : l.startDate;
      const e = l.endDate > endDate ? endDate : l.endDate;
      const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      paidLeaveDays += diff;
    });

    const totalWorkingDaysInPeriod = 11; 
    const absentDeduction = Math.max(0, totalWorkingDaysInPeriod - (daysPresent + paidLeaveDays)) * dailyRate;

    // D. EARNINGS
    const lateDeduction = (hourlyRate / 60) * totalLateMins;
    const undertimeDeduction = (hourlyRate / 60) * totalUndertimeMins;
    
    const regularOTPay = (hourlyRate * 1.25) * (totalRegularOTMins / 60);
    const restDayPay = (hourlyRate * 1.30) * (totalRestDayMins / 60);
    const nightDiffPay = (hourlyRate * 0.10) * (totalNightDiffMins / 60); // 10% Premium
    
    const totalOTPay = regularOTPay + restDayPay + nightDiffPay;

    // E. ACCRUALS (13th Month & Others)
    const accrued13thMonth = semiMonthlyBasic / 12;
    const accruedOtherBonuses = (semiMonthlyBasic / 12) * extraBonusMonths;

    // F. TAX CALCULATION
    const totalDeductionsBeforeTax = absentDeduction + lateDeduction + undertimeDeduction + sss + philhealth + pagibig;
    const taxableIncome = (semiMonthlyBasic + totalOTPay) - totalDeductionsBeforeTax;
    const withholdingTax = calculateWithholdingTax(taxableIncome > 0 ? taxableIncome : 0);

    // G. FINAL NET PAY
    const finalTotalDeductions = totalDeductionsBeforeTax + withholdingTax;
    let netPay = Math.max(0, (semiMonthlyBasic + totalOTPay) - finalTotalDeductions);

    payrolls.push({
      employeeId: emp.id,
      periodStart: startDate,
      periodEnd: endDate,
      basicPay: semiMonthlyBasic,
      overtimePay: totalOTPay,
      nightDiffPay,
      absentDeduction,
      lateDeduction,
      undertimeDeduction,
      sss,
      philhealth,
      pagibig,
      withholdingTax,
      accrued13thMonth,
      accruedOtherBonuses,
      netPay,
      status: PayrollStatus.PENDING
    });
  }

  // 3. REFRESH & SAVE
  await prisma.payroll.deleteMany({ 
    where: { periodStart: startDate, periodEnd: endDate, status: PayrollStatus.PENDING } 
  });

  const result = await prisma.payroll.createMany({ data: payrolls });
  sendResponse(res, 201, result, `Generated for ${employees.length} employees with Bonuses & Night Diff.`);
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
  // Grupu-grupuhin ang payroll records per period at status
  const summary = await prisma.payroll.groupBy({
    by: ['periodStart', 'periodEnd', 'status'],
    _count: {
      employeeId: true // Total employees processed for this batch
    },
    _sum: {
      // --- Cash Outflow ---
      basicPay: true,      // Total Base Pay
      overtimePay: true,   // Total OT paid
      netPay: true,        // Total cash needed for bank transfer

      // --- Deductions / Remittances ---
      withholdingTax: true, // For BIR remittance
      sss: true,            // For SSS remittance
      philhealth: true,     // For PhilHealth remittance
      pagibig: true,        // For Pag-IBIG remittance
      
      // --- Penalties ---
      absentDeduction: true,
      lateDeduction: true,
      undertimeDeduction: true
    },
    orderBy: {
      periodStart: 'desc'
    }
  });

  // Optional: Add a calculated field for "Total Contributions" per group if needed 
  // pero usually, itong raw sums ay sapat na para sa Finance Dashboard.

  sendResponse(res, 200, summary, "Payroll periods summary retrieved successfully.");
});