import prisma from '../config/db.js'; // Gamitin ang shared instance
import type { Employee, Prisma } from '@prisma/client';

export const scheduleRepository = {
  // Maghanap ng schedule gamit ang unique na pangalan
  findByName: async (name: string) => {
    return await prisma.schedule.findUnique({
      where: { name }
    });
  },

  // Mag-save ng bagong schedule sa database
  create: async (data: {
    name: string;
    shiftStart: string;
    shiftEnd: string;
    gracePeriod?: number;
    breakDuration?: number;
    restDays?: string;
  }) => {
    return await prisma.schedule.create({
      data
    });
  }
};