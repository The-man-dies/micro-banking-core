import { Request } from 'express';
import { JwtAdminPayload } from './admin.types';

declare module 'express' {
  export interface Request {
    admin?: JwtAdminPayload;
  }
}

export interface AuthRequest extends Request {
  admin?: JwtAdminPayload;
}
