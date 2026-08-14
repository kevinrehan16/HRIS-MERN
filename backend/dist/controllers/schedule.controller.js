import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { scheduleService } from '../services/schedule.service.js';
export const getSchedule = catchAsync(async (req, res) => {
    const schedules = await prisma.schedule.findMany({
        select: {
            id: true,
            name: true,
            shiftStart: true,
            shiftEnd: true
        },
        orderBy: { id: 'asc' }
    });
    sendResponse(res, 200, schedules, "Fetch List of Schedule.");
});
export const createNewSchedule = catchAsync(async (req, res) => {
    const { name, shiftStart, shiftEnd, gracePeriod, breakDuration, restDays } = req.body;
    const newSchedule = await scheduleService.createSchedule({
        name,
        shiftStart,
        shiftEnd,
        gracePeriod,
        breakDuration,
        restDays
    });
    sendResponse(res, 201, newSchedule, "Schedule created successfully!");
});
//# sourceMappingURL=schedule.controller.js.map