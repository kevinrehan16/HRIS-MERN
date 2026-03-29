import type { Request, Response } from 'express';
import prisma from '../config/db.js'; // Siguraduhin na tama ang path ng db.js mo
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';

export const generatePayroll = catchAsync(async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body; 

  const startDate = new Date(periodStart);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(periodEnd);
  endDate.setUTCHours(23, 59, 59, 999);

  const employees = await prisma.employee.findMany({
    include: {
      attendances: { where: { date: { gte: startDate, lte: endDate } } },
      leaves: { where: { status: 'APPROVED', startDate: { lte: endDate }, endDate: { gte: startDate } 
    } }
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

    // --- B. LATE LOGIC (REFIXED FOR TIMEZONES) ---
    let totalLateMinutes = 0;
    emp.attendances.forEach(att => {
      if (att.timeIn) {
        const timeIn = new Date(att.timeIn);
        
        // Kuhanin ang oras at minuto base sa UTC para iwas timezone shift
        const hours = timeIn.getUTCHours();
        const minutes = timeIn.getUTCMinutes();
        
        // Convert everything to total minutes from start of day
        const totalMinutesIn = (hours * 60) + minutes;
        const shiftStartMinutes = 8 * 60; // 8:00 AM in minutes

        if (totalMinutesIn > shiftStartMinutes) {
          const lateMins = totalMinutesIn - shiftStartMinutes;
          // Safety: Max late is 8 hours (480 mins)
          totalLateMinutes += (lateMins > 480 ? 480 : lateMins);
        }
      }
    });

    const lateDeduction = (hourlyRate / 60) * totalLateMinutes;

    // --- C. OVERTIME LOGIC (DITO MO ILALAGAY) ---
    let totalOTMinutes = 0;
    emp.attendances.forEach(att => {
      if (att.timeOut) {
        const timeOut = new Date(att.timeOut);
        const hoursOut = timeOut.getUTCHours();
        const minutesOut = timeOut.getUTCMinutes();

        const totalMinutesOut = (hoursOut * 60) + minutesOut;
        const shiftEndMinutes = 17 * 60; // 5:00 PM

        // Mag-count lang kung lumampas ng 30 mins (threshold)
        if (totalMinutesOut > (shiftEndMinutes + 30)) {
          totalOTMinutes += (totalMinutesOut - shiftEndMinutes);
        }
      }
    });
    // OT Rate is 125% of hourly rate
    const overtimePay = (hourlyRate * 1.25) * (totalOTMinutes / 60);

    // --- D. STATUTORY (Fixed) ---
    const sss = (monthlyBasic > 0 ? 500 : 0) / 2;
    const philhealth = (monthlyBasic * 0.025) / 2;
    const pagibig = 100 / 2;

    // --- E. FINAL NET PAY (With Safety) ---
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
      status: 'PENDING'
    });
  }

  await prisma.payroll.deleteMany({ where: { periodStart: startDate, periodEnd: endDate, status: 
    'PENDING' } });
  const result = await prisma.payroll.createMany({ data: payrolls });

  sendResponse(res, 201, result, "Payroll generated successfully.");
});