import type { Request, Response } from 'express';
/** Employee creation is intentionally an administrator-only route; public self-registration is not supported. */
export declare const register: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const logout: (req: Request, res: Response, next: import("express").NextFunction) => any;
export declare const getMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => any;
//# sourceMappingURL=auth.controller.d.ts.map