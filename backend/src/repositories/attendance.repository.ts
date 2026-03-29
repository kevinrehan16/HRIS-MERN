import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const logTimeIn = async (employeeId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // I-set sa simula ng araw

  return await prisma.attendance.create({
    data: {
      employeeId,
      date: today,
      timeIn: new Date(),
    },
  });
};

export const logTimeOut = async (employeeId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.attendance.update({
    where: {
      employeeId_date: {
        employeeId,
        date: today,
      },
    },
    data: {
      timeOut: new Date(),
    },
  });
};