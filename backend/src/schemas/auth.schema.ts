import * as z from 'zod';

export const registerSchema = z.object({
  body: z.object({ // DAPAT MAY 'body' DITO
    employeeId: z.string().min(1, "Employee ID is required"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});