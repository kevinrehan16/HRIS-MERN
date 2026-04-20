import prisma from "../config/db.js";

export const getAdminAttendanceLogs = async (date?: string) => {
  const targetDate = date ? new Date(date) : new Date();
  
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const logs = await prisma.attendance.findMany({
    where: {
      OR: [
        {
          date: { gte: startOfDay, lte: endOfDay },
        },
        {
          timeOut: null,
          status: { not: 'ABSENT' } // IWASAN: Huwag isama ang absent sa "Active" pool
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
          schedule: {
            select: {
              name: true,
              shiftStart: true, // e.g., "08:00 AM"
              shiftEnd: true    // e.g., "05:00 PM"
            }
          },
          position: { select: { title: true } }
        },
      },
    },
    orderBy: { timeIn: 'desc' },
  });

  const enrichedLogs = logs.map(log => {
    let computedStatus = "COMPLETED";
    
    // Check natin kung pumasok talaga (PRESENT o LATE)
    const isPresent = log.status === 'PRESENT' || log.status === 'LATE';
    const logDate = new Date(log.date).toDateString(); // Mas safe gamitin yung 'date' column
    const today = new Date().toDateString();

    if (log.status === 'ABSENT') {
      computedStatus = "ABSENT";
    } else if (log.status === 'ON_LEAVE') {
      computedStatus = "ON_LEAVE";
    } else if (!log.timeOut && isPresent) {
      // Dito papasok yung Active monitoring
      computedStatus = logDate !== today ? "MISSING_OUT" : "ACTIVE";
    }

    return {
      ...log,
      computedStatus, 
    };
  });

  return enrichedLogs.sort((a, b) => {
    const priority: Record<string, number> = { 
      "MISSING_OUT": 1, 
      "ACTIVE": 2, 
      "COMPLETED": 3, 
      "ABSENT": 4, 
      "ON_LEAVE": 5 
    };
    return (priority[a.computedStatus] || 99) - (priority[b.computedStatus] || 99);
  });
};