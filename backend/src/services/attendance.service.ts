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
      OR: [
        {
          // Condition 1: Lahat ng records sa piniling petsa
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        {
          // Condition 2: Lahat ng "Active" (Naka-Time In pero walang Time Out)
          // Kahit anong petsa pa sila nag-Time In, lilitaw sila rito
          timeOut: null, 
        }
      ],
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          position: {
            select: { title: true }
          }
        },
      },
    },
    orderBy: {
      timeIn: 'desc', 
    },
  });
};