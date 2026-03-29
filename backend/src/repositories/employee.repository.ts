import prisma from '../config/db.js'; // Gamitin ang shared instance
import type { Employee, Prisma } from '@prisma/client';

export const findEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  return await prisma.employee.findUnique({ where: { email } });
};

export const createEmployee = async (data: Prisma.EmployeeCreateInput): Promise<Employee> => {
  return await prisma.employee.create({ data });
};

export const findAllEmployees = async () => {
  return await prisma.employee.findMany({
    include: {
      department: { select: { name: true } },
      position: { select: { title: true } },
    },
  });
};

// Dagdagan na natin ng update para sa profile
export const updateEmployee = async (id: number, data: Prisma.EmployeeUpdateInput) => {
  return await prisma.employee.update({
    where: { id },
    data,
    include: {
      department: true,
      position: true,
    },
  });
};