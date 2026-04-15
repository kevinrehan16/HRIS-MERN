import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isHoliday = async (date: Date): Promise<boolean> => {
  // Siguraduhin na ang date ay naka-format na YYYY-MM-DD 00:00:00 para mag-match sa DB
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const holiday = await prisma.holiday.findUnique({
    where: { date: startOfDay }
  });
  
  return !!holiday; // Returns true kung may nahanap, false kung wala
};

export const initAbsentJob = () => {
  // Tatakbo tuwing 11:59 PM (PH Time)
  // Cron expression: '59 23 * * *' (minute hour day month dayOfWeek)
  cron.schedule('59 23 * * *', async () => {
    console.log('--- 🕒 Checking for Absentees ---');
    
    try {
      const phNow = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));
      const dateString = phNow.toISOString().split('T')[0];
      const phToday = new Date(`${dateString}T00:00:00.000Z`);

      // 1. Check if Weekend or Holiday
      const dayOfWeek = phNow.getUTCDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun or Sat
      const holidayCheck = await isHoliday(phToday);

      if (isWeekend || holidayCheck) {
        console.log(`Skipping: Today is a ${holidayCheck ? 'Holiday' : 'Weekend'}.`);
        return;
      }

      // 2. Flow ng pag-mark ng Absent
      const employees = await prisma.employee.findMany({ 
        where: { 
          status: {
            not: 'TERMINATED' // Kunin lahat ng REGULAR, PROBATIONARY, at CONTRACTUAL
          }
        } 
      });

      for (const emp of employees) {
        const attendance = await prisma.attendance.findUnique({
          where: { employeeId_date: { employeeId: emp.id, date: phToday } }
        });

        if (!attendance) {
          await prisma.attendance.create({
            data: {
              employeeId: emp.id,
              date: phToday,
              timeIn: phToday,
              status: 'ABSENT',
              remarks: 'System Generated: No time-in record found.'
            }
          });
        }
      }
      console.log('--- ✅ Absent generation complete. ---');
    } catch (err) {
      console.error('Job Error:', err);
    }
  }, {
    timezone: "Asia/Manila"
  });
};