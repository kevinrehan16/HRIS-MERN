import prisma from '../config/db.js';
import { calculateSSS, calculatePhilHealth, calculatePagIBIG, calculateWithholdingTax } from '../services/statutory.service.js';
export const generateBatchPayroll = async (payrollPeriodId) => {
    const period = await prisma.payrollPeriod.findUnique({
        where: { id: payrollPeriodId }
    });
    if (!period)
        throw new Error("Payroll Period not found");
    if (period.status === 'COMPLETED')
        throw new Error("Payroll finalized.");
    if (period.status === 'PROCESSING')
        throw new Error("Generation in progress.");
    await prisma.payrollPeriod.update({
        where: { id: payrollPeriodId },
        data: { status: 'PROCESSING', progress: 0 }
    });
    const startCalendar = new Date(period.startDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    const endCalendar = new Date(period.endDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    const startDate = new Date(`${startCalendar}T00:00:00+08:00`);
    const endDate = new Date(`${endCalendar}T23:59:59.999+08:00`);
    const isEndOfMonth = endDate.getUTCDate() > 15;
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
        const monthlyBasic = Number(emp.basicSalary) || 0;
        const monthlyAllowance = Number(emp.allowance) || 0;
        const dailyRate = monthlyBasic / 22;
        const hourlyRate = dailyRate / 8;
        const semiMonthlyBasic = monthlyBasic / 2;
        let totalLateMins = 0, totalUndertimeMins = 0, totalOTMins = 0;
        const attendanceDates = new Set();
        // 1. STRIP AND FILTER ATTENDANCE
        emp.attendances.forEach(att => {
            // FIX: Kung ang DB mo ay nagse-save ng attendance kahit absent (e.g. status === 'ABSENT'),
            // siguraduhin nating hindi natin ito bibilangin na PRESENT.
            // Pwede mong palitan o alisin ang condition sa ibaba depende sa actual fields ng database mo.
            if (att.status === 'ABSENT') {
                return;
            }
            const attDateStr = new Date(att.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
            attendanceDates.add(attDateStr);
            totalLateMins += att.lateMinutes || 0;
            totalUndertimeMins += att.undertimeMinutes || 0;
            totalOTMins += att.overtimeMinutes || 0;
        });
        // 2. MAP LEAVE DATES
        const leaveDates = new Set();
        emp.leaves.forEach(l => {
            let curLeave = new Date(l.startDate);
            const endLeave = new Date(l.endDate);
            while (curLeave <= endLeave) {
                const leaveDateStr = curLeave.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                leaveDates.add(leaveDateStr);
                curLeave.setDate(curLeave.getDate() + 1);
            }
        });
        // ============================================================
        // PURE UTC NOON LOOP (Dito tayo 100% Ligtas sa Server Timezone)
        // ============================================================
        let absentDays = 0;
        let daysPresent = 0;
        let currentLoop = new Date(`${startCalendar}T12:00:00Z`);
        const endLoop = new Date(`${endCalendar}T12:00:00Z`);
        while (currentLoop <= endLoop) {
            const dateStr = currentLoop.toISOString().split('T')[0]; // Siguradong YYYY-MM-DD
            const dayOfWeek = currentLoop.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            if (!isWeekend) {
                if (attendanceDates.has(dateStr)) {
                    daysPresent++;
                }
                else if (leaveDates.has(dateStr)) {
                    // May approved leave, excused.
                }
                else {
                    // Lunes hanggang Biyernes na walang Attendance log at walang Leave = ABSENT
                    absentDays++;
                }
            }
            currentLoop.setUTCDate(currentLoop.getUTCDate() + 1);
        }
        // TERMINAL DEBUGGER LOG: 
        // Makikita mo ito sa iyong backend console habang tumatakbo ang generator.
        console.log(`[PAYROLL DEBUG] Emp ID: ${emp.id} | Present: ${daysPresent} | Absents Calculated: ${absentDays} | Logs Found: ${attendanceDates.size}`);
        // Math Calculations
        const absentDeduction = absentDays * dailyRate;
        const lateDeduction = (hourlyRate / 60) * totalLateMins;
        const undertimeDeduction = (hourlyRate / 60) * totalUndertimeMins;
        const totalAttendanceDeductions = absentDeduction + lateDeduction + undertimeDeduction;
        const totalOTPay = (hourlyRate * 1.25) * (totalOTMins / 60);
        const sss = isEndOfMonth ? calculateSSS(monthlyBasic) : 0;
        const philhealth = isEndOfMonth ? calculatePhilHealth(monthlyBasic) : 0;
        const pagibig = isEndOfMonth ? calculatePagIBIG(monthlyBasic) : 0;
        const totalGov = sss + philhealth + pagibig;
        let withholdingTax = 0;
        if (isEndOfMonth) {
            const monthlyGross = monthlyBasic + totalOTPay + monthlyAllowance;
            const totalDeductions = totalGov + totalAttendanceDeductions;
            const actualTaxableIncomeMonthly = Math.max(0, monthlyGross - totalDeductions);
            const fullMonthlyTax = calculateWithholdingTax(actualTaxableIncomeMonthly);
            withholdingTax = fullMonthlyTax / 2;
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
            remarks: `Batch Check: ${period.periodName}`
        });
        const currentProgress = Math.round(((i + 1) / totalEmployees) * 100);
        await prisma.payrollPeriod.update({
            where: { id: payrollPeriodId },
            data: { progress: currentProgress }
        });
    }
    await prisma.$transaction([
        prisma.payroll.deleteMany({ where: { payrollPeriodId: period.id } }),
        prisma.payroll.createMany({ data: payrolls }),
        prisma.payrollPeriod.update({
            where: { id: payrollPeriodId },
            data: { status: 'COMPLETED', progress: 100 }
        })
    ]);
    return { count: payrolls.length };
};
//# sourceMappingURL=payroll.service.js.map