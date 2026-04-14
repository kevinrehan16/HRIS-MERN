import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { getPHTTime, getPHStartOfDay } from '../utils/dateHelpers.js';
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
// backend/src/controllers/attendance.controller.ts

export const timeIn = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.body;

  // 1. Kunin ang petsa ngayon sa PH (YYYY-MM-DD)
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Manual offset to PH
  const dateString = phTime.toISOString().split('T')[0]; // Result: "2026-04-15"

  // 2. Gumawa ng strict Range para sa "TODAY" (Local Time)
  const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

  // 3. Hanapin kung may record na sa loob ng range na 'to
  const existing = await prisma.attendance.findFirst({
    where: {
      employeeId: Number(employeeId),
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  if (existing) {
    // Para sa debugging, i-log natin kung anong record ang nakita niya
    console.log("Found existing record:", existing);
    return res.status(400).json({
      success: false,
      message: "You have already timed in for today!"
    });
  }

  // 4. Kung wala, proceed sa pag-save
  const newRecord = await prisma.attendance.create({
    data: {
      employeeId: Number(employeeId),
      timeIn: phTime,
      date: startOfDay, // I-save natin bilang 00:00:00 para madaling i-filter sa summary
      status: 'PRESENT'
    }
  });

  res.status(201).json({
    success: true,
    message: "Time-in successful!",
    data: newRecord
  });
});

export const timeOut = catchAsync(async (req: Request, res: Response) => {
  // 1. Kunin ang ID mula sa body (Face Match result)
  const { employeeId } = req.body;

  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Manual offset to PH
  const dateString = phTime.toISOString().split('T')[0]; // Result: "2026-04-15"

  const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

  // 2. Hanapin ang existing Time In record ngayong araw
  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId: Number(employeeId),
      date: {
        gte: startOfDay,
        lte: endOfDay
      },
      timeOut: null // Siguraduhin na hindi pa siya nag-timeout
    }
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: "No Time-in record found for today, or you already timed out."
    });
  }

  // 3. Update the record with Time Out
  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      timeOut: phTime,
    }
  });

  res.status(200).json({
    success: true,
    message: "Time-out successful!",
    data: updatedAttendance
  });
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