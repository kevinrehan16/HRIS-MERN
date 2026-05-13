import prisma from '../config/db.js';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from '../services/statutory.service.js';

export const generateBatchPayroll = async (payrollPeriodId: number) => {
  // 1. Hanapin ang Period
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: payrollPeriodId }
  });

  if (!period) throw new Error("Payroll Period not found");

  if (period.status === 'COMPLETED') {
    throw new Error("Payroll for this period has already been finalized and locked.");
  }

  if (period.status === 'PROCESSING') {
    throw new Error("Payroll generation is currently in progress. Please wait.");
  }

  // Set status to PROCESSING
  await prisma.payrollPeriod.update({
    where: { id: payrollPeriodId },
    data: { status: 'PROCESSING', progress: 0 }
  });

  const startDate = new Date(period.startDate);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(period.endDate);
  endDate.setUTCHours(23, 59, 59, 999);

  const isEndOfMonth = endDate.getUTCDate() > 15;

  // 2. Kunin ang employees
  const employees = await prisma.employee.findMany({
    include: {
      attendances: { where: { date: { gte: startDate, lte: endDate } } },
      leaves: { where: { status: 'APPROVED', startDate: { lte: endDate }, endDate: { gte: startDate } } }
    }
  });

  const payrolls = [];
  const totalEmployees = employees.length;

  for (let i = 0; i < totalEmployees; i++) {
    const emp = employees[i];

    // Math conversions (Safety first)
    const monthlyBasic = Number(emp.basicSalary) || 0;
    const monthlyAllowance = Number(emp.allowance) || 0;
    const dailyRate = monthlyBasic / 22;
    const hourlyRate = dailyRate / 8;
    const semiMonthlyBasic = monthlyBasic / 2;

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

    const sss = isEndOfMonth ? calculateSSS(monthlyBasic) : 0;
    const philhealth = isEndOfMonth ? calculatePhilHealth(monthlyBasic) : 0;
    const pagibig = isEndOfMonth ? calculatePagIBIG(monthlyBasic) : 0;
    const totalGov = sss + philhealth + pagibig;

    // ============================================================
    // FIXED WITHHOLDING TAX LOGIC
    // ============================================================
    let withholdingTax = 0;
    if (isEndOfMonth) {
      const monthlyGross = monthlyBasic + totalOTPay + monthlyAllowance;
      const totalDeductions = totalGov + totalAttendanceDeductions;
      
      // Math.max(0, ...) ensures no negative income enters the tax function
      const actualTaxableIncomeMonthly = Math.max(0, monthlyGross - totalDeductions);
      
      const fullMonthlyTax = calculateWithholdingTax(actualTaxableIncomeMonthly);
      withholdingTax = fullMonthlyTax / 2;

      console.log(`[TAX OK] ${emp.firstName}: Gross ${monthlyGross.toFixed(2)}, Taxable ${actualTaxableIncomeMonthly.toFixed(2)}, Tax ${withholdingTax.toFixed(2)}`);
    }

    const currentAllowance = (isEndOfMonth && absentDeduction === 0) ? monthlyAllowance : 0;
    const grossEarnings = semiMonthlyBasic + totalOTPay + currentAllowance;
    const periodDeductions = totalAttendanceDeductions + totalGov + withholdingTax;
    const netPay = Math.max(0, grossEarnings - periodDeductions);

    payrolls.push({
      employeeId: emp.id,
      payrollPeriodId: period.id,
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
      remarks: `Batch: ${period.periodName}`
    });

    const currentProgress = Math.round(((i + 1) / totalEmployees) * 100);
    await prisma.payrollPeriod.update({
      where: { id: payrollPeriodId },
      data: { progress: currentProgress }
    });
  }

  // 3. Save to Database & Finalize Status
  await prisma.$transaction([
    // Delete ANY existing payroll for this period to prevent duplicates or sticking values
    prisma.payroll.deleteMany({ where: { payrollPeriodId: period.id } }),
    prisma.payroll.createMany({ data: payrolls }),
    prisma.payrollPeriod.update({
      where: { id: payrollPeriodId },
      data: { status: 'COMPLETED', progress: 100 }
    })
  ]);

  return { count: payrolls.length };
};