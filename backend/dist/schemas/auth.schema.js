import * as z from 'zod';
const optionalText = z.string().trim().optional().nullable();
const optionalId = z.preprocess((value) => value === '' || value === undefined || value === null ? undefined : Number(value), z.number().int().positive().optional());
export const registerSchema = z.object({
    body: z.object({
        employeeId: z.string().trim().min(1, 'Employee ID is required'),
        firstName: z.string().trim().min(1, 'First name is required'),
        lastName: z.string().trim().min(1, 'Last name is required'),
        middleName: optionalText,
        extensionName: optionalText,
        email: z.string().trim().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        birthDate: optionalText,
        gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
        civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED']).optional().nullable(),
        contactNo: z.string().trim().min(1, 'Contact number is required'),
        tinNo: optionalText,
        sssNo: optionalText,
        philhealthNo: optionalText,
        pagibigNo: optionalText,
        departmentId: optionalId,
        positionId: optionalId,
        scheduleId: optionalId,
        status: z.enum(['PROBATIONARY', 'REGULAR', 'CONTRACTUAL', 'TERMINATED']).optional(),
        employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'PROJECT_BASED', 'INTERN']).optional(),
        basicSalary: z.preprocess((value) => Number(value ?? 0), z.number().min(0, 'Salary cannot be negative')),
        allowance: z.preprocess((value) => Number(value ?? 0), z.number().min(0, 'Allowance cannot be negative')).optional(),
        leaveCredits: z.preprocess((value) => value === '' || value === undefined ? 15 : Number(value), z.number().min(0)).optional(),
        bankAccountNo: optionalText,
        bankName: optionalText,
        emergencyContact: optionalText,
        emergencyName: optionalText,
        emergencyRelation: optionalText,
        managerId: optionalId,
        profileImage: optionalText,
    }),
});
export const updateEmployeeSchema = z.object({
    body: registerSchema.shape.body.partial().extend({
        password: z.string().min(8).optional().or(z.literal('')),
    }),
});
//# sourceMappingURL=auth.schema.js.map