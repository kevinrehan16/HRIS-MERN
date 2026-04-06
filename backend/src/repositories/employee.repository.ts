import prisma from '../config/db.js'; // Gamitin ang shared instance
import type { Employee, Prisma } from '@prisma/client';

export const findEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  return await prisma.employee.findUnique({ where: { email } });
};

export const createEmployee = async (data: Prisma.EmployeeCreateInput): Promise<Employee> => {
  return await prisma.employee.create({ data });
};

export const findAllEmployees = async (page: number, limit: number, search?: string, deptId?: string) => {
  const skip = (page - 1) * limit;
  // Gumawa ng dynamic conditions array
  const conditions: any[] = [];

  // Search Logic
  if (search && search.trim() !== "") {
    conditions.push({
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeId: { contains: search } },
      ],
    });
  }

  // Department Logic - Wag isama kung empty string o undefined
  if (deptId && deptId !== "" && deptId !== "undefined") {
    conditions.push({ departmentId: Number(deptId) });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      include: { department: true, position: true },
      orderBy: { id: 'desc' },
    }),
    prisma.employee.count({ where }),
  ]);

  return { employees, total, totalPages: Math.ceil(total / limit) };
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

export const deleteEmployee = async (id: number) => {
  await prisma.employee.delete({ where: { id } });
}