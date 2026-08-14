export declare const getAdminAttendanceLogs: (date?: string) => Promise<{
    computedStatus: string;
    employee: {
        id: number;
        employeeId: string;
        firstName: string;
        lastName: string;
        position: {
            title: string;
        };
        schedule: {
            name: string;
            shiftStart: string;
            shiftEnd: string;
        };
    };
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
}[]>;
//# sourceMappingURL=attendance.service.d.ts.map