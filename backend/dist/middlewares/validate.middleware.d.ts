import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
export declare const validate: (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=validate.middleware.d.ts.map