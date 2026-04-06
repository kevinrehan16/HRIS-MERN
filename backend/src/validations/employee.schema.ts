import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z.string().min(3, "Employee ID is too short"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email("Invalid corporate email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    // Coerce = tina-try i-convert yung string to number para hindi mag-fail
    departmentId: z.coerce.number().optional().nullable(),
    positionId: z.coerce.number().optional().nullable(),
    
    // Bonus: Kung gusto mo ring i-validate ang Salary kung sakali
    basicSalary: z.coerce.number().default(0.0),
    status: z.enum(['PROBATIONARY', 'REGULAR', 'TERMINATED', 'RESIGNED']).optional(),
  }),
});