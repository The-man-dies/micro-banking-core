import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response.handler";
import logger from "../config/logger";
import { JwtAdminPayload } from "../types/admin.types";
import { AuthRequest } from "../types/express.d";

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("x-auth-token");

  if (!token) {
    logger.warn("Authorization denied: No token provided.");
    return ApiResponse.unauthorized(res, "No token, authorization denied");
  }

  try {
    const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
    if (!jwtSecret) {
      logger.warn(
        "Server configuration error: JWT_ACCESS_TOKEN_SECRET is not defined.",
      );
      return ApiResponse.unauthorized(res, "Server configuration error");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtAdminPayload;
    req.admin = decoded; // Now req.admin will have the full JwtAdminPayload type.
    next();
  } catch (err) {
    logger.warn("Token validation failed.", { error: err });
    return ApiResponse.unauthorized(res, "Token is not valid");
  }
};
