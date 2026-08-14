export declare const logTimeIn: (employeeId: number) => Promise<{
    id: number;
    date: Date;
    employeeId: number;
    status: import("@prisma/client").$Enums.AttendanceStatus;
    timeIn: Date;
    timeOut: Date | null;
    lateMinutes: number;
    undertimeMinutes: number;
    isUndertime: boolean;
    overtimeMinutes: number;
    otStatus: import("@prisma/client").$Enums.OTStatus;
    remarks: string | null;
    otApprovedBy: string | null;
    otRemarks: string | null;
}>;
export declare const logTimeOut: (employeeId: number) => Promise<{
    id: number;
    date: Date;
    employeeId: number;
    status: import("@prisma/client").$Enums.AttendanceStatus;
    timeIn: Date;
    timeOut: Date | null;
    lateMinutes: number;
    undertimeMinutes: number;
    isUndertime: boolean;
    overtimeMinutes: number;
    otStatus: import("@prisma/client").$Enums.OTStatus;
    remarks: string | null;
    otApprovedBy: string | null;
    otRemarks: string | null;
}>;
//# sourceMappingURL=attendance.repository.d.ts.map