// server/src/types/admin.types.ts
import { JwtPayload } from 'jsonwebtoken';

export interface JwtAdminPayload extends JwtPayload {
    id: number;
    username: string;
}

export interface AdminType {
    id: number;
    username: string;
    password: string;
    refreshToken?: string | null;
    createdAt?: string;
}

// DTO for creating a new admin
export type AdminDto = Pick<AdminType, 'username' | 'password'>;
