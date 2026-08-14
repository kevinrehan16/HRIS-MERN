import type { Request, Response } from 'express';
export declare const getNightDiffMinutes: (timeIn: Date, timeOut: Date) => number;
export declare const createPayrollPeriod: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const getPeriods: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const generatePayroll: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const approvePayroll: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const markAsPaid: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const voidPayroll: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const getMyPayrolls: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const getPayrollSummary: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const getAllPayrolls: (req: Request, res: Response, next: import("express").NextFunction) => any;
//# sourceMappingURL=payroll.controller.d.ts.map