import type { Request, Response } from 'express';
// import { differenceInMinutes, parse } from 'date-fns';

import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
import { sendNotification } from '../services/notification.service.js';

export const getCorrectionRequests = catchAsync(async (req, res) => {
  const { status = 'PENDING' } = req.query;

  const requests = await prisma.attendanceCorrection.findMany({
    where: {
      status: status as any,
      // Sa TypeScript, ganito ang "Relation must exist" check
      attendance: {
        is: {
          id: { not: undefined } // O kaya kahit anong field na sure na meron
        }
      }
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeId: true,
        }
      },
      attendance: {
        select: {
          timeIn: true,
          timeOut: true,
          date: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  sendResponse(res, 200, requests, `Fetched ${requests.length} correction requests`);
});

// SA CONTROLLER MO
export const createCorrectionRequest = catchAsync(async (req, res) => {
  const { attendanceId, requestedTimeIn, requestedTimeOut, reason } = req.body;
  
  // DIRECT CONVERSION: Huwag nang gumamit ng fromZonedTime
  // Dahil ang string mula sa frontend ay "21:30...Z" na, 
  // babasahin ito ni Prisma as-is.
  const parseToDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr); 
  };

  const newRequest = await prisma.attendanceCorrection.create({
    data: {
      attendanceId,
      employeeId: req.user.id,
      type: (requestedTimeIn && requestedTimeOut) ? 'BOTH' : requestedTimeIn ? 'TIME_IN' : 'TIME_OUT',
      requestedTimeIn: parseToDate(requestedTimeIn),
      requestedTimeOut: parseToDate(requestedTimeOut),
      reason,
      status: 'PENDING'
    }
  });

  sendResponse(res, 201, newRequest, "Created successfully");
});

export const approveCorrection = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { adminRemarks } = req.body;

  const correction = await prisma.attendanceCorrection.findUnique({
    where: { id: Number(id) },
    include: { 
      attendance: true,
      employee: { include: { schedule: true } }
    }
  });

  if (!correction || correction.status !== 'PENDING') return next(new AppError('Request not found', 404));
  const { attendance, employee } = correction;
  const schedule = employee.schedule;

  // 1. Helper: Panatilihin ang original date, palitan lang ang oras
  const mergeTimeWithOriginalDate = (originalDate: Date, newTimeSource: Date | null) => {
    if (!newTimeSource) return originalDate;
    const updated = new Date(originalDate);
    // Gagamit ng UTC para consistent sa ISO strings ng database
    updated.setUTCHours(newTimeSource.getUTCHours(), newTimeSource.getUTCMinutes(), 0, 0);
    return updated;
  };

  const finalTimeIn = mergeTimeWithOriginalDate(attendance.timeIn, correction.requestedTimeIn);
  const finalTimeOut = mergeTimeWithOriginalDate(attendance.timeOut || attendance.timeIn, correction.requestedTimeOut);

  // 2. Helper: Calculation of Minutes from midnight
  const getMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();
  const parseShiftMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  let lateMinutes = 0;
  let undertimeMinutes = 0;
  let overtimeMinutes = 0;
  let status = 'PRESENT';
  let otStatus = 'NONE';

  // --- LATE CHECK ---
  const actualInMin = getMinutes(finalTimeIn);
  const expectedInMin = parseShiftMinutes(schedule.shiftStart);
  if (actualInMin > (expectedInMin + (schedule.gracePeriod || 0))) {
    lateMinutes = actualInMin - expectedInMin;
    status = 'LATE';
  } else {
    lateMinutes = 0;
    status = 'PRESENT';
  }

  // --- UNDERTIME & OVERTIME CHECK ---
  const actualOutMin = getMinutes(finalTimeOut);
  const expectedOutMin = parseShiftMinutes(schedule.shiftEnd);

  if (actualOutMin < expectedOutMin) {
    // UNDERTIME CASE: Mas maaga umuwi sa schedule
    undertimeMinutes = expectedOutMin - actualOutMin;
    overtimeMinutes = 0;
    otStatus = 'NONE';
  } else if (actualOutMin > expectedOutMin) {
    // OVERTIME CASE: Lumagpas sa schedule
    undertimeMinutes = 0;
    overtimeMinutes = actualOutMin - expectedOutMin;
    otStatus = 'PENDING'; // I-set sa PENDING para i-approve ni Admin sa OT module
  } else {
    // EXACTLY ON TIME: Saktong labasan
    undertimeMinutes = 0;
    overtimeMinutes = 0;
    otStatus = 'NONE';
  }

  // 3. TRANSACTION UPDATE
  await prisma.$transaction([
    prisma.attendance.update({
      where: { id: correction.attendanceId },
      data: {
        timeIn: finalTimeIn,
        timeOut: finalTimeOut,
        lateMinutes: lateMinutes,
        undertimeMinutes: undertimeMinutes,
        overtimeMinutes: overtimeMinutes, // <--- Heto na siya!
        isUndertime: undertimeMinutes > 0,
        status: status as any,
        otStatus: otStatus as any, 
      },
    }),
    prisma.attendanceCorrection.update({
      where: { id: Number(id) },
      data: { 
        status: 'APPROVED', 
        adminRemarks: adminRemarks || 'Approved and metrics recomputed' 
      },
    }),  
  ]);
  
  sendNotification(
    correction.employeeId,
    'Correction Approved',
    `Your request for Attendance Correction has been approved.`
  ).catch(console.error)

  sendResponse(res, 200, null, 'Attendance and Overtime recomputed and approved!');
});

export const rejectCorrection = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { adminRemarks } = req.body;

  await prisma.attendanceCorrection.update({
    where: { id: Number(id) },
    data: {
      status: 'REJECTED',
      adminRemarks: adminRemarks || 'Rejected by Admin',
    },
  });

  sendResponse(res, 200, null, 'Correction request rejected successfully');
});