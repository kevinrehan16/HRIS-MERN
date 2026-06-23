import prisma from "../config/db.js";
import { scheduleRepository } from "../repositories/schedule.repository.js";
import { AppError } from "../utils/AppError.js";

export const scheduleService = {
  createSchedule: async (scheduleData: {
    name: string;
    shiftStart: string;
    shiftEnd: string;
    gracePeriod?: number;
    breakDuration?: number;
    restDays?: string;
  }) => {
    // 1. Business Rule: Bawal ang magkaparehong pangalan ng shift
    const existingSchedule = await scheduleRepository.findByName(scheduleData.name);
    if (existingSchedule) {
      throw new AppError(`Schedule name '${scheduleData.name}' already exists.`, 400);
    }

    // 2. I-save sa database kung walang kapareho
    return await scheduleRepository.create(scheduleData);
  }
};