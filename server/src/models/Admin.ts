import { getDbConnection } from "../services/database";
import logger from "../config/logger";
import bcrypt from 'bcrypt';
import { AdminType, AdminDto } from '../types/admin.types';

export interface AdminModel {
    create(adminDto: AdminDto): Promise<AdminType>;
    findByUsername(username: string): Promise<AdminType | null>;
    findById(id: number): Promise<AdminType | null>;
    update(id: number, data: Partial<AdminType>): Promise<AdminType | null>;
    updatePassword(username: string, password: string): Promise<void>;
    findByUsernameAndRefreshToken(username: string, token: string): Promise<AdminType | null>;
    clearRefreshToken(token: string): Promise<void>;
}

class Admin implements AdminModel {
    public async create(adminDto: AdminDto): Promise<AdminType> {
        const db = await getDbConnection();
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminDto.password, salt);

        const result = await db.run(
            'INSERT INTO Admin (username, password) VALUES (?, ?)',
            [adminDto.username, hashedPassword]
        );
        
        return {
            id: result.lastID!,
            username: adminDto.username,
            password: hashedPassword,
        };
    }

    public async findByUsername(username: string): Promise<AdminType | null> {
        const db = await getDbConnection();
        const admin = await db.get<AdminType>('SELECT * FROM Admin WHERE username = ?', [username]);
        return admin || null;
    }

    public async findById(id: number): Promise<AdminType | null> {
        const db = await getDbConnection();
        const admin = await db.get<AdminType>('SELECT * FROM Admin WHERE id = ?', [id]);
        return admin || null;
    }

    public async update(id: number, data: Partial<AdminType>): Promise<AdminType | null> {
        const db = await getDbConnection();
        const admin = await this.findById(id);
        if (!admin) return null;

        const updatedAdmin = { ...admin, ...data };

        // We should not update all fields, but for now let's just update refresh token
        // In a real app, you would have more specific update methods
        await db.run('UPDATE Admin SET refreshToken = ? WHERE id = ?', [updatedAdmin.refreshToken, id]);
        
        return updatedAdmin;
    }

    public async updatePassword(username: string, password: string): Promise<void> {
        const db = await getDbConnection();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.run('UPDATE Admin SET password = ? WHERE username = ?', [hashedPassword, username]);
    }

    public async findByUsernameAndRefreshToken(username: string, token: string): Promise<AdminType | null> {
        const db = await getDbConnection();
        const admin = await db.get<AdminType>('SELECT * FROM Admin WHERE username = ? AND refreshToken = ?', [username, token]);
        return admin || null;
    }

    public async clearRefreshToken(token: string): Promise<void> {
        const db = await getDbConnection();
        await db.run('UPDATE Admin SET refreshToken = NULL WHERE refreshToken = ?', [token]);
    }
}

export default new Admin();
