import { Request } from 'express';
import { JwtAdminPayload } from './admin.types';
import { ClientType } from '../models/Client';

declare module 'express' {
  export interface Request {
    admin?: JwtAdminPayload;
    client?: ClientType;
  }
}

export interface AuthRequest extends Request {
  admin?: JwtAdminPayload;
  client?: ClientType;
}
