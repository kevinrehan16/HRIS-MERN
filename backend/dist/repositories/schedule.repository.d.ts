export declare const scheduleRepository: {
    findByName: (name: string) => Promise<{
        id: number;
        name: string;
        shiftStart: string;
        shiftEnd: string;
        gracePeriod: number;
        breakDuration: number;
        restDays: string;
    }>;
    create: (data: {
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
//# sourceMappingURL=schedule.repository.d.ts.map