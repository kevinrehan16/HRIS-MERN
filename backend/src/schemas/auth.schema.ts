import * as z from 'zod';

export const registerSchema = z.object({
  body: z.object({ // DAPAT MAY 'body' DITO
    employeeId: z.string().min(1, "Employee ID is required"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    departmentId: z.preprocess((val) => 
      (val === "" || val === undefined) ? undefined : Number(val), 
      z.number().optional()
    ),
    positionId: z.preprocess((val) => 
      (val === "" || val === undefined) ? undefined : Number(val), 
      z.number().optional()
    ),
    // Basic Salary (Float/Decimal sa Prisma)
    // Ginagamitan din ng preprocess para kung galing sa form as string, maging number
    basicSalary: z.preprocess((val) => (val ? Number(val) : 0), z.number().min(0).optional()),
    
    // Status (Kung gusto mong i-set agad)
    status: z.enum(['PROBATIONARY', 'REGULAR', 'TERMINATED', 'RESIGNED']).optional(),
  }),
});