import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing attendance para malinis ang test (Optional)
  await prisma.attendance.deleteMany({}); 

  const employees = [3, 4, 7]; // Palitan mo ng actual Employee IDs mo

  for (const empId of employees) {
    for (let day = 1; day <= 15; day++) {
      let timeIn = new Date(2026, 5, day, 8, 0, 0); // Default 8:00 AM
      let timeOut = new Date(2026, 5, day, 17, 0, 0); // Default 5:00 PM

      // Scenario Logic
      if (empId === 1) { // Juan: Late + Random OT
        timeIn = new Date(2026, 5, day, 8, 30, 0); // Lagi 8:30
        timeOut = new Date(2026, 5, day, 18, 0, 0); // OT until 6 PM
      } else if (empId === 2) { // Maria: OT Queen
        timeIn = new Date(2026, 5, day, 8, 0, 0);
        timeOut = new Date(2026, 5, day, 19, 0, 0); // OT until 7 PM
      } else if (empId === 3) { // Pedro: Undertime
        timeIn = new Date(2026, 5, day, 8, 0, 0);
        timeOut = new Date(2026, 5, day, 16, 0, 0); // UWI ng 4 PM
      }

      // Skip weekends (optional: Saturday/Sunday)
      const dayOfWeek = new Date(2026, 5, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      await prisma.attendance.create({
        data: {
          employeeId: empId,
          timeIn: timeIn,
          timeOut: timeOut,
          date: new Date(2026, 5, day),
        },
      });
    }
  }
  console.log("Attendance seeding complete! Check your database.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });