import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/response.handler';

export const validate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = (error as any).errors.map((issue: any) => ({
        message: `${issue.path.join('.')} is ${issue.message.toLowerCase()}`,
      }));
      return ApiResponse.error(res, 'Invalid input data', errorMessages, 400);
    }
    return ApiResponse.error(res, 'Internal Server Error', null, 500);
  }
};
