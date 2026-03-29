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

  // 1. Kunin ang Employee + Schedule (optional na ngayon)
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { schedule: true }
  });

  // 2. Fallback values kung walang schedule
  const shiftStartString = employee?.schedule?.shiftStart ?? "08:00";
  const gracePeriod = employee?.schedule?.gracePeriod ?? 0;

  // 3. Convert "08:00" to Date today
  const [hours, minutes] = shiftStartString.split(':').map(Number);
  const shiftStartTime = new Date();
  shiftStartTime.setHours(hours, minutes, 0, 0);

  // 4. Late threshold
  const lateThreshold = new Date(
    shiftStartTime.getTime() + gracePeriod * 60000
  );

  // 5. Determine status
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  // 6. Remarks (handle no schedule)
  let remarks = 'On time';
  if (status === 'LATE') {
    remarks = employee?.schedule
      ? `Late (Shift start: ${shiftStartString})`
      : 'Late (No schedule assigned)';
  }

  // 7. Save
  const attendance = await prisma.attendance.create({
    data: {
      employeeId,
      date: today,
      timeIn: now,
      status,
      remarks
    }
  });

  sendResponse(res, 201, attendance, `Clocked in successfully as ${status}`);
});

export const timeOut = catchAsync(async (req: any, res: Response) => {
  const employeeId = req.user.id;
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } }
  });

  if (!attendance) throw new AppError("No Time-In found!", 404);
  if (attendance.timeOut) throw new AppError("Already clocked out!", 400);

  // Logic: Kung ang Time Out ay bago mag 6:00 PM (Assuming 9am-6pm shift)
  const shiftEnd = new Date();
  shiftEnd.setHours(18, 0, 0, 0); // 6:00 PM

  const isUndertime = now < shiftEnd;

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      timeOut: now,
      remarks: isUndertime 
        ? `${attendance.remarks || ''} | Undertime`.trim() 
        : attendance.remarks
    },
  });

  sendResponse(res, 200, updated, "Clocked out successfully!");
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