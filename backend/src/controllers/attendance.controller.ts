import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';

import { getAdminAttendanceLogs } from '../services/attendance.service.js';

import { getPHTTime, getPHStartOfDay } from '../utils/dateHelpers.js';
import { AppError } from '../utils/AppError.js';

export const timeIn = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.body;
  
  // 1. Precise PH Time Handling
  const phNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));
  const dateString = phNow.toISOString().split('T')[0];
  const phToday = new Date(`${dateString}T00:00:00.000Z`);

  // 2. Fetch Employee with Schedule
  const employee = await prisma.employee.findUnique({
    where: { id: Number(employeeId) },
    include: { schedule: true }
  });

  if (!employee || !employee.schedule) {
    return res.status(400).json({ success: false, message: "No schedule assigned." });
  }

  // 3. Check if already timed in for today
  const existing = await prisma.attendance.findUnique({
    where: { 
      employeeId_date: { 
        employeeId: Number(employeeId), 
        date: phToday 
      } 
    }
  });

  if (existing) {
    return res.status(400).json({ success: false, message: "Already timed in today!" });
  }

  // 4. LATE DETECTION with GRACE PERIOD
  const { shiftStart: sStart, gracePeriod } = employee.schedule;
  const [sHour, sMin] = sStart.split(':').map(Number);
  
  const targetStart = new Date(phToday);
  targetStart.setUTCHours(sHour, sMin, 0, 0);

  // Threshold = Shift Start + Grace Period (e.g., 8:00 + 15 mins = 8:15)
  const lateThreshold = new Date(targetStart.getTime() + (gracePeriod * 60 * 1000));

  let lateMins = 0;
  let status: 'PRESENT' | 'LATE' = 'PRESENT';
  let remarks = null;

  // Kung ang current time ay lumampas na sa "allowable" threshold
  if (phNow > lateThreshold) {
    // Ang compute ng late ay balik sa original shift start
    lateMins = Math.floor((phNow.getTime() - targetStart.getTime()) / 60000);
    status = 'LATE';
    remarks = `Late by ${lateMins} mins (Exceeded ${gracePeriod}m grace period)`;
  } else if (phNow > targetStart) {
    // Pumasok siya AFTER ng shift start pero WITHIN grace period
    remarks = `Arrived at ${phNow.toISOString().substr(11, 5)} (Within grace period)`;
  }

  // 5. Save Record
  const newRecord = await prisma.attendance.create({
    data: {
      employeeId: Number(employeeId),
      date: phToday,
      timeIn: phNow,
      status,
      lateMinutes: lateMins,
      remarks
    }
  });

  res.status(201).json({ 
    success: true, 
    message: status === 'LATE' ? "Timed in with late." : "Timed in successfully.",
    data: newRecord 
  });
});

export const timeOut = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.body;
  const phNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));

  const attendance = await prisma.attendance.findFirst({
    where: { employeeId: Number(employeeId), timeOut: null },
    orderBy: { date: 'desc' },
    include: { employee: { include: { schedule: true } } }
  });

  if (!attendance) return res.status(400).json({ success: false, message: "No active time-in found." });

  const schedule = attendance.employee.schedule;
  let undertimeMins = 0;
  let otMins = 0;
  let otStatus = 'NONE';
  let finalRemarks = attendance.remarks || "";

  if (schedule) {
    const [eHour, eMin] = schedule.shiftEnd.split(':').map(Number);
    const [sHour, sMin] = schedule.shiftStart.split(':').map(Number);
    let shiftEnd = new Date(attendance.date);
    shiftEnd.setUTCHours(eHour, eMin, 0, 0);

    if (eHour < sHour) shiftEnd.setDate(shiftEnd.getDate() + 1); // Night Shift

    // 1. UNDERTIME & OVERTIME LOGIC
    if (phNow < shiftEnd) {
      undertimeMins = Math.floor((shiftEnd.getTime() - phNow.getTime()) / 60000);
    } else if (phNow > shiftEnd) {
      const diff = Math.floor((phNow.getTime() - shiftEnd.getTime()) / 60000);
      if (diff >= 30) { // Minimum 30 mins to consider as Pending OT
        otMins = diff;
        otStatus = 'PENDING';
      }
    }

    // 2. LUNCH BREAK DEDUCTION LOGIC (Internal display/logging only for now)
    const stayMins = Math.floor((phNow.getTime() - attendance.timeIn.getTime()) / 60000);
    const breakDeduction = stayMins > 300 ? schedule.breakDuration : 0;
    const netWorkMins = stayMins - breakDeduction;
    
    finalRemarks = `${finalRemarks} | Net Work: ${Math.floor(netWorkMins / 60)}h ${netWorkMins % 60}m`.trim();
  }

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      timeOut: phNow,
      undertimeMinutes: undertimeMins,
      isUndertime: undertimeMins > 0,
      overtimeMinutes: otMins,
      otStatus: otStatus as any,
      remarks: finalRemarks
    }
  });

  res.status(200).json({ success: true, data: updated });
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

