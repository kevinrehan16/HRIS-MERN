import prisma from '../config/db.js';

export const createPeriod = async (data: {
  periodName: string;
  startDate: Date;
  endDate: Date;
  payoutDate: Date;
  payrollType?: string;
}) => {
  return await prisma.payrollPeriod.create({
    data: {
      periodName: data.periodName,
      startDate: data.startDate,
      endDate: data.endDate,
      payoutDate: data.payoutDate,
      payrollType: data.payrollType || "REGULAR",
      status: "OPEN" // Default status
    }
  });
};

// Dagdag mo na rin ito para makuha lahat ng periods sa dropdown sa future
export const getAllPeriods = async () => {
  return await prisma.payrollPeriod.findMany({
    orderBy: { startDate: 'desc' }
  });
};

export const getPeriodById = async (id: number) => {
  return await prisma.payrollPeriod.findUnique({
    where: { id }
  });
};