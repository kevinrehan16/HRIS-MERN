import { z } from 'zod';
export declare const createEmployeeSchema: z.ZodObject<{
    body: z.ZodObject<{
        employeeId: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        departmentId: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        positionId: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        basicSalary: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        status: z.ZodOptional<z.ZodEnum<{
            REGULAR: "REGULAR";
            PROBATIONARY: "PROBATIONARY";
            TERMINATED: "TERMINATED";
            RESIGNED: "RESIGNED";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=employee.schema.d.ts.map