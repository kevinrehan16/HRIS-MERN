import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';

// src/controllers/attendance.controller.ts

// export const timeIn = catchAsync(async (req: any, res: Response) => {
//   const employeeId = req.user.id;
//   const now = new Date();
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   // 1. Kunin ang Employee pati ang Schedule niya
//   const employee = await prisma.employee.findUnique({
//     where: { id: employeeId },
//     include: { schedule: true }
//   });

//   if (!employee?.schedule) {
//     throw new AppError("No schedule assigned. Please contact HR.", 400);
//   }

//   // 2. I-convert ang "09:00" string into a Date object today
//   const [hours, minutes] = employee.schedule.shiftStart.split(':').map(Number);
//   const shiftStartTime = new Date();
//   shiftStartTime.setHours(hours, minutes, 0, 0);

//   // 3. Magdagdag ng Grace Period (e.g., 15 mins)
//   const lateThreshold = new Date(shiftStartTime.getTime() + employee.schedule.gracePeriod * 60000);

//   // 4. Determine Status
//   const status = now > lateThreshold ? 'LATE' : 'PRESENT';

//   // 5. Save to Database
//   const attendance = await prisma.attendance.create({
//     data: {
//       employeeId,
//       date: today,
//       timeIn: now,
//       status: status,
//       remarks: status === 'LATE' ? `Late (Shift start: ${employee.schedule.shiftStart})` : 'On time'
//     }
//   });

//   sendResponse(res, 201, attendance, `Clocked in successfully as ${status}`);
// });

// PANSAMANTALA: Pwede mag TIME IN
export const timeIn = catchAsync(async (req: any, res: Response) => {
  const employeeId = req.user.id;
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { schedule: true }
  });

  const shiftStartString = employee?.schedule?.shiftStart ?? "08:00";
  const gracePeriod = employee?.schedule?.gracePeriod ?? 0;

  // FIXED: Para iwas TypeScript "undefined" error
  const timeParts = shiftStartString.split(':');
  const shiftStartTime = new Date();
  shiftStartTime.setHours(Number(timeParts[0]) || 0, Number(timeParts[1]) || 0, 0, 0);

  const lateThreshold = new Date(shiftStartTime.getTime() + gracePeriod * 60000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  let remarks = 'On time';
  if (status === 'LATE') {
    remarks = employee?.schedule
      ? `Late (Shift start: ${shiftStartString})`
      : 'Late (No schedule assigned)';
  }

  const existingAttendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } }
  });

  if (existingAttendance) {
    return res.status(400).json({ success: false, message: "You have already clocked in for today." });
  }

  const attendance = await prisma.attendance.create({
    data: { employeeId, date: today, timeIn: now, status, remarks }
  });

  sendResponse(res, 201, attendance, `Clocked in successfully as ${status}`);
});

export const timeOut = catchAsync(async (req: any, res: Response) => {
  const employeeId = req.user.id;
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Hanapin ang Attendance record para sa araw na ito
  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } }
  });

  // 2. Validations
  if (!attendance) throw new AppError("No Time-In found for today!", 404);
  if (attendance.timeOut) throw new AppError("Already clocked out!", 400);

  // 3. Kunin ang Schedule ng Employee para sa dynamic Shift End
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { schedule: true }
  });

  // 4. Kunin ang shiftEnd (Default sa 18:00 kung walang schedule na naka-assign)
  const shiftEndString = employee?.schedule?.shiftEnd ?? "18:00";
  const timeParts = shiftEndString.split(':');
  // const [endHours, endMinutes] = shiftEndString.split(':').map(Number);
  
  const shiftEndTime = new Date();
    shiftEndTime.setHours(
    Number(timeParts[0]) || 0, // Fallback sa 0 kung sakaling mag-fail
    Number(timeParts[1]) || 0, 
    0, 
    0
  );

  // 5. Logic para sa Undertime
  const isUndertime = now < shiftEndTime;

  // 6. Update the record
  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      timeOut: now,
      // Pinagsama natin ang dating remarks + bagong status
      remarks: isUndertime 
        ? `${attendance.remarks || ''} | Undertime`.trim().replace(/^ \| /, '') 
        : attendance.remarks
    },
  });

  sendResponse(res, 200, updated, `Clocked out successfully! ${isUndertime ? '(Undertime)' : ''}`);
});

export const getAttendanceSummary = catchAsync(async (req: any, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Bilangin ang bawat status gamit ang groupBy
  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      date: today,
    },
    _count: {
      id: true,
    },
  });

  // 2. Kunin ang total number of active employees para malaman ang ABSENT
  const totalEmployees = await prisma.employee.count({
    where: { status: { not: 'TERMINATED' } }
  });

  // 3. I-format ang data para madaling basahin ng Frontend (Charts)
  const summary = {
    present: stats.find(s => s.status === 'PRESENT')?._count.id || 0,
    late: stats.find(s => s.status === 'LATE')?._count.id || 0,
    onLeave: stats.find(s => s.status === 'ON_LEAVE')?._count.id || 0,
    totalEmployees,
  };

  // Compute absent: Total - (Present + Late + OnLeave)
  const totalLoggedToday = summary.present + summary.late + summary.onLeave;
  const absent = totalEmployees - totalLoggedToday;

  sendResponse(res, 200, { ...summary, absent }, "Dashboard summary retrieved!");
});