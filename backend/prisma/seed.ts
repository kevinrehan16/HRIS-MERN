import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Import bcrypt para sa hashing

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 0. I-hash muna ang password bago i-save sa database
  const hashedPassword = await bcrypt.hash('kevin123', 10);

  // 1. Seed Department at i-save sa variable na 'dept'
  const dept = await prisma.department.upsert({
    where: { name: 'IT' },
    update: {},
    create: { name: 'IT' },
  });

  // 2. Seed Position at i-save sa variable na 'pos'
  const pos = await prisma.position.upsert({
    where: { title: 'Software Engineer' },
    update: {},
    create: { title: 'Software Engineer', description: 'Development team' },
  });

  // 3. Gawa tayo ng Admin Employee (Dito na papasok yung dept at pos)
  await prisma.employee.upsert({
    where: { email: 'kevin@hris.com' },
    update: {
      role: 'ADMIN', // Siguraduhin nating Admin siya
      password: hashedPassword, // I-update din ang password sakaling nag-e-exist na
    },
    create: {
      employeeId: 'ADM-001',
      firstName: 'Kevin',
      lastName: 'Macandog',
      email: 'kevin@hris.com',
      password: hashedPassword, // <--- Naka-hash na ang password dito!
      role: 'ADMIN', 
      departmentId: dept.id,    // <--- DITO GAGAMITIN YUNG DEPT
      positionId: pos.id        // <--- DITO GAGAMITIN YUNG POS
    }
  });

  console.log('Seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });