import bcrypt from "bcryptjs";
import { prisma } from "../services/prisma";
import { databaseService } from "../services/database";
import logger from "../config/logger";
import { AdminDto, AdminType } from "../types/admin.types";

export interface AdminModel {
  create(adminDto: AdminDto): Promise<AdminType>;
  findById(id: number): Promise<AdminType | null>;
  findByUsername(username: string): Promise<AdminType | null>;
  update(id: number, adminDto: AdminDto): Promise<AdminType>;
  delete(id: number): Promise<void>;
  updateRefreshToken(id: number, token: string | null): Promise<void>;
  findByUsernameAndRefreshToken(
    username: string,
    token: string,
  ): Promise<AdminType | null>;
  clearRefreshToken(token: string): Promise<void>;
  exists(): Promise<boolean>;
}

class Admin implements AdminModel {
  public async exists(): Promise<boolean> {
    try {
      const count = await prisma.admin.count();
      return count > 0;
    } catch (error) {
      logger.error("Failed to check if admin exists", { error });
      throw error;
    }
  }

  public async create(adminDto: AdminDto): Promise<AdminType> {
    try {
      if (!adminDto.password) {
        throw new Error("Password is required for creation");
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminDto.password, salt);
      const fiscalYear = await databaseService.getCurrentFiscalYear();

      const admin = await prisma.admin.create({
        data: {
          username: adminDto.username,
          password: hashedPassword,
          createdFiscalYear: fiscalYear,
        },
      });

      return admin as AdminType;
    } catch (error) {
      logger.error("Failed to create admin", { error });
      throw error;
    }
  }

  public async findById(id: number): Promise<AdminType | null> {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id },
      });
      return admin as AdminType | null;
    } catch (error) {
      logger.error("Failed to find admin by id", { error });
      throw error;
    }
  }

  public async findByUsername(username: string): Promise<AdminType | null> {
    try {
      const admin = await prisma.admin.findUnique({
        where: { username },
      });
      return admin as AdminType | null;
    } catch (error) {
      logger.error("Failed to find admin by username", { error });
      throw error;
    }
  }

  public async update(id: number, adminDto: AdminDto): Promise<AdminType> {
    try {
      const data: any = { username: adminDto.username };
      if (adminDto.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(adminDto.password, salt);
      }

      const admin = await prisma.admin.update({
        where: { id },
        data,
      });
      return admin as AdminType;
    } catch (error) {
      logger.error("Failed to update admin", { error });
      throw error;
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await prisma.admin.delete({
        where: { id },
      });
    } catch (error) {
      logger.error("Failed to delete admin", { error });
      throw error;
    }
  }

  public async updateRefreshToken(
    id: number,
    token: string | null,
  ): Promise<void> {
    try {
      await prisma.admin.update({
        where: { id },
        data: { refreshToken: token },
      });
    } catch (error) {
      logger.error("Failed to update refresh token", { error });
      throw error;
    }
  }

  public async findByUsernameAndRefreshToken(
    username: string,
    token: string,
  ): Promise<AdminType | null> {
    try {
      const admin = await prisma.admin.findFirst({
        where: {
          username,
          refreshToken: token,
        },
      });
      return admin as AdminType | null;
    } catch (error) {
      logger.error("Failed to find admin by username and refresh token", {
        error,
      });
      throw error;
    }
  }

  public async clearRefreshToken(token: string): Promise<void> {
    try {
      await prisma.admin.updateMany({
        where: { refreshToken: token },
        data: { refreshToken: null },
      });
    } catch (error) {
      logger.error("Failed to clear refresh token", { error });
      throw error;
    }
  }
}

export default new Admin();
