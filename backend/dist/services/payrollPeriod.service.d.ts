export declare const createPeriod: (data: {
    periodName: string;
    startDate: Date;
    endDate: Date;
    payoutDate: Date;
    payrollType?: string;
}) => Promise<{
    id: number;
    createdAt: Date;
    status: import("@prisma/client").$Enums.PeriodStatus;
    updatedAt: Date;
    startDate: Date;
    endDate: Date;
    periodName: string;
    payoutDate: Date;
    payrollType: string;
    progress: number;
}>;
export declare const getAllPeriods: () => Promise<{
    id: number;
    createdAt: Date;
    status: import("@prisma/client").$Enums.PeriodStatus;
    updatedAt: Date;
    startDate: Date;
    endDate: Date;
    periodName: string;
    payoutDate: Date;
    payrollType: string;
    progress: number;
}[]>;
export declare const getPeriodById: (id: number) => Promise<{
    id: number;
    createdAt: Date;
    status: import("@prisma/client").$Enums.PeriodStatus;
    updatedAt: Date;
    startDate: Date;
    endDate: Date;
    periodName: string;
    payoutDate: Date;
    payrollType: string;
    progress: number;
}>;
//# sourceMappingURL=payrollPeriod.service.d.ts.map