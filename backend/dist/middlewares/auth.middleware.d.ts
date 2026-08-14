import type { Request, Response, NextFunction } from 'express';
export declare const restrictTo: (...roles: string[]) => (req: any, res: Response, next: NextFunction) => void;
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.middleware.d.ts.map