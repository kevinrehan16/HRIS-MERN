import type { Request, Response } from 'express';
import { PayrollStatus } from '@prisma/client'; // Import Enum
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from '../services/statutory.service.js';

// Helper function para sa Night Diff (10PM - 6AM)
export const getNightDiffMinutes = (timeIn: Date, timeOut: Date): number => {
  let nightDiffMins = 0;
  let current = new Date(timeIn.getTime());

  // Loop bawat minuto mula Time In hanggang Time Out
  while (current < timeOut) {
    const hour = current.getHours(); // Local hour ang kukunin dito

    // Check kung ang oras ay nasa pagitan ng 10PM (22) at 6AM (6)
    if (hour >= 22 || hour < 6) {
      nightDiffMins++;
    }
    
    // Move to the next minute
    current.setMinutes(current.getMinutes() + 1);
  }

  return nightDiffMins;
};

// export const generatePayroll = catchAsync(async (req: Request, res: Response) => {
//   const { periodStart, periodEnd, extraBonusMonths = 0 } = req.body; // Pwedeng ipasa kung may 14th-16th month

//   const startDate = new Date(periodStart);
//   startDate.setUTCHours(0, 0, 0, 0);
//   const endDate = new Date(periodEnd);
//   endDate.setUTCHours(23, 59, 59, 999);

//   // 1. SAFETY CHECK
//   const existingApproved = await prisma.payroll.findFirst({
//     where: { periodStart: startDate, periodEnd: endDate, status: PayrollStatus.APPROVED }
//   });
//   if (existingApproved) throw new AppError('Payroll period already APPROVED.', 400);

//   // 2. FETCH EMPLOYEES
//   const employees = await prisma.employee.findMany({
//     include: {
//       attendances: { where: { date: { gte: startDate, lte: endDate } } },
//       leaves: { where: { status: 'APPROVED', startDate: { lte: endDate }, endDate: { gte: startDate } } }
//     }
//   });

//   const payrolls = [];

//   for (const emp of employees) {
//     const monthlyBasic = emp.basicSalary || 0;
//     const dailyRate = monthlyBasic / 22; 
//     const hourlyRate = dailyRate / 8;
//     const semiMonthlyBasic = monthlyBasic / 2;

//     // A. STATUTORY (Semi-monthly)
//     const sss = calculateSSS(monthlyBasic) / 2;
//     const philhealth = calculatePhilHealth(monthlyBasic) / 2;
//     const pagibig = calculatePagIBIG(monthlyBasic) / 2;

//     // B. ATTENDANCE & NIGHT DIFF
//     let totalLateMins = 0, totalUndertimeMins = 0, totalRegularOTMins = 0, totalRestDayMins = 0;
//     let totalNightDiffMins = 0, daysPresent = 0;

//     emp.attendances.forEach(att => {
//     daysPresent++;
//     totalLateMins += att.lateMinutes || 0;
//     totalUndertimeMins += att.undertimeMinutes || 0;

//     if (att.timeIn && att.timeOut) {
//       // Kinukuha lang ang string (YYYY-MM-DDTHH:mm:ss) para hindi mag-auto-convert sa UTC
//       const tIn = new Date(att.timeIn.toISOString().split('.')[0]);
//       const tOut = new Date(att.timeOut.toISOString().split('.')[0]);
      
//       totalNightDiffMins += getNightDiffMinutes(tIn, tOut);
//     }

//     if (att.status === 'REST_DAY_WORK') {
//       const tIn = new Date(att.timeIn.toISOString().split('.')[0]);
//       const tOut = new Date(att.timeOut.toISOString().split('.')[0]);
//       const stayMins = Math.floor((tOut.getTime() - tIn.getTime()) / 60000);
//       totalRestDayMins += stayMins;
//     } else {
//       totalRegularOTMins += att.overtimeMinutes || 0;
//     }
//   });

//     // C. LEAVES & ABSENCES
//     let paidLeaveDays = 0;
//     emp.leaves.forEach(l => {
//       const s = l.startDate < startDate ? startDate : l.startDate;
//       const e = l.endDate > endDate ? endDate : l.endDate;
//       const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
//       paidLeaveDays += diff;
//     });

//     const totalWorkingDaysInPeriod = 11; 
//     const absentDeduction = Math.max(0, totalWorkingDaysInPeriod - (daysPresent + paidLeaveDays)) * dailyRate;

//     // D. EARNINGS
//     const lateDeduction = (hourlyRate / 60) * totalLateMins;
//     const undertimeDeduction = (hourlyRate / 60) * totalUndertimeMins;
    
