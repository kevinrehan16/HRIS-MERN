type LeaveCalendar = {
    startDate: Date;
    endDate: Date;
    isHalfDay: boolean;
    restDays: string;
    holidayDates: Date[];
};
export declare const parseDateOnly: (value: string, fieldName: string) => Date;
/** Calculates paid leave days using the employee's work calendar and company holidays. */
export declare const calculateLeaveDays: ({ startDate, endDate, isHalfDay, restDays, holidayDates }: LeaveCalendar) => number;
export {};
//# sourceMappingURL=leave.util.d.ts.map