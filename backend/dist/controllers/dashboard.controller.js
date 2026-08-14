import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { getPHStartOfDay } from '../utils/dateHelpers.js';
const dateKey = (date) => date.toISOString().slice(0, 10);
const labelFor = (date) => date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
export const getAdminDashboard = catchAsync(async (_req, res) => {
    const today = getPHStartOfDay();
    const weekStart = new Date(today);
    weekStart.setUTCDate(weekStart.getUTCDate() - 6);
    const monthStart = new Date(today);
    monthStart.setUTCDate(1);
    const [totalEmployees, todayAttendance, weekAttendance, pendingLeaves, pendingCorrections, pendingOvertime, departments, payroll, recentAudit] = await Promise.all([
        prisma.employee.count({ where: { status: { not: 'TERMINATED' } } }),
        prisma.attendance.findMany({ where: { date: today }, select: { status: true, employeeId: true } }),
        prisma.attendance.findMany({ where: { date: { gte: weekStart, lte: today } }, select: { date: true, status: true } }),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        prisma.attendanceCorrection.count({ where: { status: 'PENDING' } }),
        prisma.attendance.count({ where: { otStatus: 'PENDING' } }),
        prisma.department.findMany({
            select: { name: true, employees: { where: { status: { not: 'TERMINATED' } }, select: { id: true } } },
            orderBy: { name: 'asc' },
        }),
        prisma.payroll.aggregate({ where: { periodStart: { gte: monthStart } }, _sum: { netPay: true, grossPay: true }, _count: { id: true } }),
        prisma.auditLog.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
            select: { id: true, action: true, entity: true, entityId: true, createdAt: true, actor: { select: { firstName: true, lastName: true } } },
        }),
    ]);
    const attendanceByDay = new Map();
    for (let offset = 0; offset < 7; offset += 1) {
        const day = new Date(weekStart);
        day.setUTCDate(day.getUTCDate() + offset);
        attendanceByDay.set(dateKey(day), { present: 0, late: 0 });
    }
    for (const record of weekAttendance) {
        const bucket = attendanceByDay.get(dateKey(record.date));
        if (!bucket)
            continue;
        if (record.status === 'PRESENT')
            bucket.present += 1;
        if (record.status === 'LATE')
            bucket.late += 1;
    }
    const present = todayAttendance.filter((record) => record.status === 'PRESENT').length;
    const late = todayAttendance.filter((record) => record.status === 'LATE').length;
    const onLeave = todayAttendance.filter((record) => record.status === 'ON_LEAVE').length;
    const checkedInEmployees = new Set(todayAttendance.map((record) => record.employeeId)).size;
    sendResponse(res, 200, {
        generatedAt: new Date().toISOString(),
        attendance: {
            totalEmployees,
            present,
            late,
            onLeave,
            absent: Math.max(0, totalEmployees - checkedInEmployees),
            trend: Array.from(attendanceByDay.entries()).map(([day, values]) => ({ day, label: labelFor(new Date(`${day}T00:00:00.000Z`)), ...values })),
        },
        approvals: { leave: pendingLeaves, correction: pendingCorrections, overtime: pendingOvertime, total: pendingLeaves + pendingCorrections + pendingOvertime },
        payroll: { employeesProcessed: payroll._count.id, netPay: Number(payroll._sum.netPay ?? 0), grossPay: Number(payroll._sum.grossPay ?? 0) },
        departments: departments.map((department) => ({ name: department.name, employees: department.employees.length })),
        audit: recentAudit.map((entry) => ({
            ...entry,
            actorName: entry.actor ? `${entry.actor.firstName} ${entry.actor.lastName}` : 'System',
        })),
    }, 'Admin dashboard retrieved.');
});
export const getEmployeeDashboard = catchAsync(async (req, res) => {
    const today = getPHStartOfDay();
    const monthStart = new Date(today);
    monthStart.setUTCDate(1);
    const [employee, attendance, todayRecord, recentLeaves, payrolls, notifications] = await Promise.all([
        prisma.employee.findUnique({
            where: { id: req.user.id },
            select: { firstName: true, lastName: true, leaveCredits: true, schedule: { select: { name: true, shiftStart: true, shiftEnd: true } }, leaves: { where: { status: 'APPROVED' }, select: { totalDays: true } } },
        }),
        prisma.attendance.findMany({ where: { employeeId: req.user.id, date: { gte: monthStart, lte: today } }, select: { date: true, status: true, lateMinutes: true, overtimeMinutes: true, timeIn: true, timeOut: true }, orderBy: { date: 'asc' } }),
        prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: req.user.id, date: today } }, select: { status: true, timeIn: true, timeOut: true, lateMinutes: true } }),
        prisma.leaveRequest.findMany({ where: { employeeId: req.user.id }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, type: true, startDate: true, endDate: true, totalDays: true, status: true } }),
        prisma.payroll.findMany({ where: { employeeId: req.user.id, status: { in: ['APPROVED', 'PAID'] } }, take: 3, orderBy: { periodEnd: 'desc' }, select: { id: true, periodStart: true, periodEnd: true, netPay: true, status: true } }),
        prisma.notification.findMany({ where: { employeeId: req.user.id }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, message: true, isRead: true, createdAt: true } }),
    ]);
    if (!employee)
        throw new AppError('Employee not found.', 404);
    const attendanceDays = attendance.filter((entry) => ['PRESENT', 'LATE'].includes(entry.status)).length;
    const lateMinutes = attendance.reduce((sum, entry) => sum + entry.lateMinutes, 0);
    const overtimeMinutes = attendance.reduce((sum, entry) => sum + entry.overtimeMinutes, 0);
    const usedLeave = employee.leaves.reduce((sum, leave) => sum + Number(leave.totalDays), 0);
    sendResponse(res, 200, {
        employee: { firstName: employee.firstName, lastName: employee.lastName, schedule: employee.schedule },
        today: todayRecord,
        month: {
            attendanceDays,
            lateMinutes,
            overtimeMinutes,
            attendance: attendance.map((entry) => ({ ...entry, day: dateKey(entry.date), label: labelFor(entry.date) })),
        },
        leave: { allocated: Number(employee.leaveCredits) + usedLeave, used: usedLeave, available: Number(employee.leaveCredits) },
        recentLeaves,
        payrolls,
        notifications,
    }, 'Employee dashboard retrieved.');
});
//# sourceMappingURL=dashboard.controller.js.map