import prisma from "../config/db.js";

export const getAdminAttendanceLogs = async (date?: string) => {
  // Kung walang pinasang date, default tayo sa current date today
  const targetDate = date ? new Date(date) : new Date();
  
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true, // e.g., "EMP-2026-001"
          // profilePicture: true,
          position: {
            select: { title: true }
          }
        },
      },
    },
    orderBy: {
      timeIn: 'desc', // Latest logs sa taas
    },
  });
};