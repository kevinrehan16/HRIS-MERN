import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';

export const validate = (schema: z.AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        // I-log natin sa console para makita mo kung bakit undefined ang errors
        console.log("Zod Validation Error Result:", JSON.stringify(result.error, null, 2));

        return res.status(400).json({
          success: false,
          // Gagamit tayo ng flat() method ni Zod para mas safe kumuha ng message
          message: result.error.flatten().fieldErrors.body?.[0] || 
                   result.error.errors[0]?.message || 
                   "Validation Error",
        });
      }

      // ... logic for success
      req.body = result.data.body;
      next();
    } catch (error) {
      next(error);
    }
  };