export declare const scheduleService: {
    createSchedule: (scheduleData: {
        name: string;
        shiftStart: string;
        shiftEnd: string;
        gracePeriod?: number;
        breakDuration?: number;
        restDays?: string;
    }) => Promise<{
        id: number;
        name: string;
        shiftStart: string;
        shiftEnd: string;
        gracePeriod: number;
        breakDuration: number;
        restDays: string;
    }>;
};
//# sourceMappingURL=schedule.service.d.ts.map