//     const regularOTPay = (hourlyRate * 1.25) * (totalRegularOTMins / 60);
//     const restDayPay = (hourlyRate * 1.30) * (totalRestDayMins / 60);
//     const nightDiffPay = (hourlyRate * 0.10) * (totalNightDiffMins / 60); // 10% Premium
    
//     const totalOTPay = regularOTPay + restDayPay + nightDiffPay;

//     // E. ACCRUALS (13th Month & Others)
//     const accrued13thMonth = semiMonthlyBasic / 12;
//     const accruedOtherBonuses = (semiMonthlyBasic / 12) * extraBonusMonths;

//     // F. TAX CALCULATION
//     const totalDeductionsBeforeTax = absentDeduction + lateDeduction + undertimeDeduction + sss + philhealth + pagibig;
//     const taxableIncome = (semiMonthlyBasic + totalOTPay) - totalDeductionsBeforeTax;
//     const withholdingTax = calculateWithholdingTax(taxableIncome > 0 ? taxableIncome : 0);

//     // G. FINAL NET PAY
//     const finalTotalDeductions = totalDeductionsBeforeTax + withholdingTax;
//     let netPay = Math.max(0, (semiMonthlyBasic + totalOTPay) - finalTotalDeductions);

//     payrolls.push({
//       employeeId: emp.id,
//       periodStart: startDate,
//       periodEnd: endDate,
//       basicPay: semiMonthlyBasic,
//       overtimePay: totalOTPay,
//       nightDiffPay,
//       absentDeduction,
//       lateDeduction,
//       undertimeDeduction,
//       sss,
//       philhealth,
//       pagibig,
//       withholdingTax,
//       accrued13thMonth,
//       accruedOtherBonuses,
//       netPay,
//       status: PayrollStatus.PENDING
//     });
//   }

//   // 3. REFRESH & SAVE
//   await prisma.payroll.deleteMany({ 
//     where: { periodStart: startDate, periodEnd: endDate, status: PayrollStatus.PENDING } 
//   });

//   const result = await prisma.payroll.createMany({ data: payrolls });
//   sendResponse(res, 201, result, `Generated for ${employees.length} employees with Bonuses & Night Diff.`);
// });

