import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z.string().min(3, "Employee ID is too short"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email("Invalid corporate email"),
    departmentId: z.number().optional(),
  }),
});