export const approveOvertime = catchAsync(async (req: Request, res: Response) => {
  const { attendanceId, status, remarks } = req.body; // Added remarks para sa rejection reason

  // 1. Validation: Siguraduhin na valid ang status na pinasa
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value." });
  }

  // 2. Hanapin ang attendance record
  const attendance = await prisma.attendance.findUnique({
    where: { id: Number(attendanceId) },
    include: { employee: true } // Isama na natin para sa audit log o notifications later
  });

  if (!attendance) {
    return res.status(404).json({ success: false, message: "Attendance record not found." });
  }

  // 3. Check if may OT nga ba talaga
  // Ginagamit natin ang 'NONE' status para sa mga records na saktong log-out lang
  if (attendance.otStatus === 'NONE' || attendance.overtimeMinutes <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: "This record has no overtime duration to approve or reject." 
    });
  }

  // 4. I-update ang status
  const updatedAttendance = await prisma.attendance.update({
    where: { id: Number(attendance.id) },
    data: { 
      otStatus: status,
      otRemarks: remarks || null, // Importante ito lalo na kung REJECTED
      // otApprovedBy: req.user.id // (Optional) Kung gusto mong i-track kung sinong Admin ang nag-approve
    }
  });

  // 5. Response
  res.status(200).json({ 
    success: true, 
    message: `Overtime for ${attendance.employee.firstName} has been ${status.toLowerCase()}.`,
    data: updatedAttendance 
  });
});

export const adjustAttendance = catchAsync(async (req: Request, res: Response) => {
  const { attendanceId, correctedTimeIn, correctedTimeOut, reason } = req.body;

  const attendance = await prisma.attendance.findUnique({
    where: { id: Number(attendanceId) },
    include: { employee: { include: { schedule: true } } }
  });

  if (!attendance || !attendance.employee.schedule) {
    return res.status(404).json({ success: false, message: "Record or Schedule not found." });
  }

  const schedule = attendance.employee.schedule;
  const tIn = correctedTimeIn ? new Date(correctedTimeIn) : attendance.timeIn;
  const tOut = correctedTimeOut ? new Date(correctedTimeOut) : attendance.timeOut;

  // A. LATE CALCULATION
  const [sHour, sMin] = schedule.shiftStart.split(':').map(Number);
  const targetStart = new Date(attendance.date);
  targetStart.setUTCHours(sHour, sMin, 0, 0);

  const lateThreshold = new Date(targetStart.getTime() + (schedule.gracePeriod * 60000));
  let lateMins = 0;
  let status: any = 'PRESENT';

  if (tIn > lateThreshold) {
    lateMins = Math.floor((tIn.getTime() - targetStart.getTime()) / 60000);
    status = 'LATE';
  }

  // B. REST DAY DETECTION
  const dayName = new Date(attendance.date).toLocaleDateString('en-US', { weekday: 'long' });
  if (schedule.restDays.includes(dayName)) {
    status = 'REST_DAY_WORK';
  }

  // C. UNDERTIME & OVERTIME
  let undertimeMins = 0;
  let overtimeMins = 0;
  let otStatus = 'NONE';

  if (tOut) {
    const [eHour, eMin] = schedule.shiftEnd.split(':').map(Number);
    let targetEnd = new Date(attendance.date);
    targetEnd.setUTCHours(eHour, eMin, 0, 0);

    if (eHour < sHour) targetEnd.setDate(targetEnd.getDate() + 1); // Night shift fix

    if (tOut < targetEnd) {
      undertimeMins = Math.floor((targetEnd.getTime() - tOut.getTime()) / 60000);
    } else if (tOut > targetEnd) {
      const approvedOT = await prisma.overtimeRequest.findFirst({
        where: { employeeId: attendance.employeeId, date: attendance.date, status: 'APPROVED' }
      });
      if (approvedOT) {
        overtimeMins = Math.floor((tOut.getTime() - targetEnd.getTime()) / 60000);
        otStatus = 'APPROVED';
      }
    }
  }

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      timeIn: tIn,
      timeOut: tOut,
      status,
      lateMinutes: lateMins,
      undertimeMinutes: undertimeMins,
      isUndertime: undertimeMins > 0,
      overtimeMinutes: overtimeMins,
      otStatus: otStatus as any,
      remarks: `[ADJUSTED] ${reason} | Prev: ${attendance.remarks || 'None'}`
    }
  });

  res.status(200).json({ success: true, data: updated });
});

export const getAdminAttendance = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.query; // Pwedeng mag-pass ng ?date=2026-04-15

  const logs = await getAdminAttendanceLogs(date as string);

  // Stats calculation para sa Dashboard Cards
  const stats = {
    totalPresent: logs.length,
    lateArrivals: logs.filter(log => (log.lateMinutes || 0) > 0).length,
    noClockOut: logs.filter(log => !log.timeOut).length,
  };

  sendResponse(res, 200, { stats, logs }, "Attendance logs retrieved for admin.");
});

export const getPendingOvertime = catchAsync(async (req: Request, res: Response) => {
  const pendingOT = await prisma.attendance.findMany({
    where: {
      // Siguraduhin na ang 'overtimeMinutes' ay Int sa schema
      overtimeMinutes: {
        gt: 0,
      },
      // Siguraduhin na 'PENDING' ay valid value ng iyong otStatus Enum
      otStatus: 'PENDING',
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          employeeId: true,
          schedule: {
            select: {
              name: true,
              shiftStart: true,
              shiftEnd: true,
            }
          }
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: pendingOT,
  });
});