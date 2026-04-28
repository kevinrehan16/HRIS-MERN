import * as z from 'zod';

export const registerSchema = z.object({
  body: z.object({
    // --- Basic Info ---
    employeeId: z.string().min(1, "Employee ID is required"),
    role: z.enum(['ADMIN', 'HR', 'EMPLOYEE']).default('EMPLOYEE'),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    middleName: z.string().optional().nullable(),
    extensionName: z.string().optional().nullable(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    
    // --- Personal Details ---
    birthDate: z.preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date().nullable().optional()),
    gender: z.string().optional().nullable(),
    civilStatus: z.string().optional().nullable(),
    contactNo: z.string().min(1, "Contact Number is required"),

    // --- Government / Statutory IDs ---
    tinNo: z.string().optional().nullable(),
    sssNo: z.string().optional().nullable(),
    philhealthNo: z.string().optional().nullable(),
    pagibigNo: z.string().optional().nullable(),

    // --- Employment Details (Numbers/IDs) ---
    departmentId: z.preprocess((val) => 
      (val === "" || val === undefined) ? undefined : Number(val), 
      z.number().min(1, "Department is required")
    ),
    positionId: z.preprocess((val) => 
      (val === "" || val === undefined) ? undefined : Number(val), 
      z.number().min(1, "Position is required")
    ),
    scheduleId: z.preprocess((val) => 
      (val === "" || val === undefined) ? undefined : Number(val), 
      z.number().min(1, "Schedule is required")
    ),

    // --- Financials & Credits ---
    status: z.enum(['PROBATIONARY', 'REGULAR', 'CONTRACTUAL', 'TERMINATED', 'RESIGNED']).default('PROBATIONARY'),
    employmentType: z.string().min(1, "Employment Type is required"),
    
    basicSalary: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)), 
      z.number({ invalid_type_error: "Basic Salary must be a number" })
        .gt(0, "Salary must be greater than 0") // Dito mahaharang ang 0 at negative
    ),
    allowance: z.preprocess(
      (val) => (val === "" || val === undefined ? 0 : Number(val)), 
      z.number()
        .min(0, "Allowance cannot be negative") // Dito okay lang ang 0, pero bawal negative
        .optional()
        .default(0)
    ),
    leaveCredits: z.preprocess((val) => (val === "" ? 15 : Number(val)), 
      z.number().min(0).default(15)
    ),
  }),
});

// Ito ang idadagdag mo sa ilalim:
export const updateEmployeeSchema = z.object({
  // Kinukuha natin yung shape ng 'body' mula sa registerSchema
  // at ginagawang optional ang lahat ng fields (.partial())
  body: registerSchema.shape.body.partial().extend({
    // Optional: Kung gusto mong i-override ang specific validation sa update, 
    // pwede mong ilagay dito. Pero usually .partial() lang ay sapat na.
    
    // Halimbawa: Kung ayaw mong gawing required ang password sa update:
    password: z.string().min(6).optional().or(z.literal("")),
  }),
});