export const generatePayroll = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body;

  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  const isEndOfMonth = endDate.getUTCDate() > 15;

  const employees = await prisma.employee.findMany({
    include: {
      attendances: { where: { date: { gte: startDate, lte: endDate } } },
      leaves: { where: { status: 'APPROVED', startDate: { lte: endDate }, endDate: { gte: startDate } } }
    }
  });

  const payrolls = [];

  for (const emp of employees) {
    const monthlyBasic = emp.basicSalary || 0;
    const monthlyAllowance = emp.allowance || 0;
    const dailyRate = monthlyBasic / 22;
    const hourlyRate = dailyRate / 8;
    const semiMonthlyBasic = monthlyBasic / 2;

    // A. ATTENDANCE DEDUCTIONS
    let daysPresent = 0, totalLateMins = 0, totalUndertimeMins = 0, totalOTMins = 0;
    emp.attendances.forEach(att => {
      daysPresent++;
      totalLateMins += att.lateMinutes || 0;
      totalUndertimeMins += att.undertimeMinutes || 0;
      totalOTMins += att.overtimeMinutes || 0;
    });

    let paidLeaveDays = 0;
    emp.leaves.forEach(l => {
      const s = l.startDate < startDate ? startDate : l.startDate;
      const e = l.endDate > endDate ? endDate : l.endDate;
      const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      paidLeaveDays += diff;
    });

    const absentDeduction = Math.max(0, 11 - (daysPresent + paidLeaveDays)) * dailyRate;
    const lateDeduction = (hourlyRate / 60) * totalLateMins;
    const undertimeDeduction = (hourlyRate / 60) * totalUndertimeMins;
    const totalAttendanceDeductions = absentDeduction + lateDeduction + undertimeDeduction;

    const totalOTPay = (hourlyRate * 1.25) * (totalOTMins / 60);

    // B. STATUTORY
    const sss = isEndOfMonth ? calculateSSS(monthlyBasic) : 0;
    const philhealth = isEndOfMonth ? calculatePhilHealth(monthlyBasic) : 0;
    const pagibig = isEndOfMonth ? calculatePagIBIG(monthlyBasic) : 0;
    const totalGov = sss + philhealth + pagibig;

    // C. DYNAMIC TAX LOGIC
    let withholdingTax = 0;
    if (isEndOfMonth) {
      // 1. Compute ACTUAL Monthly Taxable Income
      const monthlyGross = monthlyBasic + totalOTPay + monthlyAllowance;
      const actualTaxableIncomeMonthly = monthlyGross - totalGov - totalAttendanceDeductions;

      // 2. Compute Full Monthly Tax
      const fullMonthlyTax = calculateWithholdingTax(actualTaxableIncomeMonthly > 0 ? actualTaxableIncomeMonthly : 0);

      // 3. Divide by 2 para mag-match sa Semi-Monthly display ng table mo
      withholdingTax = fullMonthlyTax / 2;
    }

    // D. FINAL CALCULATION
    // AT kung ang absentDeduction ay 0 (Perfect Attendance).
    const currentAllowance = (isEndOfMonth && absentDeduction === 0) ? monthlyAllowance : 0;
    const grossEarnings = semiMonthlyBasic + totalOTPay + currentAllowance;
    const periodDeductions = totalAttendanceDeductions + totalGov + withholdingTax;
    const netPay = Math.max(0, grossEarnings - periodDeductions);

    payrolls.push({
      employeeId: emp.id,
      periodStart: startDate,
      periodEnd: endDate,
      basicPay: Number(semiMonthlyBasic.toFixed(2)),
      allowances: Number(currentAllowance.toFixed(2)),
      overtimePay: Number(totalOTPay.toFixed(2)),
      absentDeduction: Number(absentDeduction.toFixed(2)),
      lateDeduction: Number(lateDeduction.toFixed(2)),
      undertimeDeduction: Number(undertimeDeduction.toFixed(2)),
      sss: Number(sss.toFixed(2)),
      philhealth: Number(philhealth.toFixed(2)),
      pagibig: Number(pagibig.toFixed(2)),
      withholdingTax: Number(withholdingTax.toFixed(2)),
      netPay: Number(netPay.toFixed(2)),
      status: 'PENDING',
      remarks: `Payroll generated for ${isEndOfMonth ? '2nd Half (Full Deductions)' : '1st Half (Basic Only)'}`
    });
  }

  await prisma.payroll.deleteMany({ where: { periodStart: startDate, periodEnd: endDate, status: 'PENDING' } });
  const result = await prisma.payroll.createMany({ data: payrolls });
  
  sendResponse(res, 201, result, `Payroll generated for ${isEndOfMonth ? '2nd Half (Full Deductions)' : '1st Half (Basic Only)'}`);
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

export const getAllPayrolls = catchAsync(async (req: Request, res: Response) => {
  const payrolls = await prisma.payroll.findMany({
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          // Isama ang faceDescriptor kung kailangan ng avatar sa payroll table
        },
      },
    },
    // Laging unahin ang pinakabagong payroll records
    orderBy: {
      periodEnd: 'desc',
    },
  });

  // Pwede tayong mag-transform dito kung kailangan ng custom totals sa frontend
  const formattedPayrolls = payrolls.map((pay) => ({
    id: pay.id,
    firstName: pay.employee.firstName,
    lastName: pay.employee.lastName,
    employeeId: pay.employee.employeeId,
    period: {
      start: pay.periodStart,
      end: pay.periodEnd,
    },
    earnings: {
      basic: pay.basicPay,
      overtime: pay.overtimePay,
      nightDiff: pay.nightDiffPay,
      holiday: pay.holidayPay,
      allowances: pay.allowances,
      gross: pay.grossPay,
    },
    deductions: {
      absent: pay.absentDeduction,
      late: pay.lateDeduction,
      undertime: pay.undertimeDeduction,
      sss: pay.sss,
      philhealth: pay.philhealth,
      pagibig: pay.pagibig,
      tax: pay.withholdingTax,
      totalDeductions: 
        pay.absentDeduction + 
        pay.lateDeduction + 
        pay.undertimeDeduction + 
        pay.sss + 
        pay.philhealth + 
        pay.pagibig + 
        pay.withholdingTax,
    },
    accruals: {
      thirteenthMonth: pay.accrued13thMonth,
      bonuses: pay.accruedOtherBonuses,
    },
    netPay: pay.netPay,
    status: pay.status,
    remarks: pay.remarks,
    processedDate: pay.createdAt,
  }));
  
  sendResponse(res, 200, {num: formattedPayrolls.length, formattedPayrolls}, "Payroll periods summary retrieved successfully.");
});