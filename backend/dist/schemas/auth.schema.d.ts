import * as z from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        employeeId: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        middleName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        extensionName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        email: z.ZodString;
        password: z.ZodString;
        birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        gender: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
        }>>>;
        civilStatus: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            SINGLE: "SINGLE";
            MARRIED: "MARRIED";
            WIDOWED: "WIDOWED";
            SEPARATED: "SEPARATED";
        }>>>;
        contactNo: z.ZodString;
        tinNo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sssNo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        philhealthNo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pagibigNo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        departmentId: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>;
        positionId: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>;
        scheduleId: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>;
        status: z.ZodOptional<z.ZodEnum<{
            REGULAR: "REGULAR";
            PROBATIONARY: "PROBATIONARY";
            CONTRACTUAL: "CONTRACTUAL";
            TERMINATED: "TERMINATED";
        }>>;
        employmentType: z.ZodOptional<z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            PROJECT_BASED: "PROJECT_BASED";
            INTERN: "INTERN";
        }>>;
        basicSalary: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>;
        allowance: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>>;
        leaveCredits: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>>;
        bankAccountNo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bankName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        emergencyContact: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        emergencyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        emergencyRelation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        managerId: z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>;
        profileImage: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEmployeeSchema: z.ZodObject<{
    body: z.ZodObject<{
        employeeId: z.ZodOptional<z.ZodString>;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        middleName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        extensionName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        email: z.ZodOptional<z.ZodString>;
        birthDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        gender: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
        }>>>>;
        civilStatus: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            SINGLE: "SINGLE";
            MARRIED: "MARRIED";
            WIDOWED: "WIDOWED";
            SEPARATED: "SEPARATED";
        }>>>>;
        contactNo: z.ZodOptional<z.ZodString>;
        tinNo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        sssNo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        philhealthNo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        pagibigNo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        departmentId: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>>;
        positionId: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>>;
        scheduleId: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>>;
        status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            REGULAR: "REGULAR";
            PROBATIONARY: "PROBATIONARY";
            CONTRACTUAL: "CONTRACTUAL";
            TERMINATED: "TERMINATED";
        }>>>;
        employmentType: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            PROJECT_BASED: "PROJECT_BASED";
            INTERN: "INTERN";
        }>>>;
        basicSalary: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>>;
        allowance: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>>>;
        leaveCredits: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodNumber>>>;
        bankAccountNo: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        bankName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        emergencyContact: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        emergencyName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        emergencyRelation: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        managerId: z.ZodOptional<z.ZodPipe<z.ZodTransform<number, unknown>, z.ZodOptional<z.ZodNumber>>>;
        profileImage: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        password: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=auth.schema.d.ts.map